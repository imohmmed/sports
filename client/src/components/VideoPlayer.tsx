import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Play, Pause, Maximize, Volume2, VolumeX } from "lucide-react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [selectedQuality, setSelectedQuality] = useState(currentQuality);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentStream = qualities.find(q => q.quality === selectedQuality);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentStream?.url) return;

    setIsLoading(true);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(currentStream.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(e => console.log("Autoplay prevented:", e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          setIsLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, attempting recovery...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, attempting recovery...");
              hls.recoverMediaError();
              break;
            default:
              console.log("Fatal error, destroying HLS instance");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = currentStream.url;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().catch(e => console.log("Autoplay prevented:", e));
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStream?.url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleQualityClick = (quality: string) => {
    setSelectedQuality(quality);
    onQualityChange?.(quality);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(e => console.log("Play error:", e));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // iOS Safari requires fullscreen on video element
    if ((video as any).webkitEnterFullscreen) {
      try {
        (video as any).webkitEnterFullscreen();
      } catch (e) {
        console.log("iOS fullscreen error:", e);
      }
      return;
    }

    // Desktop browsers - fullscreen on container
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(e => console.log("Fullscreen error:", e));
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700" data-testid="container-video-player">
      <div className="bg-card rounded-lg overflow-hidden border shadow-2xl transition-all duration-500 hover:shadow-primary/20">
        <div ref={containerRef} className="relative aspect-video bg-black group">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
          )}
          
          <video
            ref={videoRef}
            className="w-full h-full"
            controls={false}
            playsInline
            data-testid="video-player"
          />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="secondary" 
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 hover:scale-110"
                onClick={togglePlay}
                data-testid={`button-${isPlaying ? 'pause' : 'play'}`}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button 
                size="icon" 
                variant="secondary" 
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 hover:scale-110"
                onClick={toggleMute}
                data-testid={`button-${isMuted ? 'unmute' : 'mute'}`}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              size="icon" 
              variant="secondary" 
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all duration-300 hover:scale-110"
              onClick={toggleFullscreen}
              data-testid="button-fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center animate-in zoom-in duration-700">
                <div 
                  className="rounded-full bg-primary/20 backdrop-blur-sm p-6 mb-4 inline-block transition-all duration-500 hover:scale-110 hover:bg-primary/30 cursor-pointer"
                  onClick={togglePlay}
                >
                  <Play className="h-16 w-16 text-white transition-transform duration-300 hover:scale-110" />
                </div>
                <p className="text-white text-lg font-medium">{channelName}</p>
                <p className="text-white/70 text-sm mt-2">البث المباشر - {selectedQuality}</p>
              </div>
            </div>
          )}
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
