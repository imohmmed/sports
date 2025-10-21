import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ChannelGrid from "@/components/ChannelGrid";
import Footer from "@/components/Footer";

interface ChannelWithQualities {
  id: string;
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
}

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: channels = [], isLoading } = useQuery<ChannelWithQualities[]>({
    queryKey: ["/api/channels"],
  });

  const handleChannelClick = (channelId: string) => {
    setLocation(`/player/${channelId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <ChannelGrid 
          channels={channels}
          locked={false}
          onChannelClick={handleChannelClick}
        />
      </main>
      
      <Footer />
    </div>
  );
}
