import VideoPlayer from '../VideoPlayer';

export default function VideoPlayerExample() {
  return (
    <div className="min-h-screen bg-background p-8">
      <VideoPlayer
        channelName="Bn Sport 1"
        qualities={[
          { quality: 'FHD', url: 'encrypted-url-1' },
          { quality: 'HD', url: 'encrypted-url-2' },
          { quality: 'LOW', url: 'encrypted-url-3' }
        ]}
        onQualityChange={(quality) => console.log('Quality changed to:', quality)}
      />
    </div>
  );
}
