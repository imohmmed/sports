import ChannelCard from "./ChannelCard";

interface Channel {
  id: string;
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
}

interface ChannelGridProps {
  channels: Channel[];
  locked?: boolean;
  onChannelClick?: (channelId: string) => void;
}

export default function ChannelGrid({ channels, locked, onChannelClick }: ChannelGridProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-in slide-in-from-top-5 duration-700">
        <h2 className="text-3xl font-bold text-foreground mb-2 transition-colors duration-300">القنوات المتاحة</h2>
        <p className="text-muted-foreground transition-colors duration-300">جميع قنوات بي إن سبورت بجودة عالية</p>
      </div>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        data-testid="grid-channels"
      >
        {channels.map((channel, index) => (
          <div 
            key={channel.id}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ChannelCard
              name={channel.name}
              qualities={channel.qualities}
              locked={locked}
              onClick={() => onChannelClick?.(channel.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
