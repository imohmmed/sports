import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Maximize, Volume2 } from "lucide-react";

interface QualityOption {
  quality: string;
  url: string;
}

interface VideoPlayerProps {
  channelName: string;
  qualities: QualityOption[];
  currentQuality?: string;
  onQualityChange?: (quality: string) => void;
}

export default function VideoPlayer({ 
  channelName, 
  qualities, 
  currentQuality = qualities[0]?.quality,
  onQualityChange 
}: VideoPlayerProps) {
  const [selectedQuality, setSelectedQuality] = useState(currentQuality);

  const handleQualityClick = (quality: string) => {
    setSelectedQuality(quality);
    onQualityChange?.(quality);
    console.log(`Quality changed to: ${quality}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700" data-testid="container-video-player">
      <div className="bg-card rounded-lg overflow-hidden border shadow-2xl transition-all duration-500 hover:shadow-primary/20">
        <div className="relative aspect-video bg-black flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
          <div className="relative z-10 text-center animate-in zoom-in duration-700 delay-300">
            <div className="rounded-full bg-primary/20 backdrop-blur-sm p-6 mb-4 inline-block transition-all duration-500 hover:scale-110 hover:bg-primary/30 cursor-pointer">
              <Play className="h-16 w-16 text-white transition-transform duration-300 hover:scale-110" />
            </div>
            <p className="text-white text-lg font-medium transition-all duration-300">{channelName}</p>
            <p className="text-white/70 text-sm mt-2 transition-all duration-300">البث المباشر - {selectedQuality}</p>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 hover:scale-110">
                <Play className="h-4 w-4 transition-transform duration-300" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 hover:scale-110">
                <Volume2 className="h-4 w-4 transition-transform duration-300" />
              </Button>
            </div>
            <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 hover:scale-110">
              <Maximize className="h-4 w-4 transition-transform duration-300" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 bg-card transition-all duration-500">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="animate-in slide-in-from-right-5 duration-500 delay-300">
              <h3 className="font-bold text-lg text-card-foreground transition-colors duration-300" data-testid="text-player-channel-name">
                {channelName}
              </h3>
              <p className="text-sm text-muted-foreground transition-colors duration-300">اختر الجودة المناسبة</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {qualities.map((q, index) => (
                <Button
                  key={q.quality}
                  size="sm"
                  variant={selectedQuality === q.quality ? "default" : "outline"}
                  onClick={() => handleQualityClick(q.quality)}
                  className={`transition-all duration-300 hover:scale-110 animate-in slide-in-from-bottom-3 ${
                    selectedQuality === q.quality
                      ? q.quality === 'FHD' ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/50' :
                        q.quality === 'HD' ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50' :
                        'bg-gray-600 hover:bg-gray-700 shadow-lg shadow-gray-500/50'
                      : 'hover:border-primary hover:shadow-md'
                  }`}
                  style={{ animationDelay: `${index * 100 + 500}ms` }}
                  data-testid={`button-quality-${q.quality}`}
                >
                  {q.quality}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
