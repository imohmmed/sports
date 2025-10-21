import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import Header from "@/components/Header";
import ChannelGrid from "@/components/ChannelGrid";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tv2, Newspaper } from "lucide-react";

interface ChannelServer {
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
}

interface ChannelWithQualities {
  id: string;
  name: string;
  category: string;
  servers: ChannelServer[];
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"sports" | "news">("sports");

  const { data: channels = [], isLoading } = useQuery<ChannelWithQualities[]>({
    queryKey: ["/api/channels"],
  });

  const handleChannelClick = (channelId: string) => {
    setLocation(`/player/${channelId}`);
  };

  // Filter channels by category
  const sportsChannels = channels.filter(c => c.category === "sports");
  const newsChannels = channels.filter(c => c.category === "news");

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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "sports" | "news")} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8" data-testid="tabs-category">
            <TabsTrigger value="sports" className="gap-2" data-testid="tab-sports">
              <Tv2 className="w-4 h-4" />
              قنوات رياضية ({sportsChannels.length})
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2" data-testid="tab-news">
              <Newspaper className="w-4 h-4" />
              قنوات إخبارية ({newsChannels.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sports" data-testid="content-sports">
            <ChannelGrid 
              channels={sportsChannels}
              locked={false}
              onChannelClick={handleChannelClick}
            />
          </TabsContent>

          <TabsContent value="news" data-testid="content-news">
            <ChannelGrid 
              channels={newsChannels}
              locked={false}
              onChannelClick={handleChannelClick}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
