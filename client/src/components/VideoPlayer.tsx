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
    <div className="w-full max-w-5xl mx-auto" data-testid="container-video-player">
      <div className="bg-card rounded-lg overflow-hidden border">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="relative z-10 text-center">
            <div className="rounded-full bg-primary/20 backdrop-blur-sm p-6 mb-4 inline-block">
              <Play className="h-16 w-16 text-white" />
            </div>
            <p className="text-white text-lg font-medium">{channelName}</p>
            <p className="text-white/70 text-sm mt-2">البث المباشر - {selectedQuality}</p>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm hover:bg-black/70">
                <Play className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm hover:bg-black/70">
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <Button size="icon" variant="secondary" className="bg-black/50 backdrop-blur-sm hover:bg-black/70">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-card-foreground" data-testid="text-player-channel-name">
                {channelName}
              </h3>
              <p className="text-sm text-muted-foreground">اختر الجودة المناسبة</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {qualities.map((q) => (
                <Button
                  key={q.quality}
                  size="sm"
                  variant={selectedQuality === q.quality ? "default" : "outline"}
                  onClick={() => handleQualityClick(q.quality)}
                  className={`${
                    selectedQuality === q.quality
                      ? q.quality === 'FHD' ? 'bg-green-600 hover:bg-green-700' :
                        q.quality === 'HD' ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-gray-600 hover:bg-gray-700'
                      : ''
                  }`}
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
