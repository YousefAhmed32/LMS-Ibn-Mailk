import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  List,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { getYouTubeThumbnail } from '../../utils/youtubeUtils';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

const VideoPlaylist = ({ 
  videos = [], 
  className = "",
  onVideoComplete = null,
  onVideoChange = null,
  showProgress = true,
  autoPlayNext = true
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);

  const currentVideo = videos[currentVideoIndex];
  const totalVideos = videos.length;
  const completedCount = completedVideos.size;
  const progressPercentage = totalVideos > 0 ? (completedCount / totalVideos) * 100 : 0;

  // Handle video completion
  const handleVideoComplete = (video) => {
    const videoId = video._id || video.videoId;
    setCompletedVideos(prev => new Set([...prev, videoId]));
    
    if (onVideoComplete) {
      onVideoComplete(video);
    }

    // Auto-play next video if enabled
    if (autoPlayNext && currentVideoIndex < totalVideos - 1) {
      setTimeout(() => {
        setCurrentVideoIndex(prev => prev + 1);
      }, 2000); // 2 second delay
    }
  };

  // Handle video start
  const handleVideoStart = (video) => {
    const videoId = video._id || video.videoId;
    setWatchedVideos(prev => new Set([...prev, videoId]));
    setIsPlaying(true);
    
    if (onVideoChange) {
      onVideoChange(video, currentVideoIndex);
    }
  };

  // Navigate to specific video
  const goToVideo = (index) => {
    if (index >= 0 && index < totalVideos) {
      setCurrentVideoIndex(index);
      setIsPlaying(false);
    }
  };

  // Navigate to next video
  const goToNext = () => {
    if (currentVideoIndex < totalVideos - 1) {
      goToVideo(currentVideoIndex + 1);
    }
  };

  // Navigate to previous video
  const goToPrevious = () => {
    if (currentVideoIndex > 0) {
      goToVideo(currentVideoIndex - 1);
    }
  };

  // Get video status
  const getVideoStatus = (video, index) => {
    const videoId = video._id || video.videoId;
    
    if (completedVideos.has(videoId)) {
      return 'completed';
    } else if (watchedVideos.has(videoId)) {
      return 'watched';
    } else if (index === currentVideoIndex) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  // Get video thumbnail
  const getVideoThumbnail = (video) => {
    return video.thumbnail || getYouTubeThumbnail(video.videoId);
  };

  if (videos.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            لا توجد فيديوهات متاحة
          </h3>
          <p className="text-gray-500">
            لم يتم إضافة أي فيديوهات لهذه الدورة بعد
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      {showProgress && totalVideos > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                تقدم الدورة
              </span>
              <span className="text-sm text-gray-500">
                {completedCount} من {totalVideos}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{Math.round(progressPercentage)}% مكتمل</span>
              <span>{totalVideos - completedCount} متبقي</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Video Player */}
      {currentVideo && (
        <div className="space-y-4">
          <YouTubeVideoPlayer
            video={currentVideo}
            onVideoStart={handleVideoStart}
            onVideoEnd={handleVideoComplete}
            autoplay={isPlaying}
            className="w-full"
          />

          {/* Video Navigation */}
          {totalVideos > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={currentVideoIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {currentVideoIndex + 1} من {totalVideos}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={goToNext}
                disabled={currentVideoIndex === totalVideos - 1}
                className="flex items-center gap-2"
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Video Playlist */}
      {totalVideos > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              قائمة الفيديوهات ({totalVideos})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {videos.map((video, index) => {
                const status = getVideoStatus(video, index);
                const isCurrent = index === currentVideoIndex;
                const isCompleted = status === 'completed';
                const isWatched = status === 'watched';

                return (
                  <div
                    key={video._id || video.videoId}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isCurrent 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => goToVideo(index)}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                      {getVideoThumbnail(video) ? (
                        <img
                          src={getVideoThumbnail(video)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
                        ) : isCurrent ? (
                          <Play className="h-4 w-4 text-blue-500 bg-white rounded-full p-1" />
                        ) : null}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm truncate ${
                        isCurrent ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {video.title || `فيديو ${video.videoId}`}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={isCurrent ? 'default' : 'outline'} 
                          className="text-xs"
                        >
                          {index + 1}
                        </Badge>
                        {video.duration && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {video.duration} دقيقة
                          </div>
                        )}
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            مكتمل
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isWatched ? (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-gray-100" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoPlaylist;
