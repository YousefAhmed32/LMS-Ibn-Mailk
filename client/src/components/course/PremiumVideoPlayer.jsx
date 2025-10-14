import React, { useState } from 'react';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';
import { 
  Youtube,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

const PremiumVideoPlayer = ({ 
  videoUrl, 
  title, 
  thumbnail,
  onProgress,
  onEnded,
  savedProgress = 0,
  className = ""
}) => {
  const [hasError, setHasError] = useState(false);

  // Extract YouTube video ID for thumbnail and external link
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const youtubeId = getYouTubeVideoId(videoUrl);
  const youtubeThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : thumbnail;

  const openOnYouTube = () => {
    if (youtubeId) {
      window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
    }
  };

  if (hasError) {
    return (
      <div className={`relative w-full aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Video Unavailable</h3>
          <p className="text-gray-300 text-center mb-6">
            Sorry, this video couldn't be loaded. Please try again later.
          </p>
          {youtubeId && (
            <button
              onClick={openOnYouTube}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Youtube className="w-5 h-5" />
              Watch on YouTube
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Video Player - Using simplified YouTubeVideoPlayer */}
      {youtubeId ? (
        <YouTubeVideoPlayer
          videoId={youtubeId}
          title={title || 'Premium Video'}
          autoplay={false}
          startTime={savedProgress}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-lg font-medium">Invalid video URL</p>
            <p className="text-sm text-gray-400 mt-2">Please check the video URL</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumVideoPlayer;