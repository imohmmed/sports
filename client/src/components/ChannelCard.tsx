import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Play } from "lucide-react";
import channelThumb from "@assets/generated_images/BeIN_Sports_channel_thumbnail_fe27a533.png";

interface ChannelCardProps {
  name: string;
  logoUrl?: string | null;
  qualities: Array<{ quality: string; available: boolean }>;
  locked?: boolean;
  onClick?: () => void;
}

export default function ChannelCard({ name, logoUrl, qualities, locked, onClick }: ChannelCardProps) {
  return (
    <Card 
      className="group overflow-hidden hover-elevate active-elevate-2 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 animate-in fade-in slide-in-from-bottom-5"
      onClick={onClick}
      data-testid={`card-channel-${name.replace(/\s+/g, '-')}`}
    >
      <div className="relative aspect-video">
        {logoUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="w-full h-full flex items-center justify-center">
              <h2 className="text-white font-bold text-2xl md:text-3xl text-center transition-all duration-300 group-hover:text-primary group-hover:scale-110" style={{ fontFamily: 'Cairo, sans-serif' }}>
                {name}
              </h2>
            </div>
          </div>
        ) : (
          <>
            <img 
              src={channelThumb} 
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
          </>
        )}
        
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-500">
            <Lock className="h-12 w-12 text-white animate-pulse transition-transform duration-500 group-hover:scale-125" />
          </div>
        )}

        {!locked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/30">
            <div className="rounded-full bg-primary p-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/50 animate-in zoom-in">
              <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 right-0 left-0 p-4 transition-all duration-500 group-hover:pb-6">
          <h3 className="text-white font-bold text-lg transition-all duration-300 group-hover:text-primary" data-testid={`text-channel-name-${name.replace(/\s+/g, '-')}`}>
            {name}
          </h3>
        </div>
      </div>
    </Card>
  );
}
