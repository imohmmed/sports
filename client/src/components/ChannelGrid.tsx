import ChannelCard from "./ChannelCard";

interface ChannelServer {
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
}

interface Channel {
  id: string;
  name: string;
  logoUrl?: string | null;
  servers: ChannelServer[];
}

interface ChannelGridProps {
  channels: Channel[];
  locked?: boolean;
  onChannelClick?: (channelId: string) => void;
}

export default function ChannelGrid({ channels, locked, onChannelClick }: ChannelGridProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
        data-testid="grid-channels"
      >
        {channels.map((channel, index) => {
          // Extract all qualities from all servers (for display purposes)
          const allQualities = channel.servers.flatMap(server => 
            server.qualities.map(q => q.quality)
          );
          const uniqueQualities = Array.from(new Set(allQualities)).map(quality => ({
            quality,
            available: true,
          }));

          return (
            <div 
              key={channel.id}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ChannelCard
                name={channel.name}
                logoUrl={channel.logoUrl}
                qualities={uniqueQualities}
                locked={locked}
                onClick={() => onChannelClick?.(channel.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
