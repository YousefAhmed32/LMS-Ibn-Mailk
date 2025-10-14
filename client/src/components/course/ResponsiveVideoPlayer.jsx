import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import { 
  Play, 
  Loader2
} from 'lucide-react';

const ResponsiveVideoPlayer = ({ 
  video, 
  className = "",
  showControls = true,
  autoplay = false,
  onVideoEnd = null,
  onVideoStart = null
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);

  // Get thumbnail URL
  const thumbnailUrl = video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

  // Handle play button click
  const handlePlay = () => {
    setIsLoading(true);
    setShowThumbnail(false);
    
    if (onVideoStart) {
      onVideoStart(video);
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
          {/* Thumbnail/Poster */}
          {showThumbnail && (
            <div className="absolute inset-0 z-10">
              <div className="relative w-full h-full">
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt={video.title || 'YouTube Video'}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <Button
                    onClick={handlePlay}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>

                {/* Video Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black bg-opacity-70 rounded-lg p-3 text-white">
                    <h3 className="font-semibold text-sm mb-1">
                      {video.title || `فيديو ${video.videoId}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        YouTube
                      </Badge>
                      {video.duration && video.duration > 0 && (
                        <span className="text-xs text-gray-300">
                          {video.duration} دقيقة
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && !isLoaded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">جاري تحميل الفيديو...</p>
              </div>
            </div>
          )}

          {/* YouTube Video Player */}
          {!showThumbnail && (
            <YouTubeVideoPlayer
              videoId={video.videoId}
              title={video.title || 'YouTube Video'}
              autoplay={autoplay}
            />
          )}
        </div>

        {/* Video Details */}
        {showControls && (
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {video.title || `فيديو ${video.videoId}`}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge variant="outline">
                    {video.provider || 'YouTube'}
                  </Badge>
                  {video.duration && video.duration > 0 && (
                    <span>• {video.duration} دقيقة</span>
                  )}
                  {video.order !== undefined && (
                    <span>• الفيديو {video.order + 1}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsiveVideoPlayer;
