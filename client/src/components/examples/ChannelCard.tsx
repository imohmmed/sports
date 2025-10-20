import ChannelCard from '../ChannelCard';

export default function ChannelCardExample() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <ChannelCard
          name="Bn Sport 1"
          qualities={[
            { quality: 'FHD', available: true },
            { quality: 'HD', available: true },
            { quality: 'LOW', available: true }
          ]}
          onClick={() => console.log('Channel clicked')}
        />
        <ChannelCard
          name="Bn Sport 2"
          qualities={[
            { quality: 'FHD', available: true },
            { quality: 'HD', available: true }
          ]}
          locked={true}
          onClick={() => console.log('Locked channel clicked')}
        />
        <ChannelCard
          name="Bn XTRA 1"
          qualities={[
            { quality: 'FHD', available: true },
            { quality: 'HD', available: true }
          ]}
          onClick={() => console.log('Channel clicked')}
        />
      </div>
    </div>
  );
}
