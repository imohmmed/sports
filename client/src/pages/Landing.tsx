import { useLocation } from "wouter";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
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
];

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero onGetStarted={() => setLocation('/auth')} />
        <ChannelGrid 
          channels={mockChannels} 
          locked={true}
          onChannelClick={() => setLocation('/auth')}
        />
      </main>
      <Footer />
    </div>
  );
}
