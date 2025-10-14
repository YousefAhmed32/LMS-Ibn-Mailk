import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  BookOpen, 
  Plus,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import EnhancedCourseFormWithVideos from '../../components/admin/EnhancedCourseFormWithVideos';
import ResponsiveVideoPlayer from '../../components/course/ResponsiveVideoPlayer';

const CourseVideoExample = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Sample courses for demonstration
  const sampleCourses = [
    {
      _id: '1',
      title: 'دورة الرياضيات - الصف 12',
      description: 'دورة شاملة في الرياضيات للصف الثاني عشر',
      grade: '12',
      subject: 'الرياضيات',
      price: 150,
      videos: [
        {
          id: '1',
          title: 'مقدمة في التفاضل',
          videoId: 'dQw4w9WgXcQ',
          embedSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&rel=0',
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          duration: 15,
          provider: 'youtube',
          order: 0
        },
        {
          id: '2',
          title: 'التكامل الأساسي',
          videoId: '9bZkp7q19f0',
          embedSrc: 'https://www.youtube.com/embed/9bZkp7q19f0?controls=1&rel=0',
          thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
          duration: 20,
          provider: 'youtube',
          order: 1
        }
      ]
    }
  ];

  const handleCourseSubmit = (courseData) => {
    console.log('Course submitted:', courseData);
    setShowCreateModal(false);
    
    toast({
      title: "تم إنشاء الدورة بنجاح",
      description: "تم حفظ الدورة مع الفيديوهات بنجاح"
    });
  };

  const handleCancel = () => {
    setShowCreateModal(false);
  };

  const handlePreviewCourse = (course) => {
    setSelectedCourse(course);
    setShowPreview(true);
  };

  const handleVideoStart = (video) => {
    console.log('Video started:', video);
  };

  const handleVideoEnd = (video) => {
    console.log('Video ended:', video);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة دورات الفيديو</h1>
          <p className="text-gray-600 mt-2">أمثلة على استخدام نظام إدخال الفيديوهات</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          إنشاء دورة جديدة
        </Button>
      </div>

      {/* Sample Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleCourses.map((course) => (
          <Card key={course._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {course.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{course.description}</p>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">الصف {course.grade}</Badge>
                <Badge variant="outline">{course.subject}</Badge>
                <Badge variant="secondary">{course.price} جنيه</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {course.videos.length} فيديو
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewCourse(course)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  معاينة
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <EnhancedCourseFormWithVideos
              onSubmit={handleCourseSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Course Preview Modal */}
      {showPreview && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                  <p className="text-gray-600">{selectedCourse.description}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  إغلاق
                </Button>
              </div>

              <div className="space-y-6">
                {selectedCourse.videos.map((video, index) => (
                  <div key={video.id} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">الفيديو {index + 1}</Badge>
                      <h3 className="font-semibold">{video.title}</h3>
                      {video.duration > 0 && (
                        <span className="text-sm text-gray-500">
                          {video.duration} دقيقة
                        </span>
                      )}
                    </div>
                    
                    <ResponsiveVideoPlayer
                      video={video}
                      onVideoStart={handleVideoStart}
                      onVideoEnd={handleVideoEnd}
                      showControls={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>تعليمات الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">إضافة فيديو برابط YouTube:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• الصق رابط YouTube في الحقل الأول</li>
                <li>• يمكن استخدام: youtube.com/watch?v= أو youtu.be/</li>
                <li>• سيتم تحويل الرابط تلقائياً إلى iframe آمن</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">إضافة فيديو بكود iframe:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• الصق كود iframe في الحقل الثاني</li>
                <li>• سيتم تنظيف الكود وإزالة العناصر غير الآمنة</li>
                <li>• يدعم YouTube و YouTube-nocookie فقط</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">ميزات الأمان:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• تنظيف تلقائي لجميع المدخلات</li>
              <li>• دعم YouTube و YouTube-nocookie فقط</li>
              <li>• إزالة أي عناصر HTML غير آمنة</li>
              <li>• معاينة فورية قبل الحفظ</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseVideoExample;
