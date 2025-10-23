import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import Badge from '../ui/badge';
import Input from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { useDispatch } from 'react-redux';
import { createCourse, updateCourse, deleteCourse, fetchAllCourses } from '../../store/slices/adminSlice';
import { formatCurrency, formatDate } from '../../services/adminService';
import { Textarea } from '../ui/textarea';
import VideoManagement from './VideoManagement';
import EnhancedCreateCourseModal from './EnhancedCreateCourseModal';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  DollarSign, 
  Plus, 
  X, 
  Video,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Image,
  FileText,
  Settings,
  Play,
  Pause,
  Upload,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const CoursesManagement = ({ courses }) => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    subject: 'mathematics',
    grade: '7',
    price: '',
    duration: '',
    level: 'beginner',
    description: '',
    image: null,
    videos: [],
    exams: []
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Ensure courses is always an array
  const coursesArray = Array.isArray(courses) ? courses : [];
  const coursesData = courses?.data || coursesArray;

  const handleExportCourses = async () => {
    try {
      setLoading(true);
      // Implementation for exporting courses
      toast({
        title: "📊 تم تصدير البيانات",
        description: "تم تصدير بيانات الدورات بنجاح"
      });
    } catch (error) {
      console.error('Failed to export courses:', error);
      toast({
        title: "❌ خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const getFilteredCourses = () => {
    return coursesData.filter(course => {
      const matchesSearch = !searchTerm || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = subjectFilter === 'all' || course.subject === subjectFilter;
      const matchesGrade = gradeFilter === 'all' || course.grade === gradeFilter;
      
      return matchesSearch && matchesSubject && matchesGrade;
    });
  };

  const filteredCourses = getFilteredCourses();

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Course statistics
  const courseStats = {
    total: coursesData.length,
    active: coursesData.filter(c => c.status === 'active').length,
    draft: coursesData.filter(c => c.status === 'draft').length,
    totalRevenue: coursesData.reduce((sum, c) => sum + (c.price || 0), 0)
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      subject: 'mathematics',
      grade: '7',
      price: '',
      duration: '',
      level: 'beginner',
      image: null
    });
    setImagePreview(null);
    setShowAddModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      subject: course.subject || 'mathematics',
      grade: course.grade || '7',
      price: course.price || '',
      duration: course.duration || '',
      level: course.level || 'beginner',
      image: null
    });
    setImagePreview(course.imageUrl || null);
    setShowAddModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صحيح');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      setCourseForm({ ...courseForm, image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCourseForm({ ...courseForm, image: null });
    setImagePreview(null);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      try {
        await dispatch(deleteCourse(courseId)).unwrap();
        toast({
          title: "✅ تم حذف الدورة بنجاح",
          description: "تم حذف الدورة من النظام"
        });
        // Refresh the courses list
        dispatch(fetchAllCourses());
      } catch (error) {
        console.error('Failed to delete course:', error);
        toast({
          title: "❌ خطأ في حذف الدورة",
          description: error.message || "حدث خطأ أثناء حذف الدورة",
          variant: "destructive"
        });
      }
    }
  };

  const handleManageVideos = (courseId) => {
    setSelectedCourseId(courseId);
    setShowVideoModal(true);
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!courseForm.title.trim()) {
        toast({
          title: "خطأ في التحقق",
          description: "يرجى إدخال عنوان الدورة",
          variant: "destructive"
        });
        return;
      }
      if (!courseForm.subject) {
        toast({
          title: "خطأ في التحقق",
          description: "يرجى اختيار المادة",
          variant: "destructive"
        });
        return;
      }
      if (!courseForm.grade) {
        toast({
          title: "خطأ في التحقق",
          description: "يرجى اختيار الصف",
          variant: "destructive"
        });
        return;
      }
      if (!courseForm.price || courseForm.price <= 0) {
        toast({
          title: "خطأ في التحقق",
          description: "يرجى إدخال سعر صحيح للدورة",
          variant: "destructive"
        });
        return;
      }

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('description', courseForm.description);
      formData.append('subject', courseForm.subject);
      formData.append('grade', courseForm.grade);
      formData.append('price', courseForm.price);
      formData.append('duration', courseForm.duration);
      formData.append('level', courseForm.level);
      
      // Add videos if present
      if (courseForm.videos && courseForm.videos.length > 0) {
        formData.append('videos', JSON.stringify(courseForm.videos));
      }
      
      // Add exams if present
      if (courseForm.exams && courseForm.exams.length > 0) {
        formData.append('exams', JSON.stringify(courseForm.exams));
      }
      
      if (courseForm.image) {
        formData.append('image', courseForm.image);
      }

      if (editingCourse) {
        // Update existing course
        await dispatch(updateCourse({ courseId: editingCourse._id, courseData: formData })).unwrap();
        toast({
          title: "✅ تم تحديث الدورة بنجاح",
          description: "تم تحديث الدورة بنجاح في النظام"
        });
      } else {
        // Create new course
        await dispatch(createCourse(formData)).unwrap();
        toast({
          title: "✅ تم إنشاء الدورة بنجاح",
          description: "تم إضافة الدورة الجديدة إلى النظام"
        });
      }

      // Reset form and close modal
      setShowAddModal(false);
      setEditingCourse(null);
      setCourseForm({
        title: '',
        description: '',
        subject: 'mathematics',
        grade: '7',
        price: '',
        duration: '',
        level: 'beginner',
        image: null,
        videos: [],
        exams: []
      });
      setImagePreview(null);
      
      // Refresh the courses list to show the new/updated course
      dispatch(fetchAllCourses());
      
    } catch (error) {
      console.error('Failed to submit course:', error);
      toast({
        title: "❌ خطأ في حفظ الدورة",
        description: error.message || "حدث خطأ أثناء حفظ الدورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الدورات</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{courseStats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الدورات النشطة</p>
                  <p className="text-2xl font-bold text-green-600">{courseStats.active}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المسودات</p>
                  <p className="text-2xl font-bold text-yellow-600">{courseStats.draft}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(courseStats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Header with Add Course Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الدورات</h2>
          <p className="text-gray-500 dark:text-gray-400">إدارة وتنظيم جميع الدورات التعليمية</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button onClick={handleAddCourse} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            إضافة دورة جديدة
          </Button>
        </motion.div>
      </motion.div>

      {/* Enhanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              تصفية الدورات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في الدورات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="المادة" />
                </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المواد</SelectItem>
                      <SelectItem value="لغة عربية">لغة عربية</SelectItem>
                    </SelectContent>
              </Select>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الصف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفوف</SelectItem>
                  <SelectItem value="7">أولي إعدادي</SelectItem>
                  <SelectItem value="8">ثاني إعدادي</SelectItem>
                  <SelectItem value="9">ثالث إعدادي</SelectItem>
                  <SelectItem value="10">أولي ثانوي</SelectItem>
                  <SelectItem value="11">ثاني ثانوي</SelectItem>
                  <SelectItem value="12">ثالث ثانوي</SelectItem>
                </SelectContent>
              </Select>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleExportCourses} 
                  className="w-full"
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'جاري التصدير...' : 'تصدير البيانات'}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Courses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                قائمة الدورات
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  عرض {startIndex + 1}-{Math.min(endIndex, filteredCourses.length)} من {filteredCourses.length}
                </div>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصورة</TableHead>
                    <TableHead>عنوان الدورة</TableHead>
                    <TableHead>المادة</TableHead>
                    <TableHead>الصف</TableHead>
                    <TableHead>الفيديوهات</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>المستوى</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {currentCourses.map((course, index) => (
                      <motion.tr
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                      {course.imageUrl ? (
                        <img 
                          src={course.imageUrl} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-gray-500">
                        {course.description?.substring(0, 50)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.subject}</Badge>
                  </TableCell>
                  <TableCell>{course.grade}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{course.videos?.length || 0}</span>
                      </div>
                      {course.videos && course.videos.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {course.videos.reduce((total, video) => total + (video.duration || 0), 0)}m
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(course.price)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      نشط
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(course.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageVideos(course._id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="إدارة الفيديوهات"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                صفحة {currentPage} من {totalPages}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                السابق
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center"
              >
                التالي
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      </motion.div>

      {/* Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <form onSubmit={handleSubmitCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الدورة *
                  </label>
                  <Input
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                    placeholder="أدخل عنوان الدورة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المادة *
                  </label>
                  <Select 
                    value={courseForm.subject} 
                    onValueChange={(value) => setCourseForm({...courseForm, subject: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="لغة عربية">لغة عربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصف *
                  </label>
                  <Select 
                    value={courseForm.grade} 
                    onValueChange={(value) => setCourseForm({...courseForm, grade: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">أولي إعدادي</SelectItem>
                      <SelectItem value="8">ثاني إعدادي</SelectItem>
                      <SelectItem value="9">ثالث إعدادي</SelectItem>
                      <SelectItem value="10">أولي ثانوي</SelectItem>
                      <SelectItem value="11">ثاني ثانوي</SelectItem>
                      <SelectItem value="12">ثالث ثانوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر (ج.م) *
                  </label>
                  <Input
                    required
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({...courseForm, price: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدة (ساعات)
                  </label>
                  <Input
                    type="number"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المستوى
                  </label>
                  <Select 
                    value={courseForm.level} 
                    onValueChange={(value) => setCourseForm({...courseForm, level: value})}
                  >
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الدورة
                </label>
                <Textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                  placeholder="أدخل وصف الدورة..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة الدورة (اختياري)
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-300">
                      <img src={imagePreview} alt="Course Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Remove Image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCourse ? 'تحديث الدورة' : 'إضافة الدورة'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Management Modal */}
      {showVideoModal && selectedCourseId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">إدارة فيديوهات الدورة</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVideoModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <VideoManagement courseId={selectedCourseId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;
