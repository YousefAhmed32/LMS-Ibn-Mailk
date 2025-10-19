import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import {
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Download,
  MessageSquare,
  Bell,
  Settings,
  ArrowLeft,
  ArrowRight,
  User,
  GraduationCap,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  Star,
  Copy,
  Edit3,
  Plus,
  X,
  RefreshCw,
  FileText,
  Eye,
  EyeOff,
  LogOut,
  UserCheck,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Minus,
  Sun,
  Moon
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';

// Helper function to get grade from percentage
const getGradeFromPercentage = (percentage) => {
  if (percentage >= 95) return 'ممتاز';
  if (percentage >= 85) return 'جيد جداً';
  if (percentage >= 75) return 'جيد';
  if (percentage >= 65) return 'مقبول';
  return 'ضعيف';
};
import PageWrapper from '../../components/layout/PageWrapper';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  BarChart, 
  Bar,
  Area,
  AreaChart
} from 'recharts';

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { studentId } = useParams();
  
  // State management
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grades');
  const [gradesData, setGradesData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  
  // Student linking modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [linkingStudent, setLinkingStudent] = useState(false);

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', showLinkModal);
  }, [showLinkModal]);

  // Debug input state
  useEffect(() => {
    console.log('Student ID input changed:', studentIdInput);
  }, [studentIdInput]);
  
  // Charts data with default values
  const [gradeProgression, setGradeProgression] = useState([
    { month: 'سبتمبر', grade: 82 },
    { month: 'أكتوبر', grade: 85 },
    { month: 'نوفمبر', grade: 88 },
    { month: 'ديسمبر', grade: 87 }
  ]);
  const [subjectDistribution, setSubjectDistribution] = useState([
    { subject: 'اختبار النحو', score: 96, color: '#F59E0B' },
    { subject: 'اختبار الأدب', score: 82, color: '#EF4444' },
    { subject: 'اختبار التعبير', score: 78, color: '#8B5CF6' },
    { subject: 'اختبار البلاغة', score: 84, color: '#06B6D4' },
    { subject: 'اختبار الإملاء', score: 90, color: '#10B981' }
  ]);
  const [attendanceChart, setAttendanceChart] = useState([]);
  const [completionRates, setCompletionRates] = useState([
    { name: 'مكتمل', value: 67, color: '#10B981' },
    { name: 'جاري', value: 33, color: '#06B6D4' }
  ]);
  
  // Ref to prevent multiple API calls
  const isFetchingRef = useRef(false);

  // Fetch comprehensive child data using new API
  const fetchChildData = useCallback(async (childId) => {
    if (!childId) {
      console.warn('No childId provided to fetchChildData');
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      // Use the new comprehensive API endpoint with longer timeout
      const response = await axiosInstance.get(`/api/parent/student/${childId}/comprehensive`, {
        timeout: 30000 // 30 seconds timeout
      });
      
      if (response.data.success) {
        const data = response.data;
        
        // Update student info
        if (data.student) {
          setSelectedChild(prev => ({
            ...prev,
            ...data.student,
            stats: data.statistics,
            enrolledCourses: data.enrolledCourses || []
          }));
        }
        
        // Update grades data with proper formatting and ranking
        if (data.examResults && data.examResults.length > 0) {
          // Group results by exam to calculate proper ranking
          const examGroups = {};
          
          data.examResults.forEach((result) => {
            const examKey = result.examTitle || result.title || 'امتحان غير محدد';
            if (!examGroups[examKey]) {
              examGroups[examKey] = [];
            }
            examGroups[examKey].push(result);
          });
          
          // Calculate ranking within each exam group
          const processedResults = [];
          
          Object.keys(examGroups).forEach(examKey => {
            const examResults = examGroups[examKey];
            
            // Sort by percentage within each exam
            const sortedExamResults = examResults
              .map((result, index) => ({
                ...result,
                // Ensure proper field mapping
                examTitle: result.examTitle || result.title || examKey,
                courseName: result.courseName || result.course?.title || 'غير محدد',
                studentScore: result.studentScore || result.score || 0,
                totalScore: result.totalScore || result.maxScore || 100,
                percentage: result.percentage || Math.round(((result.studentScore || result.score || 0) / (result.totalScore || result.maxScore || 100)) * 100),
                grade: result.grade || getGradeFromPercentage(result.percentage || Math.round(((result.studentScore || result.score || 0) / (result.totalScore || result.maxScore || 100)) * 100)),
                examDate: result.examDate || result.submittedAt || result.createdAt,
                totalStudents: examResults.length
              }))
              .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
              .map((result, index) => ({
                ...result,
                rank: index + 1, // Rank within this specific exam
                totalStudents: examResults.length
              }));
            
            processedResults.push(...sortedExamResults);
          });
          
          // Sort all results by date (most recent first)
          const finalResults = processedResults.sort((a, b) => 
            new Date(b.examDate || 0) - new Date(a.examDate || 0)
          );
          
          setGradesData(finalResults);
        } else {
          setGradesData([]);
        }
        
        // Update charts data
        if (data.progressCharts) {
          const charts = data.progressCharts;
          setGradeProgression(charts.gradeProgression || [
            { month: 'سبتمبر', grade: 82 },
            { month: 'أكتوبر', grade: 85 },
            { month: 'نوفمبر', grade: 88 },
            { month: 'ديسمبر', grade: 87 }
          ]);
          setSubjectDistribution(charts.subjectDistribution || [
            { subject: 'اختبار النحو', score: 96, color: '#F59E0B' },
            { subject: 'اختبار الأدب', score: 82, color: '#EF4444' },
            { subject: 'اختبار التعبير', score: 78, color: '#8B5CF6' },
            { subject: 'اختبار البلاغة', score: 84, color: '#06B6D4' },
            { subject: 'اختبار الإملاء', score: 90, color: '#10B981' }
          ]);
          setAttendanceChart(charts.attendanceChart || []);
          setCompletionRates(charts.completionRates || [
            { name: 'مكتمل', value: 67, color: '#10B981' },
            { name: 'جاري', value: 33, color: '#06B6D4' }
          ]);
        }
        
        // Update enrolled courses
        if (data.enrolledCourses) {
          setSelectedChild(prev => ({
            ...prev,
            enrolledCourses: data.enrolledCourses
          }));
        }
        
        // Update monthly grades
        if (data.monthlyGrades) {
          // This will be used for monthly reports display
          // console.log('Monthly grades:', data.monthlyGrades);
        }
        
        // Show success message only once (remove to prevent spam)
        // toast({
        //   title: "تم التحديث",
        //   description: `تم تحميل بيانات ${data.student?.firstName} ${data.student?.secondName} بنجاح`,
        //   variant: "success",
        // });
        
      } else {
        console.error('API returned error:', response.data.message);
        toast({
          title: "خطأ",
          description: response.data.message || "فشل في تحميل بيانات الطفل",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching comprehensive child data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الطفل من قاعدة البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchParentData();
  }, []);

  // Handle student selection from URL params
  useEffect(() => {
    if (studentId && children.length > 0) {
      const targetChild = children.find(child => child._id === studentId);
      if (targetChild && (!selectedChild || selectedChild._id !== targetChild._id)) {
        setSelectedChild(targetChild);
      }
    }
  }, [studentId, children, selectedChild?._id]);

  useEffect(() => {
    if (selectedChild && selectedChild._id) {
      // Add debounce to prevent multiple calls
      const timeoutId = setTimeout(() => {
      fetchChildData(selectedChild._id);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedChild?._id, fetchChildData]); // Include fetchChildData in dependencies

  // Fetch parent's children data
  const fetchParentData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/parent/children');
      
      if (response.data.success) {
        // Safely handle children data with fallback to empty array
        const childrenData = response.data.children || [];
        setChildren(childrenData);
        
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0]);
          // Show success message with student info
          toast({
            title: "مرحباً بك",
            description: `تم تحميل بيانات طفلك: ${childrenData[0].firstName} ${childrenData[0].secondName}`,
            variant: "success",
          });
        }
      } else {
        // Set empty array if request failed
        setChildren([]);
        toast({
          title: "خطأ",
          description: response.data.message || "فشل في تحميل بيانات الأطفال",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching parent data:', error);
      // Set empty array on error to prevent undefined errors
      setChildren([]);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الأطفال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/parent/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigate to student account
  const navigateToStudentAccount = () => {
    if (selectedChild) {
      // Navigate to student login page with pre-filled email
      navigate('/login', { 
        state: { 
          preFilledEmail: selectedChild.userEmail,
          message: `انتقال لحساب الطالب: ${selectedChild.firstName} ${selectedChild.secondName}`,
          studentId: selectedChild.studentId
        } 
      });
      
      toast({
        title: "انتقال لحساب الطالب",
        description: `سيتم توجيهك لحساب ${selectedChild.firstName} ${selectedChild.secondName}`,
        variant: "default",
      });
    }
  };

  // Handle student linking with robust error handling and concurrency protection
  const handleLinkStudent = async (e) => {
    e.preventDefault();
    
    // Prevent double-clicks
    if (linkingStudent) {
      return;
    }
    
    if (!studentIdInput.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال معرف الطالب",
        variant: "destructive",
      });
      return;
    }

    setLinkingStudent(true);
    try {
      // Use the new robust endpoint (fallback to user ID from token)
      const response = await axiosInstance.post('/api/parent/link-student-robust', {
        studentUniqueId: studentIdInput.trim()
      });

      // Handle different response statuses
      switch (response.status) {
        case 201: // Successfully linked
          toast({
            title: "تم بنجاح",
            description: response.data.message,
            variant: "success"
          });
          
          // Add the new student to children list
          const newStudent = response.data.student;
          setChildren(prev => [...prev, newStudent]);
          setSelectedChild(newStudent);
          
          // Close modal and reset input
          setShowLinkModal(false);
          setStudentIdInput('');
          
          // Redirect to student stats page
          if (response.data.redirectUrl) {
            navigate(response.data.redirectUrl);
          }
          
          // Refresh parent data to get updated children list
          await fetchParentData();
          break;
          
        case 200: // Already linked (idempotent)
          toast({
            title: "معلومات",
            description: response.data.message,
            variant: "default"
          });
          
          // Show "Go to stats" button or redirect
          const existingStudent = response.data.student;
          setChildren(prev => {
            const exists = prev.find(child => child._id === existingStudent._id);
            if (!exists) {
              return [...prev, existingStudent];
            }
            return prev;
          });
          setSelectedChild(existingStudent);
          
          // Close modal and reset input
          setShowLinkModal(false);
          setStudentIdInput('');
          
          // Navigate to stats page
          navigate(`/parent/stats/${existingStudent._id}`);
          break;
          
        default:
          toast({
            title: "خطأ غير متوقع",
            description: response.data.message || "حدث خطأ غير متوقع",
            variant: "destructive",
          });
      }
    } catch (error) {
      console.error('Link student error:', error);
      
      // Handle different error statuses
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            if (data.status === 'already_linked') {
              toast({
                title: "معلومات",
                description: "هذا الطالب مرتبط بالفعل بولي أمر آخر",
                variant: "default"
              });
            } else {
              toast({
                title: "خطأ في البيانات",
                description: data.message || "بيانات غير صحيحة",
                variant: "destructive"
              });
            }
            break;
            
          case 403:
            toast({
              title: "حد أقصى",
              description: data.message || "تم الوصول للحد الأقصى من الطلاب (3 طلاب)",
              variant: "destructive"
            });
            break;
            
          case 404:
            toast({
              title: "غير موجود",
              description: data.message || "لم يتم العثور على الطالب",
              variant: "destructive"
            });
            break;
            
          case 500:
            toast({
              title: "خطأ في الخادم",
              description: "حدث خطأ في الخادم، يرجى المحاولة لاحقاً",
              variant: "destructive"
            });
            break;
            
          default:
            toast({
              title: "خطأ",
              description: data.message || "فشل في ربط الطالب",
              variant: "destructive"
            });
        }
      } else {
        // Network or other errors
        toast({
          title: "خطأ في الاتصال",
          description: "تحقق من اتصال الإنترنت وحاول مرة أخرى",
          variant: "destructive"
        });
      }
    } finally {
      setLinkingStudent(false);
    }
  };

  // Export child report
  const exportReport = async (childId) => {
    try {
      const response = await axiosInstance.get(`/api/parent/${user._id}/export-report/${childId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `تقرير_${selectedChild?.firstName}_${selectedChild?.secondName}_${new Date().getFullYear()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "تم التصدير",
        description: "تم تحميل التقرير بنجاح",
        variant: "success"
      });
    } catch (error) {
      console.error('Export report error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  // Chart colors
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="p-8 rounded-full bg-white dark:bg-gray-800 shadow-lg"
          >
            <Users size={32} className="text-blue-600 dark:text-blue-400" />
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  if (!children || children.length === 0) {
    return (
      <PageWrapper>
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            {/* Floating Orbs */}
            <motion.div
              className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"
              animate={{
                y: [0, 15, 0],
                x: [0, -15, 0],
                scale: [1, 0.9, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
            <motion.div
              className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
              animate={{
                y: [0, -25, 0],
                x: [0, 20, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-12 h-full">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-white/10"></div>
                ))}
              </div>
            </div>

            {/* Animated Lines */}
            <motion.div
              className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl"
            >
              {/* Glowing Card */}
              <div className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-800/90 via-purple-900/80 to-slate-800/90 backdrop-blur-xl rounded-3xl">
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                
                {/* Card Border Glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-cyan-500/30 p-[1px]">
                  <div className="h-full w-full rounded-3xl bg-gradient-to-br from-slate-800/90 via-purple-900/80 to-slate-800/90"></div>
                </div>

                <div className="relative p-4 sm:p-6 lg:p-8">
                  {/* Linked Students Section */}
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="relative mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                          <Users className="text-white text-lg sm:text-xl" />
                        </div>
                        {/* Orbiting Elements */}
                        <motion.div
                          className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                          className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-emerald-400 rounded-full"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                        الطلاب المرتبطين
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {children && children.length > 0 
                          ? "اختر طالباً لعرض بياناته التفصيلية"
                          : "لا يوجد طلاب مرتبطين بحسابك حالياً"
                        }
                      </p>
                    </div>

                    {/* Students Grid or Empty State */}
                    {children && children.length > 0 ? (
                      <div className="grid gap-4">
                        {children.map((child, index) => (
                          <motion.div
                            key={child._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedChild(child);
                              navigate(`/parent/dashboard/${child._id}`);
                            }}
                            className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition-all duration-300 group"
                          >
                            {/* Card Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Card Border Glow */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="h-full w-full rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10"></div>
                            </div>

                            <div className="relative flex items-center gap-4">
                              {/* Student Avatar */}
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg">
                                  <User className="text-white text-lg" />
                                </div>
                                {/* Online Status Indicator */}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white/20 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              </div>

                              {/* Student Info */}
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-lg mb-1">
                                  {child.firstName} {child.secondName} {child.thirdName} {child.fourthName}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-300">
                                  {child.studentId && (
                                    <div className="flex items-center gap-1">
                                      <GraduationCap size={14} />
                                      <span>{child.studentId}</span>
                                    </div>
                                  )}
                                  {child.grade && (
                                    <div className="flex items-center gap-1">
                                      <BookOpen size={14} />
                                      <span>{child.grade}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="flex items-center gap-2">
                                <motion.div
                                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <ArrowLeft size={16} className="text-white" />
                                </motion.div>
                                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                                  عرض البيانات
                                </span>
                              </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-2 right-2 opacity-20">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              >
                                <Star size={16} className="text-green-400" />
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      /* Empty State */
                      <motion.div
                        className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-white/5 via-white/3 to-white/5 backdrop-blur-sm rounded-2xl p-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {/* Card Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-gray-500/3 to-gray-500/5 rounded-2xl"></div>
                        
                        <div className="relative text-center">
                          {/* Empty State Icon */}
                          <div className="relative mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 rounded-full flex items-center justify-center shadow-lg mx-auto">
                              <Users className="text-white text-2xl opacity-50" />
                            </div>
                            {/* Floating Elements */}
                            <motion.div
                              className="absolute -top-2 -right-2 w-3 h-3 bg-gray-400 rounded-full opacity-30"
                              animate={{ 
                                y: [0, -10, 0],
                                opacity: [0.3, 0.6, 0.3]
                              }}
                              transition={{ duration: 3, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute -bottom-2 -left-2 w-2 h-2 bg-gray-400 rounded-full opacity-30"
                              animate={{ 
                                y: [0, 10, 0],
                                opacity: [0.3, 0.6, 0.3]
                              }}
                              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                            />
                          </div>

                          {/* Empty State Text */}
                          <h4 className="text-xl font-semibold text-gray-300 mb-3">
                            لا يوجد طلاب مرتبطين
                          </h4>
                          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            لم يتم ربط أي طلاب بحسابك بعد.<br />
                            استخدم النموذج أدناه لربط طالب جديد باستخدام معرفه.
                          </p>

                          {/* Decorative Elements */}
                          <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1 h-1 bg-gray-400 rounded-full opacity-30"
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Decorative Elements */}
                    <motion.div
                      className="flex justify-center mt-6 space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Divider */}
                  <motion.div
                    className="flex items-center gap-4 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <div className="px-4 py-2 bg-white/10 rounded-full">
                      <span className="text-xs text-gray-400 font-medium">أو</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </motion.div>

                  {/* Header */}
                  <motion.div 
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                        <UserCheck className="text-white text-2xl" />
                      </div>
                      {/* Orbiting Elements */}
                      <motion.div
                        className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div
                        className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  ربط طالب جديد
                </h3>
                    <p className="text-gray-300 text-sm">
                      أدخل معرف الطالب لربطه بحسابك
                    </p>
                  </motion.div>

                  {/* Form */}
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3 text-right">
                        معرف الطالب
                    </label>
                      <div className="relative">
                    <input
                      type="text"
                      value={studentIdInput}
                      onChange={(e) => {
                        console.log('Input changed:', e.target.value);
                        setStudentIdInput(e.target.value);
                      }}
                          placeholder="STU12345678 أو 68d63f08a591bd7652e3bf84"
                          className="w-full px-6 py-4 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-center font-mono text-sm hover:bg-white/20"
                      disabled={linkingStudent}
                      autoFocus
                    />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      <motion.p 
                        className="text-xs text-gray-400 mt-3 text-center leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        يمكن استخدام معرف الطالب أو ObjectId من قاعدة البيانات
                      </motion.p>
                  </div>
                  
                    <motion.button
                    onClick={handleLinkStudent}
                    disabled={linkingStudent || !studentIdInput.trim()}
                      className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 flex items-center gap-3">
                    {linkingStudent ? (
                      <>
                            <RefreshCw size={20} className="animate-spin" />
                        جاري الربط...
                      </>
                    ) : (
                      <>
                            <UserCheck size={20} />
                        ربط الطالب
                      </>
                    )}
                      </span>
                    </motion.button>
                  </motion.div>

                  {/* Decorative Elements */}
                  <motion.div
                    className="flex justify-center mt-8 space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Award className="w-4 h-4 text-white" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  y: [0, 8, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <CheckCircle className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
              </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 light:from-gray-50 light:via-white light:to-gray-100">
        {/* Luxury Elegant Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Elegant Floating Orbs */}
          <motion.div
            className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-cyan-400/20 via-blue-500/25 to-purple-600/20 dark:from-cyan-400/20 dark:via-blue-500/25 dark:to-purple-600/20 light:from-cyan-500/15 light:via-blue-600/20 light:to-purple-700/15 rounded-full blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.3)] dark:shadow-[0_0_80px_rgba(6,182,212,0.4)] light:shadow-[0_0_40px_rgba(6,182,212,0.2)]"
            animate={{
              y: [0, -20, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-32 right-20 w-72 h-72 bg-gradient-to-r from-purple-500/20 via-pink-500/25 to-orange-500/20 dark:from-purple-500/20 dark:via-pink-500/25 dark:to-orange-500/20 light:from-purple-600/15 light:via-pink-600/20 light:to-orange-600/15 rounded-full blur-2xl shadow-[0_0_60px_rgba(168,85,247,0.3)] dark:shadow-[0_0_80px_rgba(168,85,247,0.4)] light:shadow-[0_0_40px_rgba(168,85,247,0.2)]"
            animate={{
              y: [0, 25, 0],
              x: [0, -20, 0],
              scale: [1, 0.95, 1],
              rotate: [360, 270, 180, 90, 0]
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/20 via-teal-500/25 to-cyan-500/20 dark:from-emerald-500/20 dark:via-teal-500/25 dark:to-cyan-500/20 light:from-emerald-600/15 light:via-teal-600/20 light:to-cyan-600/15 rounded-full blur-2xl shadow-[0_0_60px_rgba(16,185,129,0.3)] dark:shadow-[0_0_80px_rgba(16,185,129,0.4)] light:shadow-[0_0_40px_rgba(16,185,129,0.2)]"
            animate={{
              y: [0, -30, 0],
              x: [0, 25, 0],
              scale: [1, 1.15, 1],
              rotate: [0, -90, -180, -270, -360]
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10
            }}
          />
          <motion.div
            className="absolute bottom-32 right-1/4 w-56 h-56 bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-orange-500/20 dark:from-amber-500/20 dark:via-yellow-500/25 dark:to-orange-500/20 light:from-amber-600/15 light:via-yellow-600/20 light:to-orange-600/15 rounded-full blur-2xl shadow-[0_0_60px_rgba(245,158,11,0.3)] dark:shadow-[0_0_80px_rgba(245,158,11,0.4)] light:shadow-[0_0_40px_rgba(245,158,11,0.2)]"
            animate={{
              y: [0, 20, 0],
              x: [0, -15, 0],
              scale: [1, 1.05, 1],
              rotate: [360, 0, -360]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 15
            }}
          />

          {/* Elegant Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-15 dark:opacity-25 light:opacity-10">
            <div className="grid grid-cols-12 h-full">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border border-cyan-400/30 dark:border-cyan-400/40 light:border-cyan-500/30"></div>
              ))}
            </div>
          </div>

          {/* Elegant Subtle Lines */}
          <motion.div
            className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent dark:via-cyan-400/50 light:via-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.4)] dark:shadow-[0_0_12px_rgba(6,182,212,0.5)] light:shadow-[0_0_6px_rgba(6,182,212,0.3)]"
            animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent dark:via-purple-400/50 light:via-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.4)] dark:shadow-[0_0_12px_rgba(168,85,247,0.5)] light:shadow-[0_0_6px_rgba(168,85,247,0.3)]"
            animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: 4 }}
          />
          <motion.div
            className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-pink-400/30 to-transparent dark:via-pink-400/40 light:via-pink-500/30 shadow-[0_0_8px_rgba(236,72,153,0.4)] dark:shadow-[0_0_12px_rgba(236,72,153,0.5)] light:shadow-[0_0_6px_rgba(236,72,153,0.3)]"
            animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
          <motion.div
            className="absolute right-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent dark:via-emerald-400/40 light:via-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:shadow-[0_0_12px_rgba(16,185,129,0.5)] light:shadow-[0_0_6px_rgba(16,185,129,0.3)]"
            animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 6 }}
          />

          {/* Elegant Floating Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400/40 dark:bg-cyan-400/50 light:bg-cyan-500/40 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)] dark:shadow-[0_0_12px_rgba(6,182,212,0.5)] light:shadow-[0_0_6px_rgba(6,182,212,0.3)]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -80, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 360, 0]
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                delay: Math.random() * 20,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Subtle Colored Particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`colored-${i}`}
              className={`absolute w-1 h-1 rounded-full ${
                i % 3 === 0 ? 'bg-purple-400/30 dark:bg-purple-400/40 light:bg-purple-500/30' :
                i % 3 === 1 ? 'bg-emerald-400/30 dark:bg-emerald-400/40 light:bg-emerald-500/30' :
                'bg-pink-400/30 dark:bg-pink-400/40 light:bg-pink-500/30'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -60, 0],
                opacity: [0, 0.8, 0],
                scale: [0, 0.8, 0],
                rotate: [0, -180, 0]
              }}
              transition={{
                duration: Math.random() * 25 + 25,
                repeat: Infinity,
                delay: Math.random() * 25,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Elegant Subtle Geometric Pattern */}
          <div className="absolute inset-0 opacity-10 dark:opacity-20 light:opacity-8">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="hexagons" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                  <polygon points="12.5,2 22,8 22,17 12.5,23 3,17 3,8" fill="none" stroke="rgba(6,182,212,0.3)" className="dark:stroke-cyan-400/30 light:stroke-cyan-500/30" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#hexagons)" />
            </svg>
        </div>
          
          {/* Subtle Dot Pattern */}
          <div className="absolute inset-0 opacity-8 dark:opacity-15 light:opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="rgba(168,85,247,0.2)" className="dark:fill-purple-400/20 light:fill-purple-500/20"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          </div>
        </div>
        {/* Compact Luxury Header */}
        <div className="relative z-10 w-full bg-gradient-to-r from-slate-800/95 via-gray-900/98 to-slate-800/95 dark:from-slate-800/95 dark:via-gray-900/98 dark:to-slate-800/95 light:from-white/95 light:via-gray-50/98 light:to-white/95 backdrop-blur-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:shadow-[0_0_20px_rgba(6,182,212,0.25)] light:shadow-[0_0_10px_rgba(6,182,212,0.1)] border-b border-cyan-400/25 dark:border-cyan-400/35 light:border-cyan-600/15">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 via-blue-500/5 to-purple-500/3 dark:from-cyan-500/5 dark:via-blue-500/8 dark:to-purple-500/5 light:from-cyan-500/2 light:via-blue-500/3 light:to-purple-500/2"></div>
          <div className="relative w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                  className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/12 dark:bg-cyan-500/15 light:bg-cyan-500/6 backdrop-blur-sm text-cyan-400 dark:text-cyan-300 light:text-cyan-600 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 light:hover:bg-cyan-500/8 transition-all duration-300 border border-cyan-400/15 dark:border-cyan-400/25 light:border-cyan-600/10 shadow-[0_0_8px_rgba(6,182,212,0.15)] dark:shadow-[0_0_12px_rgba(6,182,212,0.25)] light:shadow-[0_0_6px_rgba(6,182,212,0.1)] hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] light:hover:shadow-[0_0_8px_rgba(6,182,212,0.15)]"
              >
                <ArrowLeft size={16} className="sm:w-4 sm:h-4" />
              </motion.button>
              
              <div className="min-w-0 flex-1">
                  {/* Desktop Title */}
                  <h1 className="hidden sm:block text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 dark:from-cyan-300 dark:via-blue-300 dark:to-purple-300 light:from-cyan-600 light:via-blue-600 light:to-purple-600 bg-clip-text text-transparent mb-1 drop-shadow-[0_0_4px_rgba(6,182,212,0.25)] dark:drop-shadow-[0_0_6px_rgba(6,182,212,0.35)] light:drop-shadow-[0_0_3px_rgba(6,182,212,0.15)]">
                    {selectedChild ? `درجات ${selectedChild.firstName} ${selectedChild.secondName}` : 'درجات أولادي'}
                  </h1>
                  {/* Mobile Title */}
                  <h1 className="sm:hidden text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 dark:from-cyan-300 dark:via-blue-300 dark:to-purple-300 light:from-cyan-600 light:via-blue-600 light:to-purple-600 bg-clip-text text-transparent mb-1 drop-shadow-[0_0_4px_rgba(6,182,212,0.25)] dark:drop-shadow-[0_0_6px_rgba(6,182,212,0.35)] light:drop-shadow-[0_0_3px_rgba(6,182,212,0.15)]">
                    {selectedChild ? `درجات ${selectedChild.firstName}` : 'درجات أولادي'}
                  </h1>
                  
                  {/* Desktop Subtitle */}
                  <p className="hidden sm:block text-cyan-300 dark:text-cyan-200 light:text-cyan-700 text-sm lg:text-base font-medium">
                    {selectedChild ? 
                      `` : 
                      'تابع أداء أطفالك الأكاديمي'
                    }
                  </p>
                  {/* Mobile Subtitle */}
                  <p className="sm:hidden text-cyan-300 dark:text-cyan-200 light:text-cyan-700 text-xs font-medium">
                    {selectedChild ? 
                      `تابع الأداء الأكاديمي` : 
                      'تابع أداء أطفالك'
                    }
                  </p>
                  
                  {selectedChild && (
                    <div className="mt-1 flex items-center gap-2">
                      <CheckCircle size={10} className="text-emerald-400 dark:text-emerald-300 light:text-emerald-600 drop-shadow-[0_0_2px_rgba(16,185,129,0.25)] dark:drop-shadow-[0_0_3px_rgba(16,185,129,0.35)] light:drop-shadow-[0_0_1px_rgba(16,185,129,0.15)] flex-shrink-0" />
                      <span className="text-emerald-300 dark:text-emerald-200 light:text-emerald-700 text-xs font-medium leading-tight">
                        <span className="hidden xs:inline">تم تحميل البيانات تلقائياً</span>
                        <span className="xs:hidden">تم التحميل</span>
                      </span>
                    </div>
                  )}
              </div>
            </div>
            
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Theme Toggle Buttons */}
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                    }}
                    className="p-2 rounded-lg bg-gradient-to-r from-yellow-500/12 to-orange-500/12 dark:from-yellow-500/15 dark:to-orange-500/15 light:from-yellow-500/6 light:to-orange-500/6 backdrop-blur-sm text-yellow-300 dark:text-yellow-200 light:text-yellow-700 hover:from-yellow-500/15 hover:to-orange-500/15 dark:hover:from-yellow-500/20 dark:hover:to-orange-500/20 light:hover:from-yellow-500/8 light:hover:to-orange-500/8 transition-all duration-300 border border-yellow-400/20 dark:border-yellow-400/30 light:border-yellow-600/15 shadow-[0_0_8px_rgba(245,158,11,0.15)] dark:shadow-[0_0_12px_rgba(245,158,11,0.25)] light:shadow-[0_0_6px_rgba(245,158,11,0.1)] hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] dark:hover:shadow-[0_0_15px_rgba(245,158,11,0.35)] light:hover:shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                  >
                    <Sun size={16} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      document.documentElement.classList.remove('light');
                      document.documentElement.classList.add('dark');
                    }}
                    className="p-2 rounded-lg bg-gradient-to-r from-slate-500/12 to-gray-500/12 dark:from-slate-500/15 dark:to-gray-500/15 light:from-slate-500/6 light:to-gray-500/6 backdrop-blur-sm text-slate-300 dark:text-slate-200 light:text-slate-700 hover:from-slate-500/15 hover:to-gray-500/15 dark:hover:from-slate-500/20 dark:hover:to-gray-500/20 light:hover:from-slate-500/8 light:hover:to-gray-500/8 transition-all duration-300 border border-slate-400/20 dark:border-slate-400/30 light:border-slate-600/15 shadow-[0_0_8px_rgba(71,85,105,0.15)] dark:shadow-[0_0_12px_rgba(71,85,105,0.25)] light:shadow-[0_0_6px_rgba(71,85,105,0.1)] hover:shadow-[0_0_12px_rgba(71,85,105,0.25)] dark:hover:shadow-[0_0_15px_rgba(71,85,105,0.35)] light:hover:shadow-[0_0_8px_rgba(71,85,105,0.15)]"
                  >
                    <Moon size={16} />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/parent/link-student')}
                  className="px-2 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/15 to-blue-500/15 dark:from-cyan-500/20 dark:to-blue-500/20 light:from-cyan-500/8 light:to-blue-500/8 backdrop-blur-sm text-cyan-300 dark:text-cyan-200 light:text-cyan-700 hover:from-cyan-500/20 hover:to-blue-500/20 dark:hover:from-cyan-500/25 dark:hover:to-blue-500/25 light:hover:from-cyan-500/12 light:hover:to-blue-500/12 transition-all duration-300 flex items-center gap-1 sm:gap-2 border border-cyan-400/30 dark:border-cyan-400/40 light:border-cyan-600/20 shadow-[0_0_12px_rgba(6,182,212,0.2)] dark:shadow-[0_0_18px_rgba(6,182,212,0.3)] light:shadow-[0_0_8px_rgba(6,182,212,0.15)] hover:shadow-[0_0_18px_rgba(6,182,212,0.3)] dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] light:hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] text-xs sm:text-sm font-medium"
                >
                  <UserCheck size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">ربط طالب جديد</span>
                  <span className="xs:hidden">ربط</span>
                </motion.button>
                
                {/* Navigate to Student Account Button */}
                {selectedChild && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigateToStudentAccount()}
                    className="px-3 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-sm text-white hover:from-emerald-500/30 hover:to-green-500/30 transition-all duration-200 flex items-center gap-1 sm:gap-2 border border-emerald-400/30 text-xs sm:text-sm"
                  >
                    <Users size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">حساب {selectedChild.firstName}</span>
                    <span className="xs:hidden">حساب</span>
                  </motion.button>
                )}
                
                <button
                  onClick={() => {
                    console.log('Link student button clicked');
                    setShowLinkModal(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 flex items-center gap-2 border border-purple-400/30"
                >
                  <Plus size={18} />
                  ربط سريع
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('attendance')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm text-white hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-200 flex items-center gap-2 border border-orange-400/30"
                >
                  <Calendar size={18} />
                  تقرير الحضور
                </motion.button>
              
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-6 py-3 rounded-xl bg-red-500/20 backdrop-blur-sm text-white hover:bg-red-500/30 transition-all duration-200 flex items-center gap-2 border border-red-400/30"
                >
                  <LogOut size={18} />
                  تسجيل الخروج
                </motion.button>
                
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                  <User size={20} className="text-white" />
                  <span className="text-white font-medium">
                    {user.firstName} {user.lastName}
                </span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Children Selection */}
        {children && children.length > 1 && (
          <div className="relative z-10 bg-white/10 backdrop-blur-sm border-b border-white/20">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium text-white">
                  اختر الطفل:
                </span>
                {children.map((child) => (
                  <motion.button
                    key={child.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedChild(child)}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                      selectedChild?.id === child.id
                        ? 'bg-blue-500/30 border-blue-400 text-white backdrop-blur-sm'
                        : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 backdrop-blur-sm'
                    }`}
                  >
                    {child.firstName} {child.lastName}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

          {/* Main Content - Full Screen */}
        <div className="relative z-10 w-full px-8 py-8">
          {/* Welcome Message */}
          {selectedChild && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    مرحباً بك في لوحة تحكم طفلك
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    تم تحميل بيانات <span className="font-semibold text-green-600 dark:text-green-400">
                      {selectedChild.firstName} {selectedChild.secondName}
                    </span> تلقائياً. يمكنك الآن متابعة أدائه الأكاديمي والاطلاع على إحصائياته.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
            <AnimatePresence mode="wait">
            {activeTab === 'grades' && (
                <motion.div
                key="grades"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Child Info Card */}
                {selectedChild && (
                  <LuxuryCard className="p-8 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <GraduationCap size={32} className="text-white" />
                      </div>
                      
                        <div>
                          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                            {selectedChild.firstName} {selectedChild.secondName} {selectedChild.thirdName} {selectedChild.fourthName}
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                              <Users size={16} className="text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">معرف الطالب:</span>
                              <span className="font-mono text-gray-800 dark:text-white">{selectedChild.studentId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <Mail size={16} className="text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">البريد:</span>
                              <span className="text-gray-800 dark:text-white">{selectedChild.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <Phone size={16} className="text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">الهاتف:</span>
                              <span className="text-gray-800 dark:text-white">{selectedChild.phoneStudent}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">المحافظة:</span>
                              <span className="text-gray-800 dark:text-white">{selectedChild.governorate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => exportReport(selectedChild._id)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                      >
                        <Download size={18} />
                        تصدير التقرير
                      </motion.button>
                      </div>
                    </LuxuryCard>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">جاري تحميل البيانات...</span>
                  </div>
                )}

                {/* Enhanced Student Statistics Dashboard */}
                {!loading && selectedChild && selectedChild.stats && (
                  <div className="space-y-8">
                    {/* Ultra Premium Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group"
                      >
                        <LuxuryCard className="p-8 bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-900/15 light:from-white/20 light:to-gray-50/20 hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] dark:hover:shadow-[0_0_80px_rgba(6,182,212,0.7)] light:hover:shadow-[0_0_50px_rgba(6,182,212,0.3)] transition-all duration-500 border border-cyan-400/40 dark:border-cyan-400/50 light:border-cyan-600/30 backdrop-blur-md relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.5)] light:shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 light:from-cyan-500/5 light:to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 dark:from-cyan-400/40 dark:to-blue-500/40 light:from-cyan-400/20 light:to-blue-500/20 rounded-full blur-xl shadow-[0_0_30px_rgba(6,182,212,0.4)] dark:shadow-[0_0_40px_rgba(6,182,212,0.6)] light:shadow-[0_0_25px_rgba(6,182,212,0.2)]"></div>
                          <div className="relative z-10 flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 light:text-cyan-700 mb-2 font-semibold">إجمالي الكورسات</p>
                              <p className="text-4xl font-bold text-cyan-800 dark:text-cyan-200 light:text-cyan-900 mb-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)] dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] light:drop-shadow-[0_0_8px_rgba(6,182,212,0.2)]">{selectedChild.stats.totalCourses || 0}</p>
                              <p className="text-xs text-cyan-500 dark:text-cyan-300 light:text-cyan-600 font-medium">مقررات مسجلة</p>
                          </div>
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] dark:shadow-[0_0_40px_rgba(6,182,212,0.6)] light:shadow-[0_0_25px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] dark:group-hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] light:group-hover:shadow-[0_0_35px_rgba(6,182,212,0.3)] transition-all duration-500 group-hover:scale-110">
                              <BookOpen size={28} className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                          </div>
                        </div>
                      </LuxuryCard>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group"
                      >
                        <LuxuryCard className="p-8 bg-gradient-to-br from-emerald-50/20 to-green-100/20 dark:from-gray-800/15 dark:to-gray-900/15 light:from-white/20 light:to-gray-50/20 hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] dark:hover:shadow-[0_0_80px_rgba(16,185,129,0.7)] light:hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] transition-all duration-500 border border-emerald-400/40 dark:border-emerald-400/50 light:border-emerald-600/30 backdrop-blur-md relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] dark:shadow-[0_0_40px_rgba(16,185,129,0.5)] light:shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20 light:from-emerald-500/5 light:to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/30 to-green-500/30 dark:from-emerald-400/40 dark:to-green-500/40 light:from-emerald-400/20 light:to-green-500/20 rounded-full blur-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] dark:shadow-[0_0_40px_rgba(16,185,129,0.6)] light:shadow-[0_0_25px_rgba(16,185,129,0.2)]"></div>
                          <div className="relative z-10 flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 light:text-emerald-700 mb-2 font-semibold">الكورسات المكتملة</p>
                              <p className="text-4xl font-bold text-emerald-800 dark:text-emerald-200 light:text-emerald-900 mb-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] dark:drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] light:drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">{selectedChild.stats.completedCourses || 0}</p>
                              <p className="text-xs text-emerald-500 dark:text-emerald-300 light:text-emerald-600 font-medium">مقررات منجزة</p>
                          </div>
                            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] dark:shadow-[0_0_40px_rgba(16,185,129,0.6)] light:shadow-[0_0_25px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] dark:group-hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] light:group-hover:shadow-[0_0_35px_rgba(16,185,129,0.3)] transition-all duration-500 group-hover:scale-110">
                              <CheckCircle size={28} className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                          </div>
                        </div>
                      </LuxuryCard>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group"
                      >
                        <LuxuryCard className="p-8 bg-gradient-to-br from-amber-50/20 to-yellow-100/20 dark:from-gray-800/15 dark:to-gray-900/15 light:from-white/20 light:to-gray-50/20 hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] dark:hover:shadow-[0_0_80px_rgba(245,158,11,0.7)] light:hover:shadow-[0_0_50px_rgba(245,158,11,0.3)] transition-all duration-500 border border-amber-400/40 dark:border-amber-400/50 light:border-amber-600/30 backdrop-blur-md relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.3)] dark:shadow-[0_0_40px_rgba(245,158,11,0.5)] light:shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full blur-xl"></div>
                          <div className="relative z-10 flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">متوسط الدرجات</p>
                              <p className="text-4xl font-bold text-yellow-800 dark:text-yellow-200 mb-1">{selectedChild.stats.averageGrade || 0}%</p>
                              <p className="text-xs text-yellow-500 dark:text-yellow-300">تقييم ممتاز</p>
                          </div>
                            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                              <Award size={28} className="text-white" />
                          </div>
                        </div>
                      </LuxuryCard>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group"
                      >
                        <LuxuryCard className="p-8 bg-gradient-to-br from-violet-50/20 to-purple-100/20 dark:from-gray-800/15 dark:to-gray-900/15 light:from-white/20 light:to-gray-50/20 hover:shadow-[0_0_60px_rgba(168,85,247,0.5)] dark:hover:shadow-[0_0_80px_rgba(168,85,247,0.7)] light:hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] transition-all duration-500 border border-violet-400/40 dark:border-violet-400/50 light:border-violet-600/30 backdrop-blur-md relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)] dark:shadow-[0_0_40px_rgba(168,85,247,0.5)] light:shadow-[0_0_25px_rgba(168,85,247,0.2)]">
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-xl"></div>
                          <div className="relative z-10 flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">معدل الحضور</p>
                              <p className="text-4xl font-bold text-purple-800 dark:text-purple-200 mb-1">{selectedChild.stats.attendanceRate || 0}%</p>
                              <p className="text-xs text-purple-500 dark:text-purple-300">حضور منتظم</p>
                          </div>
                            <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-4 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                              <Calendar size={28} className="text-white" />
                          </div>
                        </div>
                      </LuxuryCard>
                      </motion.div>
                    </div>

                    {/* Ultra Premium Real-time Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group"
                      >
                        <LuxuryCard className="p-8 bg-gradient-to-br from-rose-50/90 to-pink-100/90 dark:from-rose-900/40 dark:to-pink-800/40 hover:shadow-2xl transition-all duration-500 border border-rose-200/30 dark:border-rose-500/30 backdrop-blur-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-400/20 to-pink-500/20 rounded-full blur-xl"></div>
                          <div className="relative z-10 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2">الاختبارات المجتازة</p>
                              <p className="text-4xl font-bold text-pink-800 dark:text-pink-200 mb-1">{selectedChild.stats.examsPassed || 0}</p>
                              <p className="text-xs text-pink-500 dark:text-pink-300">من أصل {selectedChild.stats.totalExams || 0}</p>
                            </div>
                            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                              <Target size={28} className="text-white" />
                            </div>
                          </div>
                        </LuxuryCard>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group"
                      >
                        <LuxuryCard className="p-8 bg-gradient-to-br from-indigo-50/90 to-indigo-100/90 dark:from-indigo-900/40 dark:to-indigo-800/40 hover:shadow-2xl transition-all duration-500 border border-indigo-200/30 dark:border-indigo-500/30 backdrop-blur-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-full blur-xl"></div>
                          <div className="relative z-10 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">آخر نشاط</p>
                              <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200 mb-1">{selectedChild.stats.lastActivity || 'غير محدد'}</p>
                              <p className="text-xs text-indigo-500 dark:text-indigo-300">نشاط حديث</p>
                            </div>
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-4 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                              <TrendingUp size={28} className="text-white" />
                            </div>
                          </div>
                        </LuxuryCard>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group"
                      >
                        <LuxuryCard className="p-8 bg-gradient-to-br from-teal-50/90 to-emerald-100/90 dark:from-teal-900/40 dark:to-emerald-800/40 hover:shadow-2xl transition-all duration-500 border border-teal-200/30 dark:border-teal-500/30 backdrop-blur-sm relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-400/20 to-emerald-500/20 rounded-full blur-xl"></div>
                          <div className="relative z-10 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">أعلى درجة</p>
                              <p className="text-4xl font-bold text-emerald-800 dark:text-emerald-200 mb-1">{selectedChild.stats.highestGrade || 0}%</p>
                              <p className="text-xs text-emerald-500 dark:text-emerald-300">أفضل أداء</p>
                            </div>
                            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110">
                              <Award size={28} className="text-white" />
                            </div>
                          </div>
                        </LuxuryCard>
                      </motion.div>
                    </div>

                    {/* Additional Detailed Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Academic Performance - Real Data */}
                      <LuxuryCard className="p-6">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                          <TrendingUp size={20} className="text-green-500" />
                          الأداء الأكاديمي من قاعدة البيانات
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">أعلى درجة</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {selectedChild.stats?.highestGrade || 0}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">أقل درجة</span>
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                              {selectedChild.stats?.lowestGrade || 0}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">الاختبارات المجتازة</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {selectedChild.stats?.examsPassed || 0}/{selectedChild.stats?.totalExams || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">متوسط الدرجات</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              {selectedChild.stats?.averageGrade || 0}%
                            </span>
                          </div>
                        </div>
                      </LuxuryCard>

                      {/* Progress & Activity - Real Data */}
                      <LuxuryCard className="p-6">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                          <Activity size={20} className="text-blue-500" />
                          النشاط والتقدم من قاعدة البيانات
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">الكورسات المسجلة</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              {selectedChild.stats?.totalCourses || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">الكورسات المكتملة</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {selectedChild.stats?.completedCourses || 0}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">معدل الحضور</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {selectedChild.stats?.attendanceRate || 0}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-300">آخر نشاط</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                              {selectedChild.stats?.lastActivity || 'غير محدد'}
                            </span>
                          </div>
                        </div>
                      </LuxuryCard>
                    </div>

                    {/* Real Course Progress Summary */}
                    <LuxuryCard className="p-6">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-orange-500" />
                        ملخص تقدم الكورسات من قاعدة البيانات
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedChild?.enrolledCourses && selectedChild.enrolledCourses.length > 0 ? (
                          selectedChild.enrolledCourses.map((course, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {course.courseName || 'كورس غير محدد'}
                                </span>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{course.progress || 0}%</span>
                            </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                {course.completedLessons || 0} من {course.totalLessons || 0} درس
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    (course.progress || 0) >= 90 ? 'bg-green-500' :
                                    (course.progress || 0) >= 70 ? 'bg-blue-500' :
                                    (course.progress || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${course.progress || 0}%` }}
                              ></div>
                            </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className={`px-2 py-1 rounded-full ${
                                  course.subscriptionStatus === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  course.subscriptionStatus === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                  {course.subscriptionStatus === 'Active' ? 'نشط' :
                                   course.subscriptionStatus === 'Completed' ? 'مكتمل' : 
                                   course.subscriptionStatus === 'Expired' ? 'منتهي' : 'غير محدد'}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {course.instructorName || 'غير محدد'}
                                </span>
                          </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8">
                            <BookOpen size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-300">
                              لا توجد كورسات مسجلة حالياً في قاعدة البيانات
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              تأكد من تسجيل الطالب في الكورسات أولاً
                            </p>
                          </div>
                        )}
                      </div>
                    </LuxuryCard>
                  </div>
                )}

                {/* Recent Test Results Table - Same as Student Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-700/15 light:from-cyan-50/30 light:to-blue-100/30 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  <h3 className="text-xl font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700 mb-6 flex items-center gap-2">
                    <Award size={24} />
                    نتائج الاختبارات الأخيرة
                  </h3>
                  
                  <div className="overflow-x-auto">
                    {gradesData && gradesData.length > 0 ? (
                      <table className="w-full table-fixed">
                        <thead>
                          <tr className="border-b border-cyan-400/30 dark:border-cyan-400/40 light:border-cyan-600/20">
                            <th className="text-right py-4 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-semibold w-32">
                              الاختبار
                            </th>
                            <th className="text-right py-4 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-semibold w-32">
                              المادة
                            </th>
                            <th className="text-center py-4 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-semibold w-24">
                              الدرجة
                            </th>
                            <th className="text-center py-4 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-semibold w-20">
                              النسبة
                            </th>
                            <th className="text-center py-4 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-semibold w-24">
                              التقدير
                            </th>
                            <th className="text-center py-4 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-semibold w-28">
                              التاريخ
                            </th>
                            <th className="text-center py-4 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-semibold w-20">
                              الترتيب
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradesData.map((grade, index) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                              className="border-b border-cyan-400/20 dark:border-cyan-400/30 light:border-cyan-600/15 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 light:hover:bg-cyan-500/5 transition-colors duration-300"
                            >
                              <td className="py-4 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600 font-medium text-right">
                                <div className="truncate" title={grade.examTitle || 'امتحان غير محدد'}>
                                  {grade.examTitle || 'امتحان غير محدد'}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600 text-right">
                                <div className="truncate" title={grade.courseName || 'غير محدد'}>
                                  {grade.courseName || 'غير محدد'}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="bg-cyan-500/10 px-3 py-1 rounded-lg text-sm font-mono font-bold text-cyan-200 dark:text-cyan-100 light:text-cyan-600">
                                  {grade.studentScore || 0}/{grade.totalScore || 0}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                  (grade.percentage || 0) >= 90 
                                    ? 'bg-emerald-500/20 text-emerald-300 dark:text-emerald-200 light:text-emerald-700'
                                    : (grade.percentage || 0) >= 80
                                    ? 'bg-blue-500/20 text-blue-300 dark:text-blue-200 light:text-blue-700'
                                    : (grade.percentage || 0) >= 70
                                    ? 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-200 light:text-yellow-700'
                                    : 'bg-red-500/20 text-red-300 dark:text-red-200 light:text-red-700'
                                }`}>
                                  {grade.percentage || 0}%
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  (grade.percentage || 0) >= 90 
                                    ? 'bg-emerald-500/20 text-emerald-300 dark:text-emerald-200 light:text-emerald-700'
                                    : (grade.percentage || 0) >= 80
                                    ? 'bg-blue-500/20 text-blue-300 dark:text-blue-200 light:text-blue-700'
                                    : (grade.percentage || 0) >= 70
                                    ? 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-200 light:text-yellow-700'
                                    : 'bg-red-500/20 text-red-300 dark:text-red-200 light:text-red-700'
                                }`}>
                                  {grade.grade || 'غير محدد'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600 text-sm text-center">
                                {grade.examDate ? new Date(grade.examDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="bg-cyan-500/20 px-3 py-1 rounded-lg text-sm font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700">
                                  {grade.rank ? `#${grade.rank}` : 'غير محدد'}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12">
                        <Award size={48} className="text-cyan-400 dark:text-cyan-500 light:text-cyan-600 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-cyan-300 dark:text-cyan-200 light:text-cyan-700 mb-2">
                          لا توجد نتائج امتحانات
                        </h4>
                        <p className="text-sm text-cyan-200 dark:text-cyan-100 light:text-cyan-600">
                          لم يتم العثور على نتائج امتحانات في قاعدة البيانات
                        </p>
                        <p className="text-xs text-cyan-400 dark:text-cyan-300 light:text-cyan-500 mt-2">
                          تأكد من أن الطالب قد أدى امتحانات في النظام
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                  {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Grade Progression Line Chart */}
                    <LuxuryCard className="p-6">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                      تطور الدرجات عبر الوقت
                      </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={gradeProgression}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#6B7280"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#6B7280"
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="grade" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      </div>
                    </LuxuryCard>

                  {/* Test Scores Bar Chart */}
                    <LuxuryCard className="p-6">
                    <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                      توزيع درجات الاختبارات
                      </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="subject" 
                            stroke="#6B7280"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="#6B7280"
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Bar 
                            dataKey="score" 
                            fill="#10B981"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                              </div>
                  </LuxuryCard>

                  {/* Charts and Statistics Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="col-span-1 lg:col-span-2 mb-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-700/15 light:from-cyan-50/30 light:to-blue-100/30 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                  >
                    <h3 className="text-xl font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700 mb-6 flex items-center gap-2">
                      <BarChart3 size={24} />
                      الرسوم البيانية والإحصائيات
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Grade Progression */}
                      <div className="lg:col-span-2">
                        <h4 className="text-lg font-semibold text-cyan-400 dark:text-cyan-300 light:text-cyan-600 mb-4">
                          تطور الدرجات الشهري
                        </h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={gradeProgression}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.2)" />
                              <XAxis dataKey="month" stroke="rgba(6,182,212,0.6)" />
                              <YAxis stroke="rgba(6,182,212,0.6)" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                  border: '1px solid rgba(6,182,212,0.3)',
                                  borderRadius: '8px',
                                  color: '#06B6D4'
                                }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="grade" 
                                stroke="#06B6D4" 
                                strokeWidth={3}
                                dot={{ fill: '#06B6D4', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, stroke: '#06B6D4', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Completion Rates */}
                      <div>
                        <h4 className="text-lg font-semibold text-cyan-400 dark:text-cyan-300 light:text-cyan-600 mb-4">
                          معدل الإكمال
                        </h4>
                        <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={completionRates}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                                outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {completionRates.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                  border: '1px solid rgba(6,182,212,0.3)',
                              borderRadius: '8px',
                                  color: '#06B6D4'
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      </div>
                      </div>
                    </div>

                    {/* Test Distribution */}
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-cyan-400 dark:text-cyan-300 light:text-cyan-600 mb-4">
                        توزيع درجات الاختبارات
                      </h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={subjectDistribution}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            barCategoryGap="20%"
                          >
                            <CartesianGrid 
                              strokeDasharray="2 2" 
                              stroke="rgba(6,182,212,0.15)" 
                              vertical={false}
                            />
                            <XAxis 
                              dataKey="subject" 
                              stroke="rgba(6,182,212,0.7)"
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval={0}
                            />
                            <YAxis 
                              stroke="rgba(6,182,212,0.7)"
                              fontSize={12}
                              domain={[0, 100]}
                              tickCount={6}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                border: '1px solid rgba(6,182,212,0.4)',
                                borderRadius: '12px',
                                color: '#06B6D4',
                                fontSize: '14px',
                                boxShadow: '0 8px 32px rgba(6,182,212,0.2)'
                              }}
                              formatter={(value, name) => [`${value}%`, 'الدرجة']}
                              labelFormatter={(label) => `اختبار: ${label}`}
                            />
                            <Bar 
                              dataKey="score" 
                              radius={[6, 6, 0, 0]}
                              maxBarSize={60}
                            >
                              {subjectDistribution.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color}
                                  stroke={entry.color}
                                  strokeWidth={1}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'attendance' && (
                <motion.div
                  key="attendance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                className="space-y-8"
                >
                  <LuxuryCard className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                    تقرير الحضور
                  </h3>
                    <div className="text-center py-12">
                    <Calendar size={48} className="text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      بيانات الحضور قيد التطوير
                      </p>
                    </div>
                  </LuxuryCard>
                </motion.div>
              )}
            </AnimatePresence>
      </div>

      {/* Student Linking Modal */}
      {showLinkModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowLinkModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-blue-500"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6 relative">
              <button
                onClick={() => {
                  console.log('Close button clicked');
                  setShowLinkModal(false);
                }}
                className="absolute top-0 right-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
              
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <UserCheck size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                ربط طالب جديد
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                أدخل معرف الطالب لربطه بحسابك
              </p>
            </div>

            <form onSubmit={handleLinkStudent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  معرف الطالب (Student ID أو ObjectId)
                </label>
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => {
                    console.log('Input changed:', e.target.value);
                    setStudentIdInput(e.target.value);
                  }}
                  placeholder="مثال: STU12345678 أو 68d63f08a591bd7652e3bf84"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-center font-mono"
                  disabled={linkingStudent}
                  autoFocus
                  style={{ fontSize: '14px' }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  يمكن استخدام معرف الطالب (STU12345678) أو ObjectId (68d63f08a591bd7652e3bf84)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Cancel clicked');
                    setShowLinkModal(false);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
                  disabled={linkingStudent}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={linkingStudent || !studentIdInput.trim()}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  {linkingStudent ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      جاري الربط...
                    </>
                  ) : (
                    <>
                      <UserCheck size={18} />
                      ربط الطالب
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
