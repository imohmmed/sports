// Reference: Replit Auth integration blueprint - page level unauthorized handling
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import Header from "@/components/Header";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import ChannelGrid from "@/components/ChannelGrid";
import Footer from "@/components/Footer";

interface ChannelWithQualities {
  id: string;
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();
  const typedUser = user as User | undefined;

  // Redirect to login if not authenticated
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

  const { data: channels = [], isLoading: channelsLoading } = useQuery<ChannelWithQualities[]>({
    queryKey: ["/api/channels"],
    enabled: isAuthenticated,
  });

  const handleChannelClick = (channelId: string) => {
    if (typedUser?.isSubscribed) {
      setLocation(`/player/${channelId}`);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading || channelsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isAuthenticated={true}
        userEmail={typedUser?.email || ""}
        isSubscribed={typedUser?.isSubscribed || false}
        onLogout={handleLogout}
      />
      
      <main className="flex-1">
        {!typedUser?.isSubscribed && (
          <div className="container mx-auto px-4 pt-6">
            <SubscriptionBanner />
          </div>
        )}
        
        <ChannelGrid 
          channels={channels}
          locked={!typedUser?.isSubscribed}
          onChannelClick={handleChannelClick}
        />
      </main>
      
      <Footer />
    </div>
  );
}
