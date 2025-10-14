import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Play, 
  Link, 
  Code, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Eye,
  X
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const VideoInputForm = ({ 
  videos = [], 
  onVideosChange, 
  className = "" 
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoEmbed, setVideoEmbed] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // YouTube URL regex patterns
  const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i;
  const IFRAME_REGEX = /<iframe[^>]*src=["']([^"']+)["'][^>]*>(?:<\/iframe>)?/i;

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(YT_REGEX);
    return match ? match[1] : null;
  };

  // Extract video ID from iframe src
  const extractVideoIdFromIframe = (iframeSrc) => {
    if (!iframeSrc || typeof iframeSrc !== 'string') return null;
    
    if (iframeSrc.includes('/embed/')) {
      const match = iframeSrc.match(/\/embed\/([A-Za-z0-9_-]{11})/);
      return match ? match[1] : null;
    }
    
    return extractVideoId(iframeSrc);
  };

  // Generate embed URL
  const generateEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0`;
  };

  // Parse iframe HTML
  const parseIframe = (iframeHtml) => {
    if (!iframeHtml || typeof iframeHtml !== 'string') return null;
    
    const srcMatch = iframeHtml.match(IFRAME_REGEX);
    if (!srcMatch) return null;
    
    const src = srcMatch[1];
    const videoId = extractVideoIdFromIframe(src);
    
    if (!videoId) return null;
    
    return {
      src,
      videoId,
      embedSrc: generateEmbedUrl(videoId)
    };
  };

  // Validate YouTube domain
  const isAllowedDomain = (src) => {
    if (!src || typeof src !== 'string') return false;
    
    try {
      const url = new URL(src);
      const allowedDomains = [
        'www.youtube.com',
        'youtube.com',
        'youtu.be',
        'www.youtube-nocookie.com',
        'youtube-nocookie.com'
      ];
      return allowedDomains.includes(url.hostname);
    } catch (error) {
      return false;
    }
  };

  // Generate preview data
  const generatePreview = () => {
    setErrors({});
    let videoId = null;
    let embedSrc = null;
    let inputType = null;
    let originalInput = '';

    // Check URL input first
    if (videoUrl.trim()) {
      videoId = extractVideoId(videoUrl.trim());
      if (videoId) {
        embedSrc = generateEmbedUrl(videoId);
        inputType = 'url';
        originalInput = videoUrl.trim();
      } else {
        setErrors({ url: 'Invalid YouTube URL format' });
        return;
      }
    }
    // Check iframe input
    else if (videoEmbed.trim()) {
      const parsed = parseIframe(videoEmbed.trim());
      if (parsed && isAllowedDomain(parsed.src)) {
        videoId = parsed.videoId;
        embedSrc = parsed.embedSrc;
        inputType = 'iframe';
        originalInput = videoEmbed.trim();
      } else {
        setErrors({ embed: 'Invalid iframe code or unsupported domain' });
        return;
      }
    }
    // No input provided
    else {
      setErrors({ general: 'Please provide either a YouTube URL or iframe code' });
      return;
    }

    if (videoId && embedSrc) {
      setPreviewData({
        videoId,
        embedSrc,
        title: videoTitle.trim() || `Video ${videoId}`,
        duration: videoDuration.trim() || '0',
        inputType,
        originalInput,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      });
    }
  };

  // Handle URL input change
  const handleUrlChange = (value) => {
    setVideoUrl(value);
    setVideoEmbed(''); // Clear iframe when URL is entered
    setPreviewData(null);
    setErrors({});
  };

  // Handle iframe input change
  const handleEmbedChange = (value) => {
    setVideoEmbed(value);
    setVideoUrl(''); // Clear URL when iframe is entered
    setPreviewData(null);
    setErrors({});
  };

  // Add video to list
  const addVideo = () => {
    if (!previewData) {
      generatePreview();
      return;
    }

    const newVideo = {
      id: Date.now().toString(),
      title: previewData.title,
      duration: parseInt(previewData.duration) || 0,
      videoId: previewData.videoId,
      embedSrc: previewData.embedSrc,
      originalInput: previewData.originalInput,
      inputType: previewData.inputType,
      thumbnail: previewData.thumbnail,
      provider: 'youtube',
      order: videos.length
    };

    const updatedVideos = [...videos, newVideo];
    onVideosChange(updatedVideos);

    // Reset form
    setVideoUrl('');
    setVideoEmbed('');
    setVideoTitle('');
    setVideoDuration('');
    setPreviewData(null);
    setErrors({});

    toast({
      title: "تم إضافة الفيديو بنجاح",
      description: "تم إضافة الفيديو إلى الدورة"
    });
  };

  // Remove video from list
  const removeVideo = (videoId) => {
    const updatedVideos = videos.filter(video => video.id !== videoId);
    onVideosChange(updatedVideos);
    
    toast({
      title: "تم حذف الفيديو",
      description: "تم حذف الفيديو من الدورة"
    });
  };

  // Auto-generate preview when inputs change
  useEffect(() => {
    if (videoUrl.trim() || videoEmbed.trim()) {
      const timer = setTimeout(() => {
        generatePreview();
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timer);
    } else {
      setPreviewData(null);
      setErrors({});
    }
  }, [videoUrl, videoEmbed, videoTitle, videoDuration]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            إضافة فيديو YouTube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* YouTube URL Input */}
          <div className="space-y-2">
            <Label htmlFor="video-url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              رابط YouTube
            </Label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID أو https://youtu.be/VIDEO_ID"
              value={videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={`rounded-lg border-2 px-4 py-3 ${errors.url ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
            />
            {errors.url && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.url}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* OR Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm font-medium text-gray-500 bg-white px-3">أو</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* iframe Embed Code Input */}
          <div className="space-y-2">
            <Label htmlFor="video-embed" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              كود iframe
            </Label>
            <Textarea
              id="video-embed"
              placeholder="<iframe src='https://www.youtube.com/embed/VIDEO_ID' width='560' height='315'></iframe>"
              value={videoEmbed}
              onChange={(e) => handleEmbedChange(e.target.value)}
              rows={3}
              className={`rounded-lg border-2 px-4 py-3 resize-none ${errors.embed ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
            />
            {errors.embed && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.embed}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Video Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-title">عنوان الفيديو (اختياري)</Label>
              <Input
                id="video-title"
                placeholder="عنوان الفيديو"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="rounded-lg border-2 border-gray-300 focus:border-blue-500 px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-duration">المدة (دقائق)</Label>
              <Input
                id="video-duration"
                type="number"
                min="0"
                placeholder="0"
                value={videoDuration}
                onChange={(e) => setVideoDuration(e.target.value)}
                className="rounded-lg border-2 border-gray-300 focus:border-blue-500 px-4 py-3"
              />
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {previewData && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">معاينة الفيديو</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-green-200">
                <div className="w-full aspect-video rounded-lg shadow-md overflow-hidden bg-black">
                  <iframe
                    src={previewData.embedSrc}
                    title={previewData.title}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{previewData.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {previewData.inputType === 'url' ? 'رابط YouTube' : 'كود iframe'}
                      </Badge>
                      <span className="text-xs text-gray-500">{previewData.videoId}</span>
                    </div>
                  </div>
                  <Button
                    onClick={addVideo}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add Video Button (when no preview) */}
          {!previewData && (videoUrl.trim() || videoEmbed.trim()) && (
            <Button 
              onClick={generatePreview}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              معاينة الفيديو
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Video List */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>فيديوهات الدورة ({videos.length})</span>
              <Badge variant="secondary">
                {videos.length} فيديو
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  {/* Video Number */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-20 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {video.videoId}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {video.inputType === 'url' ? 'رابط' : 'iframe'}
                      </Badge>
                      {video.duration > 0 && (
                        <span className="text-xs text-gray-500">
                          {video.duration} دقيقة
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeVideo(video.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoInputForm;
