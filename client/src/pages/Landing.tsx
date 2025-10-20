import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChannelGrid from "@/components/ChannelGrid";
import Footer from "@/components/Footer";

interface ChannelWithQualities {
  id: string;
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
}

export default function Landing() {
  const { data: channels = [] } = useQuery<ChannelWithQualities[]>({
    queryKey: ["/api/channels"],
  });

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleChannelClick = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero onGetStarted={handleGetStarted} />
        <ChannelGrid 
          channels={channels} 
          locked={true}
          onChannelClick={handleChannelClick}
        />
      </main>
      <Footer />
    </div>
  );
}
