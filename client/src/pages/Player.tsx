import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ChannelServer {
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
}

interface Channel {
  id: string;
  name: string;
  category: string;
  servers: ChannelServer[];
}

export default function Player() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const channelId = params.id || "";
  const { toast } = useToast();
  const [currentServer, setCurrentServer] = useState<string>("main");
  const [currentQuality, setCurrentQuality] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string>("");

  // Get channel data
  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["/api/channels"],
  });

  const channel = channels.find(c => c.id === channelId);

  // Initialize quality when channel loads
  useEffect(() => {
    if (channel && channel.servers.length > 0 && !currentQuality) {
      // Find main server or use first available
      const mainServer = channel.servers.find(s => s.name === "main") || channel.servers[0];
      setCurrentServer(mainServer.name);
      
      // Set initial quality (prefer FHD > HD > first available)
      const preferredQualities = ["FHD", "HD", "LOW"];
      const availableQuality = preferredQualities.find(q => 
        mainServer.qualities.some(qual => qual.quality === q)
      ) || mainServer.qualities[0]?.quality;
      
      if (availableQuality) {
        setCurrentQuality(availableQuality);
      }
    }
  }, [channel, currentQuality]);

  // Fetch stream URL
  const fetchStreamMutation = useMutation({
    mutationFn: async ({ quality, server }: { quality: string; server: string }) => {
      const response = await apiRequest("GET", `/api/stream/${channelId}/${quality}?server=${server}`);
      return await response.json();
    },
    onSuccess: (data: any) => {
      setStreamUrl(data.url);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحميل البث",
        variant: "destructive",
      });
    },
  });

  // Fetch stream when quality or server changes
  useEffect(() => {
    if (channelId && currentQuality && currentServer) {
      fetchStreamMutation.mutate({ quality: currentQuality, server: currentServer });
    }
  }, [channelId, currentQuality, currentServer]);

  const handleQualityChange = (quality: string) => {
    setCurrentQuality(quality);
  };

  const handleServerChange = (server: string) => {
    setCurrentServer(server);
  };

  const handleBack = () => {
    setLocation("/");
  };

  if (!channel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">القناة غير موجودة</p>
          <Button onClick={handleBack} data-testid="button-back-home">
            <ArrowRight className="mr-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4 flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              رجوع
            </Button>
            <h1 className="text-2xl font-bold" data-testid="text-channel-name">{channel.name}</h1>
          </div>

          <VideoPlayer
            streamUrl={streamUrl}
            channelName={channel.name}
            servers={channel.servers}
            currentServer={currentServer}
            currentQuality={currentQuality}
            onQualityChange={handleQualityChange}
            onServerChange={handleServerChange}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
