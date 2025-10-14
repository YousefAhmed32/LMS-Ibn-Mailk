import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../ui/button';
import Input from '../ui/input';
import Label from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getCourseFilters } from '../../services/courseService';
import { 
  createCourse, 
  updateCourse,
  selectCoursesLoading,
  selectCoursesError,
  clearError
} from '../../store/slices/courseSlice';
import { toast } from '../../hooks/use-toast';

const CourseForm = ({ initialData = null, onSubmit, onCancel, isLoading = false, isEdit = false }) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const reduxLoading = useSelector(selectCoursesLoading);
  const reduxError = useSelector(selectCoursesError);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    term: '',
    subject: '',
    price: '',
    videos: [{ title: '', url: '', duration: '' }]
  });
  
  const [errors, setErrors] = useState({});
  const courseFilters = getCourseFilters();

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        grade: initialData.grade || '',
        term: initialData.term || '',
        subject: initialData.subject || '',
        price: initialData.price?.toString() || '',
        videos: initialData.videos?.length > 0 
          ? initialData.videos.map(v => ({ ...v, duration: v.duration?.toString() || '' }))
          : [{ title: '', url: '', duration: '' }]
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (reduxError) {
      toast({
        title: "Error",
        description: reduxError,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [reduxError, toast, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Course title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Course description must be at least 10 characters';
    }

    if (!formData.grade) {
      newErrors.grade = 'Please select a grade';
    }

    if (!formData.term) {
      newErrors.term = 'Please select a term';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Please enter a valid price';
    }

    // Validate videos
    const videoErrors = [];
    formData.videos.forEach((video, index) => {
      const videoError = {};
      if (!video.title.trim()) {
        videoError.title = 'Video title is required';
      }
      if (!video.url.trim()) {
        videoError.url = 'Video URL is required';
      } else if (!isValidUrl(video.url)) {
        videoError.url = 'Please enter a valid URL';
      }
      if (!video.duration || parseInt(video.duration) < 1) {
        videoError.duration = 'Video duration must be at least 1 minute';
      }
      if (Object.keys(videoError).length > 0) {
        videoErrors[index] = videoError;
      }
    });

    if (videoErrors.length > 0) {
      newErrors.videos = videoErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleVideoChange = (index, field, value) => {
    const newVideos = [...formData.videos];
    newVideos[index] = {
      ...newVideos[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      videos: newVideos
    }));

    // Clear video errors
    if (errors.videos && errors.videos[index] && errors.videos[index][field]) {
      setErrors(prev => ({
        ...prev,
        videos: prev.videos.map((videoError, i) => 
          i === index ? { ...videoError, [field]: '' } : videoError
        )
      }));
    }
  };

  const addVideo = () => {
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, { title: '', url: '', duration: '' }]
    }));
  };

  const removeVideo = (index) => {
    if (formData.videos.length > 1) {
      setFormData(prev => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== index)
      }));
      
      // Clear video errors for removed video
      if (errors.videos && errors.videos[index]) {
        setErrors(prev => ({
          ...prev,
          videos: prev.videos.filter((_, i) => i !== index)
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const courseData = {
        ...formData,
        price: parseFloat(formData.price),
        videos: formData.videos.map(v => ({
          ...v,
          duration: parseInt(v.duration)
        }))
      };

      if (isEdit && initialData?._id) {
        await dispatch(updateCourse({ courseId: initialData._id, courseData })).unwrap();
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        await dispatch(createCourse(courseData)).unwrap();
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      }

      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      // Error is handled by the Redux error handling in useEffect
      console.error('Form submission error:', error);
    }
  };

  const loading = isLoading || reduxLoading;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isEdit ? 'Edit Course' : 'Create New Course'}
        </CardTitle>
        <p className="text-gray-600">
          {isEdit ? 'Update your course information below' : 'Fill in the details to create a new course'}
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter course title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter subject name"
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Course Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your course content and objectives"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {courseFilters.grades.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade && <p className="text-sm text-red-500">{errors.grade}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term *</Label>
              <Select value={formData.term} onValueChange={(value) => handleInputChange('term', value)}>
                <SelectTrigger className={errors.term ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {courseFilters.terms.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.term && <p className="text-sm text-red-500">{errors.term}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>
          </div>

          {/* Video Lessons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Video Lessons *</Label>
              <Button type="button" onClick={addVideo} variant="outline" size="sm">
                + Add Video
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.videos.map((video, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Video {index + 1}</h4>
                    {formData.videos.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeVideo(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`video-title-${index}`}>Video Title *</Label>
                      <Input
                        id={`video-title-${index}`}
                        value={video.title}
                        onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                        placeholder="Enter video title"
                        className={errors.videos?.[index]?.title ? 'border-red-500' : ''}
                      />
                      {errors.videos?.[index]?.title && (
                        <p className="text-sm text-red-500">{errors.videos[index].title}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`video-url-${index}`}>Video URL *</Label>
                      <Input
                        id={`video-url-${index}`}
                        value={video.url}
                        onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                        placeholder="https://example.com/video"
                        className={errors.videos?.[index]?.url ? 'border-red-500' : ''}
                      />
                      {errors.videos?.[index]?.url && (
                        <p className="text-sm text-red-500">{errors.videos[index].url}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`video-duration-${index}`}>Duration (minutes) *</Label>
                      <Input
                        id={`video-duration-${index}`}
                        type="number"
                        min="1"
                        value={video.duration}
                        onChange={(e) => handleVideoChange(index, 'duration', e.target.value)}
                        placeholder="10"
                        className={errors.videos?.[index]?.duration ? 'border-red-500' : ''}
                      />
                      {errors.videos?.[index]?.duration && (
                        <p className="text-sm text-red-500">{errors.videos[index].duration}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Course' : 'Create Course'
              )}
            </Button>
            
            <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CourseForm;
