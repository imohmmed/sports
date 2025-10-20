import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import ChannelGrid from "@/components/ChannelGrid";
import Footer from "@/components/Footer";

const mockChannels = [
  {
    id: '1',
    name: 'Bn Sport 1',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true },
      { quality: 'LOW', available: true }
    ]
  },
  {
    id: '2',
    name: 'Bn Sport 2',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true },
      { quality: 'LOW', available: true }
    ]
  },
  {
    id: '3',
    name: 'Bn Sport 3',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true },
      { quality: 'LOW', available: true }
    ]
  },
  {
    id: '4',
    name: 'Bn Sport 4',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true },
      { quality: 'LOW', available: true }
    ]
  },
  {
    id: '5',
    name: 'Bn Sport 5',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true },
      { quality: 'LOW', available: true }
    ]
  },
  {
    id: '6',
    name: 'Bn Sport 6',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true },
      { quality: 'LOW', available: true }
    ]
  },
  {
    id: '7',
    name: 'Bn Sport 7',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true },
      { quality: 'LOW', available: true }
    ]
  },
  {
    id: '8',
    name: 'Bn Sport 8',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true }
    ]
  },
  {
    id: '9',
    name: 'Bn Sport 9',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true }
    ]
  },
  {
    id: '10',
    name: 'Bn XTRA 1',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true }
    ]
  },
  {
    id: '11',
    name: 'Bn XTRA 2',
    qualities: [
      { quality: 'FHD', available: true },
      { quality: 'HD', available: true }
    ]
  },
  {
    id: '12',
    name: 'BN NPA',
    qualities: [
      { quality: 'HD', available: true }
    ]
  },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleChannelClick = (channelId: string) => {
    if (isSubscribed) {
      setLocation(`/player/${channelId}`);
    } else {
      console.log('Need subscription to watch');
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isAuthenticated={true}
        userEmail="user@example.com"
        isSubscribed={isSubscribed}
        onLogout={handleLogout}
      />
      
      <main className="flex-1">
        {!isSubscribed && (
          <div className="container mx-auto px-4 pt-6">
            <SubscriptionBanner />
          </div>
        )}
        
        <ChannelGrid 
          channels={mockChannels}
          locked={!isSubscribed}
          onChannelClick={handleChannelClick}
        />
      </main>
      
      <Footer />
    </div>
  );
}
