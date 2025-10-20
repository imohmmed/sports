import ChannelGrid from '../ChannelGrid';

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
];

export default function ChannelGridExample() {
  return (
    <div className="min-h-screen bg-background">
      <ChannelGrid
        channels={mockChannels}
        onChannelClick={(id) => console.log('Channel clicked:', id)}
      />
    </div>
  );
}
