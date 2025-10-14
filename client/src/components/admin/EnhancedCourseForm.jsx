import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  BookOpen, 
  Video, 
  Image, 
  Settings,
  Save,
  X,
  Eye,
  Plus
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { axiosInstance } from '../../api/axiosInstance';
import YouTubeVideoInput from './YouTubeVideoInput';

const EnhancedCourseForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  isEdit = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '',
    term: '',
    subject: '',
    price: '',
    level: 'beginner',
    duration: '',
    image: null
  });
  
  const [videos, setVideos] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        grade: initialData.grade || '',
        term: initialData.term || '',
        subject: initialData.subject || '',
        price: initialData.price?.toString() || '',
        level: initialData.level || 'beginner',
        duration: initialData.duration?.toString() || '',
        image: null
      });
      
      setVideos(initialData.videos || []);
      setImagePreview(initialData.imageUrl || null);
    }
  }, [initialData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "خطأ في نوع الملف",
          description: "يرجى اختيار ملف صورة صالح",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ في حجم الملف",
          description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video changes
  const handleVideosChange = (newVideos) => {
    setVideos(newVideos);
  };

  // Handle video preview
  const handleVideoPreview = (video) => {
    // Open video in new tab for preview
    if (video.embedSrc) {
      window.open(video.embedSrc, '_blank');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الدورة مطلوب';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'وصف الدورة مطلوب';
    }

    if (!formData.grade) {
      newErrors.grade = 'الصف مطلوب';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'المادة مطلوبة';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'السعر يجب أن يكون رقم صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى تصحيح الأخطاء في النموذج",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('grade', formData.grade);
      submitData.append('term', formData.term);
      submitData.append('subject', formData.subject);
      submitData.append('price', formData.price);
      submitData.append('level', formData.level);
      submitData.append('duration', formData.duration);
      submitData.append('videos', JSON.stringify(videos));

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      let response;
      if (isEdit && initialData?._id) {
        response = await axiosInstance.put(`/api/youtube/courses/${initialData._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axiosInstance.post('/api/youtube/courses', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        toast({
          title: "تم الحفظ بنجاح",
          description: isEdit ? "تم تحديث الدورة بنجاح" : "تم إنشاء الدورة بنجاح",
        });

        if (onSubmit) {
          onSubmit(response.data.data);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "خطأ في الحفظ",
        description: error.response?.data?.error || error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            {isEdit ? 'تعديل الدورة' : 'إنشاء دورة جديدة'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                المعلومات الأساسية
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                الفيديوهات ({videos.length})
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                الصور
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                الإعدادات
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الدورة *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="أدخل عنوان الدورة"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">المادة *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="أدخل اسم المادة"
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">الصف *</Label>
                    <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                      <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر الصف" />
                      </SelectTrigger>
                      <SelectContent>
                        {['7', '8', '9', '10', '11', '12'].map(grade => (
                          <SelectItem key={grade} value={grade}>
                            الصف {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.grade && <p className="text-sm text-red-500">{errors.grade}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term">الفصل الدراسي</Label>
                    <Select value={formData.term} onValueChange={(value) => handleInputChange('term', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفصل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">الفصل الأول</SelectItem>
                        <SelectItem value="Term 2">الفصل الثاني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">السعر (جنيه مصري) *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="duration">مدة الدورة (ساعات)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">وصف الدورة *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="أدخل وصف مفصل للدورة"
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>
              </TabsContent>

              <TabsContent value="videos" className="space-y-6">
                <YouTubeVideoInput
                  videos={videos}
                  onVideosChange={handleVideosChange}
                  onPreview={handleVideoPreview}
                />
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">صورة الدورة</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <p className="text-sm text-gray-500">
                      الحد الأقصى لحجم الملف: 5 ميجابايت
                    </p>
                  </div>

                  {imagePreview && (
                    <div className="space-y-2">
                      <Label>معاينة الصورة</Label>
                      <div className="w-full max-w-md">
                        <img
                          src={imagePreview}
                          alt="معاينة صورة الدورة"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="level">مستوى الدورة</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>ملاحظة:</strong> سيتم حفظ جميع الفيديوهات بتنسيق آمن ومتوافق مع YouTube.
                    يمكن للطلاب مشاهدة الفيديوهات مع جميع عناصر التحكم المتاحة.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? 'تحديث الدورة' : 'إنشاء الدورة'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCourseForm;
