// Reference: Replit Auth integration blueprint - page level unauthorized handling
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StreamQuality {
  quality: string;
  url: string;
}

export default function Player() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const channelId = params.id || "";
  const { user, isLoading, isAuthenticated } = useAuth();
  const typedUser = user as User | undefined;
  const { toast } = useToast();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = useState<string>("FHD");
  const [streamUrl, setStreamUrl] = useState<string>("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Get channel data
  const { data: channels = [] } = useQuery<Array<{ id: string; name: string; qualities: Array<{ quality: string; available: boolean }> }>>({
    queryKey: ["/api/channels"],
    enabled: isAuthenticated,
  });

  const channel = channels.find(c => c.id === channelId);

  // Create viewing session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/session/create", { channelId });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setSessionToken(data.sessionToken);
    },
    onError: (error: Error) => {
      if (error.message.includes("409")) {
        toast({
          title: "Already Streaming",
          description: "You're already watching on another device. Please stop that stream first.",
          variant: "destructive",
        });
        setTimeout(() => setLocation("/"), 2000);
      } else {
        toast({
          title: "Error",
          description: "Failed to start stream session",
          variant: "destructive",
        });
      }
    },
  });

  // Fetch stream URL
  const fetchStreamMutation = useMutation({
    mutationFn: async (quality: string) => {
      const response = await apiRequest("GET", `/api/stream/${channelId}/${quality}`);
      return await response.json();
    },
    onSuccess: (data: any) => {
      setStreamUrl(data.url);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load stream",
        variant: "destructive",
      });
    },
  });

  // Initialize session and fetch stream
  useEffect(() => {
    if (isAuthenticated && typedUser?.isSubscribed && channelId && !sessionToken) {
      createSessionMutation.mutate();
    }
  }, [isAuthenticated, typedUser, channelId, sessionToken]);

  useEffect(() => {
    if (sessionToken && currentQuality) {
      fetchStreamMutation.mutate(currentQuality);
    }
  }, [sessionToken, currentQuality]);

  // Heartbeat
  useEffect(() => {
    if (!sessionToken) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        await apiRequest("POST", "/api/session/heartbeat", { sessionToken });
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [sessionToken]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (sessionToken) {
        apiRequest("POST", "/api/session/end", { sessionToken }).catch(console.error);
      }
    };
  }, [sessionToken]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleQualityChange = (quality: string) => {
    setCurrentQuality(quality);
  };

  if (isLoading || !channel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const availableQualities = channel.qualities.map(q => ({
    quality: q.quality,
    url: streamUrl,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isAuthenticated={true}
        userEmail={typedUser?.email || ""}
        isSubscribed={typedUser?.isSubscribed || false}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-6"
            data-testid="button-back-to-dashboard"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى القنوات
          </Button>
          
          {streamUrl ? (
            <VideoPlayer
              channelName={channel.name}
              qualities={availableQualities}
              onQualityChange={handleQualityChange}
            />
          ) : (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading stream...</p>
            </div>
          )}
          
          <div className="mt-8 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-foreground">حول القناة</h2>
            <p className="text-muted-foreground">
              {channel.name} - بث مباشر عالي الجودة لأهم مباريات كرة القدم العالمية
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
