import { useLocation, useParams } from "wouter";
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const channelData: Record<string, { name: string; qualities: Array<{ quality: string; url: string }> }> = {
  '1': {
    name: 'Bn Sport 1',
    qualities: [
      { quality: 'FHD', url: 'encrypted-fhd-url' },
      { quality: 'HD', url: 'encrypted-hd-url' },
      { quality: 'LOW', url: 'encrypted-low-url' }
    ]
  },
  '2': {
    name: 'Bn Sport 2',
    qualities: [
      { quality: 'FHD', url: 'encrypted-fhd-url' },
      { quality: 'HD', url: 'encrypted-hd-url' },
      { quality: 'LOW', url: 'encrypted-low-url' }
    ]
  },
};

export default function Player() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const channelId = params.id || '1';
  const channel = channelData[channelId] || channelData['1'];

  const handleLogout = () => {
    console.log('Logout clicked');
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isAuthenticated={true}
        userEmail="user@example.com"
        isSubscribed={true}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="mb-6"
            data-testid="button-back-to-dashboard"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى القنوات
          </Button>
          
          <VideoPlayer
            channelName={channel.name}
            qualities={channel.qualities}
            onQualityChange={(quality) => console.log('Quality changed:', quality)}
          />
          
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
