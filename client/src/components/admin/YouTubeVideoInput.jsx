import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Play, 
  Link, 
  Code, 
  Plus, 
  Trash2, 
  GripVertical,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { 
  extractVideoId, 
  detectInputType, 
  validateVideoInput, 
  previewVideoData,
  getYouTubeThumbnail 
} from '../../utils/youtubeUtils';
import { axiosInstance } from '../../api/axiosInstance';

const YouTubeVideoInput = ({ 
  videos = [], 
  onVideosChange, 
  onPreview, 
  className = "" 
}) => {
  const [inputType, setInputType] = useState('url');
  const [input, setInput] = useState('');
  const [title, setTitle] = useState('');
  const [enableJsApi, setEnableJsApi] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-detect input type when input changes
  useEffect(() => {
    if (input.trim()) {
      const detectedType = detectInputType(input);
      setInputType(detectedType);
    }
  }, [input]);

  // Validate input in real-time
  useEffect(() => {
    if (input.trim()) {
      const validation = validateVideoInput(input, inputType);
      setErrors(validation.errors);
      
      // Create preview data
      const preview = previewVideoData(input, inputType);
      setPreviewData(preview);
    } else {
      setErrors([]);
      setPreviewData(null);
    }
  }, [input, inputType]);

  const handleInputChange = (value) => {
    setInput(value);
    setErrors([]);
  };

  const handleAddVideo = async () => {
    if (!input.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال رابط YouTube أو كود iframe",
        variant: "destructive"
      });
      return;
    }

    const validation = validateVideoInput(input, inputType);
    if (!validation.isValid) {
      toast({
        title: "خطأ في التحقق",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create video input object
      const videoInput = {
        inputType,
        input: input.trim(),
        title: title.trim() || null,
        enableJsApi
      };

      // Call preview API to get sanitized video data
      const response = await axiosInstance.post('/api/youtube/preview', videoInput);
      
      if (response.data.success) {
        const newVideo = {
          ...response.data.data.video,
          _id: Date.now().toString(), // Temporary ID for frontend
          _isNew: true
        };

        const updatedVideos = [...videos, newVideo];
        onVideosChange(updatedVideos);

        // Reset form
        setInput('');
        setTitle('');
        setEnableJsApi(false);
        setPreviewData(null);

        toast({
          title: "تم إضافة الفيديو بنجاح",
          description: "تم إضافة الفيديو إلى الدورة"
        });
      }
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        title: "خطأ في إضافة الفيديو",
        description: error.response?.data?.error || error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveVideo = (videoId) => {
    const updatedVideos = videos.filter(video => video._id !== videoId);
    onVideosChange(updatedVideos);
    
    toast({
      title: "تم حذف الفيديو",
      description: "تم حذف الفيديو من الدورة"
    });
  };

  const handlePreviewToggle = (video) => {
    if (onPreview) {
      onPreview(video);
    }
  };

  const getVideoThumbnail = (video) => {
    if (video.thumbnail) return video.thumbnail;
    if (video.videoId) return getYouTubeThumbnail(video.videoId);
    return null;
  };

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
          <Tabs value={inputType} onValueChange={setInputType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                رابط YouTube
              </TabsTrigger>
              <TabsTrigger value="iframe" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                كود iframe
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">رابط YouTube</Label>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID أو https://youtu.be/VIDEO_ID"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={errors.length > 0 ? 'border-red-500' : ''}
                />
                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="iframe" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iframe-code">كود iframe</Label>
                <Textarea
                  id="iframe-code"
                  placeholder="<iframe src='https://www.youtube.com/embed/VIDEO_ID' ...></iframe>"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={errors.length > 0 ? 'border-red-500' : ''}
                  rows={4}
                />
                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Optional Title */}
          <div className="space-y-2">
            <Label htmlFor="video-title">عنوان الفيديو (اختياري)</Label>
            <Input
              id="video-title"
              placeholder="عنوان الفيديو"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Preview */}
          {previewData && (
            <div className="space-y-2">
              <Label>معاينة الفيديو</Label>
              <div className="w-full aspect-video rounded-xl shadow-md overflow-hidden bg-gray-100">
                <iframe
                  src={previewData.embedSrc}
                  title={previewData.title}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>معاينة صالحة - يمكن إضافة الفيديو</span>
              </div>
            </div>
          )}

          {/* Add Video Button */}
          <Button 
            onClick={handleAddVideo}
            disabled={!input.trim() || errors.length > 0 || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                إضافة الفيديو
              </>
            )}
          </Button>
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
                  key={video._id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-20 h-12 rounded overflow-hidden bg-gray-200">
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
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {video.title || `فيديو ${video.videoId}`}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {video.videoId}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {video.provider}
                      </Badge>
                      {video.enableJsApi && (
                        <Badge variant="outline" className="text-xs">
                          JS API
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewToggle(video)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveVideo(video._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouTubeVideoInput;
