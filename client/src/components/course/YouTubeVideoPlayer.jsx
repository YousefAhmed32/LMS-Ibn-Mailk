import React, { useEffect, useRef } from 'react';

const YouTubeVideoPlayer = ({ 
  videoId, 
  title = "YouTube video player",
  className = "",
  autoplay = false,
  startTime = 0,
  enableProgressTracking = false,
  onPlayerReady = null,
  onPlayerStateChange = null,
  onProgressUpdate = null,
  onVideoCompleted = null,
  studentId = null,
  courseId = null
}) => {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const isPlayerReadyRef = useRef(false);

  useEffect(() => {
    if (!enableProgressTracking || !videoId) return;

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Wait for YouTube API to load
    const checkYT = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
      } else {
        setTimeout(checkYT, 100);
      }
    };

    const initializePlayer = () => {
      if (iframeRef.current && !isPlayerReadyRef.current) {
        try {
          playerRef.current = new window.YT.Player(iframeRef.current, {
            events: {
              onReady: (event) => {
                isPlayerReadyRef.current = true;
                onPlayerReady?.(event);
              },
              onStateChange: (event) => {
                onPlayerStateChange?.(event);
              }
            }
          });
        } catch (error) {
          console.error('Error initializing YouTube player:', error);
        }
      }
    };

    checkYT();

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        isPlayerReadyRef.current = false;
      }
    };
  }, [videoId, enableProgressTracking, onPlayerReady, onPlayerStateChange]);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No video ID provided</p>
      </div>
    );
  }

  // Build the YouTube embed URL with native controls enabled and API support
  const embedUrl = `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&modestbranding=1&showinfo=0&fs=1&playsinline=1&enablejsapi=1${autoplay ? '&autoplay=1' : ''}${startTime > 0 ? `&start=${Math.floor(startTime)}` : ''}`;

  return (
    <div className={`w-full ${className}`}>
      <iframe
        ref={iframeRef}
        className="w-full aspect-video rounded-xl shadow-lg"
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubeVideoPlayer;