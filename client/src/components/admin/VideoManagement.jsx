import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../ui/button';
import Input from '../ui/input';
import Label from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Badge from '../ui/badge';
import { Trash2, Edit, Plus, GripVertical, Play } from 'lucide-react';

const VideoManagement = ({ courseId }) => {
  const dispatch = useDispatch();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    order: 0,
    duration: '',
    thumbnail: null,
    quizLink: ''
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Fetch course videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/courses/${courseId}/videos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setVideos(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchVideos();
    }
  }, [courseId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      order: 0,
      duration: '',
      thumbnail: null,
      quizLink: ''
    });
    setThumbnailPreview(null);
    setEditingVideo(null);
  };

  // Handle add video
  const handleAddVideo = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      order: videos.length
    }));
    setIsAddModalOpen(true);
  };

  // Handle edit video
  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      url: video.url || '',
      order: video.order || 0,
      duration: video.duration || '',
      thumbnail: null,
      quizLink: video.quizLink || ''
    });
    setThumbnailPreview(video.thumbnail);
    setIsEditModalOpen(true);
  };

  // Submit video form
  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('url', formData.url);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('quizLink', formData.quizLink);
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      const url = editingVideo 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/courses/${courseId}/videos/${editingVideo._id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/courses/${courseId}/videos`;
      
      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        await fetchVideos();
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        console.error('Error submitting video:', error);
      }
    } catch (error) {
      console.error('Error submitting video:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete video
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/courses/${courseId}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchVideos();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle reorder videos
  const handleReorderVideos = async (newOrder) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/courses/${courseId}/videos/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ videoOrder: newOrder })
      });

      if (response.ok) {
        await fetchVideos();
      }
    } catch (error) {
      console.error('Error reordering videos:', error);
    }
  };

  const getYouTubeVideoId = (url) => extractVideoId(url);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Videos</h2>
        <Button onClick={handleAddVideo} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Video
        </Button>
      </div>

      {loading && videos.length === 0 ? (
        <div className="text-center py-8">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No videos added yet. Click "Add Video" to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {videos.map((video, index) => (
            <Card key={video._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <Badge variant="outline">{video.order + 1}</Badge>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-24 h-14 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-14 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{video.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{video.url}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {video.duration && (
                        <span>{video.duration} minutes</span>
                      )}
                      {video.quizLink && (
                        <span className="text-blue-600 font-medium">Quiz Available</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVideo(video)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVideo(video._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Video</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitVideo} className="space-y-4">
            <div>
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter video title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="url">YouTube URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 15"
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="quizLink">Quiz Link (Optional)</Label>
              <Input
                id="quizLink"
                name="quizLink"
                value={formData.quizLink}
                onChange={handleInputChange}
                placeholder="https://forms.google.com/..."
              />
            </div>
            
            <div>
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview"
                    className="w-32 h-18 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Video'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Video Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitVideo} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Video Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter video title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-url">YouTube URL</Label>
              <Input
                id="edit-url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-order">Order</Label>
              <Input
                id="edit-order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-duration">Duration (minutes)</Label>
              <Input
                id="edit-duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 15"
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-quizLink">Quiz Link (Optional)</Label>
              <Input
                id="edit-quizLink"
                name="quizLink"
                value={formData.quizLink}
                onChange={handleInputChange}
                placeholder="https://forms.google.com/..."
              />
            </div>
            
            <div>
              <Label htmlFor="edit-thumbnail">Thumbnail Image</Label>
              <Input
                id="edit-thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview"
                    className="w-32 h-18 object-cover rounded"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Video'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoManagement;
