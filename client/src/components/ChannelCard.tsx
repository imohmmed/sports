import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Play } from "lucide-react";
import channelThumb from "@assets/generated_images/BeIN_Sports_channel_thumbnail_fe27a533.png";

interface ChannelCardProps {
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
  locked?: boolean;
  onClick?: () => void;
}

export default function ChannelCard({ name, qualities, locked, onClick }: ChannelCardProps) {
  return (
    <Card 
      className="group overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 cursor-pointer hover:scale-105"
      onClick={onClick}
      data-testid={`card-channel-${name.replace(/\s+/g, '-')}`}
    >
      <div className="relative aspect-video">
        <img 
          src={channelThumb} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Lock className="h-12 w-12 text-white" />
          </div>
        )}

        {!locked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="rounded-full bg-primary p-4">
              <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 right-0 left-0 p-4">
          <h3 className="text-white font-bold text-lg mb-2" data-testid={`text-channel-name-${name.replace(/\s+/g, '-')}`}>
            {name}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {qualities.map((q) => (
              <Badge 
                key={q.quality}
                variant={q.available ? "default" : "secondary"}
                className={`text-xs ${
                  q.quality === 'FHD' ? 'bg-green-600 hover:bg-green-700' :
                  q.quality === 'HD' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-gray-600 hover:bg-gray-700'
                }`}
                data-testid={`badge-quality-${q.quality}`}
              >
                {q.quality}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
