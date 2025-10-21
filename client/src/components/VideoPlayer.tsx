import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Maximize, Volume2, VolumeX, Server, Radio } from "lucide-react";

interface ChannelServer {
  name: string;
  qualities: Array<{ quality: string; available: boolean }>;
}

interface VideoPlayerProps {
  streamUrl: string;
  channelName: string;
  servers: ChannelServer[];
  currentServer?: string;
  currentQuality?: string;
  onQualityChange?: (quality: string) => void;
  onServerChange?: (server: string) => void;
}

export default function VideoPlayer({ 
  streamUrl,
  channelName, 
  servers,
  currentServer = "main",
  currentQuality = "",
  onQualityChange,
  onServerChange
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [selectedServer, setSelectedServer] = useState(currentServer);
  const [selectedQuality, setSelectedQuality] = useState(currentQuality);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Get available qualities for current server
  const currentServerData = servers.find(s => s.name === selectedServer);
  const availableQualities = currentServerData?.qualities.map(q => q.quality) || [];

  // Helper to jump to live edge (shared between HLS and native Safari)
  const jumpToLiveEdge = (video: HTMLVideoElement, hls?: Hls | null) => {
    try {
      // Method 1: Use HLS.js liveSyncPosition if available
      if (hls?.liveSyncPosition !== undefined && 
          hls.liveSyncPosition !== null && 
          Number.isFinite(hls.liveSyncPosition)) {
        video.currentTime = hls.liveSyncPosition;
        return;
      }

      // Method 2: Use seekable end
      if (video.seekable && video.seekable.length > 0) {
        const end = video.seekable.end(video.seekable.length - 1);
        if (Number.isFinite(end) && end > 0) {
          video.currentTime = Math.max(0, end - 0.5);
          return;
        }
      }

      // Method 3: Fallback to duration
      if (video.duration && Number.isFinite(video.duration)) {
        video.currentTime = video.duration;
      }
    } catch (error) {
      console.log("Could not jump to live edge:", error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

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
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        highBufferWatchdogPeriod: 1,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        jumpToLiveEdge(video, hls);
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
      const handleLoadedMetadata = () => {
        setIsLoading(false);
        jumpToLiveEdge(video, null);
        video.play().catch(e => console.log("Autoplay prevented:", e));
      };
      
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      // Cleanup for Safari
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.src = "";
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    // Prevent seeking - keep video at live edge (with threshold to avoid churn)
    const handleSeeking = () => {
      try {
        let targetTime: number | null = null;
        
        // Read hlsRef dynamically to get current instance after quality/server changes
        const currentHls = hlsRef.current;

        // Determine target live edge position
        if (currentHls?.liveSyncPosition !== undefined && 
            currentHls.liveSyncPosition !== null && 
            Number.isFinite(currentHls.liveSyncPosition)) {
          targetTime = currentHls.liveSyncPosition;
        } else if (video.seekable && video.seekable.length > 0) {
          const end = video.seekable.end(video.seekable.length - 1);
          if (Number.isFinite(end) && end > 0) {
            targetTime = Math.max(0, end - 0.5);
          }
        } else if (video.duration && Number.isFinite(video.duration)) {
          targetTime = video.duration;
        }

        // Only seek if delta is significant (avoid redundant seeks)
        if (targetTime !== null && Math.abs(video.currentTime - targetTime) > 0.75) {
          video.currentTime = targetTime;
        }
      } catch (error) {
        console.log("Could not prevent seeking:", error);
      }
    };

    // Disable right-click to prevent native controls menu
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("contextmenu", handleContextMenu);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    // iOS Safari fullscreen handling
    const webkitVideo = video as any;
    const webkitDoc = document as any;
    
    if (webkitVideo.webkitEnterFullscreen) {
      if (webkitDoc.webkitIsFullScreen) {
        webkitDoc.webkitExitFullscreen?.();
      } else {
        webkitVideo.webkitEnterFullscreen();
      }
      return;
    }

    // Standard fullscreen API for other browsers
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleQualityClick = (quality: string) => {
    setSelectedQuality(quality);
    onQualityChange?.(quality);
  };

  const handleServerClick = (server: string) => {
    setSelectedServer(server);
    onServerChange?.(server);
    
    // Auto-select first available quality when switching servers
    const newServerData = servers.find(s => s.name === server);
    if (newServerData && newServerData.qualities.length > 0) {
      const preferredQualities = ["FHD", "HD", "LOW"];
      const availableQuality = preferredQualities.find(q => 
        newServerData.qualities.some(qual => qual.quality === q)
      ) || newServerData.qualities[0]?.quality;
      
      if (availableQuality) {
        setSelectedQuality(availableQuality);
        onQualityChange?.(availableQuality);
      }
    }
  };

  const handleVideoClick = () => {
    // Toggle play/pause on video click (helpful for touch devices)
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only toggle if clicking backdrop (not buttons or controls)
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'VIDEO') {
      setShowControls(prev => !prev);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl group"
      data-testid="video-player-container"
      onClick={handleContainerClick}
    >
      {/* Video Element - Live Broadcast Mode */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        playsInline
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload"
        data-testid="video-element"
        onClick={handleVideoClick}
      />

      {/* Live Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge 
          variant="destructive" 
          className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-600"
          data-testid="badge-live"
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span className="font-bold text-xs">LIVE</span>
        </Badge>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white" data-testid="video-loading" />
        </div>
      )}

      {/* Controls Overlay - Show on hover (desktop) or tap (mobile) */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {/* Channel Name */}
        <div className="text-white text-sm mb-2" data-testid="video-channel-name">
          {channelName}
        </div>

        {/* Server Selector */}
        {servers.length > 1 && (
          <div className="flex gap-2 mb-2 flex-wrap items-center">
            <span className="text-white text-xs flex items-center gap-1">
              <Server className="w-3 h-3" />
              السيرفر:
            </span>
            {servers.map((server) => (
              <Button
                key={server.name}
                size="sm"
                variant={selectedServer === server.name ? "default" : "secondary"}
                onClick={() => handleServerClick(server.name)}
                className="text-xs"
                data-testid={`button-server-${server.name}`}
              >
                {server.name.toUpperCase()}
              </Button>
            ))}
          </div>
        )}

        {/* Quality Selector */}
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          <span className="text-white text-xs">الجودة:</span>
          {availableQualities.map((quality) => (
            <Button
              key={quality}
              size="sm"
              variant={selectedQuality === quality ? "default" : "secondary"}
              onClick={() => handleQualityClick(quality)}
              className="text-xs"
              data-testid={`button-quality-${quality.toLowerCase()}`}
            >
              {quality}
            </Button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            className="text-white hover:bg-white/20"
            data-testid="button-play-pause"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="text-white hover:bg-white/20"
            data-testid="button-mute"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>

          <div className="flex-1" />

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
            data-testid="button-fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
