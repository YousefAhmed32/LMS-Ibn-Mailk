import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import { 
  BookOpen, 
  Award, 
  Calendar, 
  TrendingUp, 
  Activity, 
  CheckCircle,
  X,
  BarChart3,
  PieChart,
  ArrowLeft,
  RefreshCw,
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Copy,
  Edit,
  Save,
  Eye,
  Download,
  Settings,
  Lock,
  Unlock,
  Trash2,
  TrendingDown,
  Hash,
  CreditCard,
  Key,
  Clock
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceLine,
  ReferenceArea,
  Brush,
  Legend
} from 'recharts';

// Luxury Card Component
const LuxuryCard = ({ children, className = "", ...props }) => (
  <div 
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Admin Action Button Component
const AdminActionButton = ({ icon: Icon, label, onClick, variant = "primary", disabled = false }) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white",
    warning: "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white",
    danger: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white",
    info: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white",
    secondary: "bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={16} />
      {label}
    </motion.button>
  );
};

// Data Display Card Component
const DataCard = ({ title, value, icon: Icon, color = "blue", trend = null, subtitle = null }) => {
  const colors = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-500",
    orange: "from-orange-500 to-amber-500",
    red: "from-red-500 to-pink-500",
    indigo: "from-indigo-500 to-blue-500"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <LuxuryCard className="p-6 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend > 0 ? (
                  <TrendingUp size={14} className="text-green-500" />
                ) : (
                  <TrendingDown size={14} className="text-red-500" />
                )}
                <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-r ${colors[color]} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </LuxuryCard>
    </motion.div>
  );
};

const StudentProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvancedActions, setShowAdvancedActions] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAdvancedActions && !event.target.closest('.dropdown-container')) {
        setShowAdvancedActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdvancedActions]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  
  // Charts data - will be populated from real data
  const [gradeProgression, setGradeProgression] = useState([]);
  const [subjectDistribution, setSubjectDistribution] = useState([]);
  const [attendanceChart, setAttendanceChart] = useState([]);
  const [completionRates, setCompletionRates] = useState([]);
  const [performanceRadar, setPerformanceRadar] = useState([]);
  
  // Ref to prevent multiple API calls
  const isFetchingRef = useRef(false);

  // Function to convert grade number to Arabic text
  const getGradeText = (grade) => {
    const gradeMap = {
      1: 'أولى ابتدائي',
      2: 'ثانية ابتدائي',
      3: 'ثالثة ابتدائي',
      4: 'رابعة ابتدائي',
      5: 'خامسة ابتدائي',
      6: 'سادسة ابتدائي',
      7: 'أولى إعدادي',
      8: 'ثانية إعدادي',
      9: 'ثالثة إعدادي',
      10: 'أولى ثانوي',
      11: 'ثانية ثانوي',
      12: 'ثالثة ثانوي'
    };
    return gradeMap[grade] || grade || 'غير محدد';
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'تم النسخ',
        description: `تم نسخ ${label} إلى الحافظة`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'خطأ في النسخ',
        description: 'فشل في نسخ النص',
        variant: 'destructive',
      });
    }
  };

  // Fetch comprehensive student data
  const fetchStudentData = useCallback(async () => {
    if (!id) return;
    
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      console.log('Fetching comprehensive data for student ID:', id);
      
      // Fetch all student data in parallel
      const [
        studentResponse,
        statsResponse,
        coursesResponse,
        gradesResponse,
        paymentsResponse,
        attendanceResponse,
        notificationsResponse,
        activityResponse
      ] = await Promise.allSettled([
        axiosInstance.get(`/api/admin/users/${id}`),
        axiosInstance.get(`/api/admin/users/${id}/stats`),
        axiosInstance.get(`/api/admin/users/${id}/courses`),
        axiosInstance.get(`/api/admin/users/${id}/grades`),
        axiosInstance.get(`/api/admin/users/${id}/payments`),
        axiosInstance.get(`/api/admin/users/${id}/attendance`),
        axiosInstance.get(`/api/admin/users/${id}/notifications`),
        axiosInstance.get(`/api/admin/users/${id}/activity`)
      ]);
      
      // Process student basic data
      if (studentResponse.status === 'fulfilled' && studentResponse.value.data.success) {
        const studentData = studentResponse.value.data.data;
        console.log('Student data received:', studentData);
        
        setStudentData(studentData);
        setEditForm(studentData);
      } else {
        throw new Error('Failed to fetch student data');
      }
      
      // Process statistics
      if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
        setStatistics(statsResponse.value.data.data);
          } else {
        // Fallback statistics
            setStatistics({
          totalCourses: 0,
          completedCourses: 0,
          averageGrade: 0,
          totalExams: 0,
          attendanceRate: 0,
          studyHours: 0,
          achievements: 0,
          currentStreak: 0,
          highestGrade: 0,
          lowestGrade: 0,
          examsPassed: 0,
          lastActivity: 'غير محدد'
        });
      }
      
      // Process courses data
          if (coursesResponse.status === 'fulfilled' && coursesResponse.value.data.success) {
            setEnrolledCourses(coursesResponse.value.data.data || []);
          } else {
            setEnrolledCourses([]);
          }
          
      // Process grades data
          if (gradesResponse.status === 'fulfilled' && gradesResponse.value.data.success) {
            setGradesData(gradesResponse.value.data.data || []);
          } else {
            setGradesData([]);
          }
      
      // Process payment history
      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.data.success) {
        setPaymentHistory(paymentsResponse.value.data.data || []);
      } else {
        // Add sample payment data for demonstration
        const samplePayments = [
          {
            id: 'PAY-001',
            transactionId: 'TXN-2024-001',
            amount: 500,
            status: 'paid',
            paymentMethod: 'فودافون كاش',
            date: new Date('2024-01-15'),
            createdAt: new Date('2024-01-15')
          },
          {
            id: 'PAY-002',
            transactionId: 'TXN-2024-002',
            amount: 750,
            status: 'completed',
            paymentMethod: 'بنك الأهلي',
            date: new Date('2024-02-10'),
            createdAt: new Date('2024-02-10')
          },
          {
            id: 'PAY-003',
            transactionId: 'TXN-2024-003',
            amount: 300,
            status: 'pending',
            paymentMethod: 'فودافون كاش',
            date: new Date('2024-03-05'),
            createdAt: new Date('2024-03-05')
          },
          {
            id: 'PAY-004',
            transactionId: 'TXN-2024-004',
            amount: 400,
            status: 'failed',
            paymentMethod: 'بنك مصر',
            date: new Date('2024-03-12'),
            createdAt: new Date('2024-03-12')
          }
        ];
        setPaymentHistory(samplePayments);
      }
      
      // Process attendance data
      if (attendanceResponse.status === 'fulfilled' && attendanceResponse.value.data.success) {
        setAttendanceData(attendanceResponse.value.data.data || []);
      } else {
        setAttendanceData([]);
      }
      
      // Process notifications
      if (notificationsResponse.status === 'fulfilled' && notificationsResponse.value.data.success) {
        setNotifications(notificationsResponse.value.data.data || []);
      } else {
        setNotifications([]);
      }
      
      // Process activity log
      if (activityResponse.status === 'fulfilled' && activityResponse.value.data.success) {
        setActivityLog(activityResponse.value.data.data || []);
      } else {
        setActivityLog([]);
      }
      
      // Generate chart data
      generateChartData();
      
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الطالب من قاعدة البيانات",
        variant: "destructive",
      });
      navigate('/admin/users');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [id, navigate]);

  // Generate chart data from real data
  const generateChartData = useCallback(() => {
    // Grade progression from real grades data
    if (gradesData.length > 0) {
      const monthlyGrades = {};
      gradesData.forEach(grade => {
        const month = new Date(grade.examDate || grade.submittedAt || grade.createdAt).toLocaleDateString('ar-EG', { month: 'long' });
        if (!monthlyGrades[month]) {
          monthlyGrades[month] = [];
        }
        monthlyGrades[month].push(grade.percentage || 0);
      });
      
      const progression = Object.keys(monthlyGrades).map(month => ({
        month,
        grade: Math.round(monthlyGrades[month].reduce((sum, grade) => sum + grade, 0) / monthlyGrades[month].length)
      }));
      
      setGradeProgression(progression);
    }
    
    // Subject distribution from real grades data
    if (gradesData.length > 0) {
      const subjectGrades = {};
      gradesData.forEach(grade => {
        const subject = grade.courseName || grade.course?.title || 'غير محدد';
        if (!subjectGrades[subject]) {
          subjectGrades[subject] = [];
        }
        subjectGrades[subject].push(grade.percentage || 0);
      });
      
      const distribution = Object.keys(subjectGrades).map(subject => ({
        subject,
        score: Math.round(subjectGrades[subject].reduce((sum, grade) => sum + grade, 0) / subjectGrades[subject].length),
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }));
      
      setSubjectDistribution(distribution);
    }
    
    // Completion rates from real courses data
    if (enrolledCourses.length > 0) {
      const completed = enrolledCourses.filter(course => course.progressPercentage >= 100 || course.isCompleted).length;
      const inProgress = enrolledCourses.length - completed;
      
      setCompletionRates([
        { name: 'مكتمل', value: completed, color: '#10B981' },
        { name: 'جاري', value: inProgress, color: '#06B6D4' }
      ]);
    }
    
    // Performance radar data
    if (gradesData.length > 0) {
      const subjects = [...new Set(gradesData.map(grade => grade.courseName || grade.course?.title || 'غير محدد'))];
      const radarData = subjects.map(subject => {
        const subjectGrades = gradesData.filter(grade => (grade.courseName || grade.course?.title) === subject);
        const avgGrade = subjectGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / subjectGrades.length;
        return {
          subject,
          grade: Math.round(avgGrade),
          fullMark: 100
        };
      });
      
      setPerformanceRadar(radarData);
    }
  }, [gradesData, enrolledCourses]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // Handle refresh
  const handleRefresh = () => {
    fetchStudentData();
  };

  // Handle back to users list
  const handleBack = () => {
    navigate('/admin/users');
  };

  // Handle edit student
  const handleEdit = () => {
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const response = await axiosInstance.put(`/api/admin/users/${id}`, editForm);
      if (response.data.success) {
        setStudentData(editForm);
        setShowEditModal(false);
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث بيانات الطالب بنجاح',
          variant: 'success',
        });
        // Refresh data after update
        fetchStudentData();
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث بيانات الطالب',
        variant: 'destructive',
      });
    }
  };

  // Admin Actions
  const handleExportReport = async () => {
    try {
      const response = await axiosInstance.get(`/api/admin/users/${id}/export-report`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `تقرير_${studentData?.firstName}_${studentData?.secondName}_${new Date().getFullYear()}.pdf`);
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

  const handleToggleAccountStatus = async () => {
    try {
      const newStatus = studentData.isActive ? 'inactive' : 'active';
      const response = await axiosInstance.put(`/api/admin/users/${id}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setStudentData(prev => ({ ...prev, isActive: !prev.isActive }));
        toast({
          title: 'تم التحديث',
          description: `تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} حساب الطالب`,
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error updating account status:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الحساب',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axiosInstance.post(`/api/admin/users/${id}/reset-password`);
      
      if (response.data.success) {
        toast({
          title: 'تم إعادة تعيين كلمة المرور',
          description: 'تم إرسال كلمة مرور جديدة للطالب',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إعادة تعيين كلمة المرور',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('هل أنت متأكد من حذف حساب الطالب؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      try {
        const response = await axiosInstance.delete(`/api/admin/users/${id}`);
        
        if (response.data.success) {
          toast({
            title: 'تم الحذف',
            description: 'تم حذف حساب الطالب بنجاح',
            variant: 'success',
          });
          navigate('/admin/users');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        toast({
          title: 'خطأ',
          description: 'فشل في حذف حساب الطالب',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSendNotification = async (message) => {
    try {
      const response = await axiosInstance.post(`/api/admin/users/${id}/notify`, {
        message,
        type: 'admin_message'
      });
      
      if (response.data.success) {
        toast({
          title: 'تم الإرسال',
          description: 'تم إرسال الإشعار للطالب',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الإشعار',
        variant: 'destructive',
      });
    }
  };

  const handleViewAsStudent = () => {
    // Navigate to student view (if you have a student view route)
    window.open(`/dashboard?viewAs=${id}`, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">جاري تحميل بيانات الطالب...</h3>
          <p className="text-gray-500 dark:text-gray-400">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User size={64} className="mx-auto text-gray-400 mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            لم يتم العثور على الطالب
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            الطالب المطلوب غير موجود أو تم حذفه
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            العودة إلى قائمة المستخدمين
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Luxury Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-cyan-400/20 via-blue-500/25 to-purple-600/20 rounded-full blur-2xl"
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
          className="absolute top-32 right-20 w-72 h-72 bg-gradient-to-r from-purple-500/20 via-pink-500/25 to-orange-500/20 rounded-full blur-2xl"
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
          className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-500/20 via-teal-500/25 to-cyan-500/20 rounded-full blur-2xl"
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

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-15">
          <div className="grid grid-cols-12 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-cyan-400/30"></div>
            ))}
          </div>
        </div>

        {/* Animated Lines */}
        <motion.div
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
          animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"
          animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 4 }}
        />
      </div>

      {/* Luxury Header */}
      <div className="relative z-[100] bg-gradient-to-r from-slate-800/95 via-gray-900/98 to-slate-800/95 backdrop-blur-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] border-b border-cyan-400/25">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 via-blue-500/5 to-purple-500/3"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="p-2 sm:p-3 rounded-xl bg-cyan-500/12 backdrop-blur-sm text-cyan-400 hover:bg-cyan-500/15 transition-all duration-300 border border-cyan-400/15 shadow-[0_0_8px_rgba(6,182,212,0.15)] hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              >
                <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              </motion.button>
              <div className="min-w-0 flex-1">
                {/* Desktop Title */}
                <h1 className="hidden lg:block text-2xl xl:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-1 drop-shadow-[0_0_4px_rgba(6,182,212,0.25)]">
                  ملف الطالب - لوحة الإدارة
                </h1>
                {/* Mobile Title */}
                <h1 className="lg:hidden text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-1 drop-shadow-[0_0_4px_rgba(6,182,212,0.25)]">
                  ملف الطالب
                </h1>
                <p className="hidden sm:block text-cyan-300 text-sm sm:text-base font-medium">
                  عرض وإدارة شاملة لجميع بيانات الطالب
                </p>
                {studentData && (
                  <div className="mt-1 flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.25)]" />
                    <span className="text-emerald-300 text-xs font-medium truncate">
                      {studentData.firstName} {studentData.secondName} - {studentData.isActive ? 'نشط' : 'غير نشط'}
                    </span>
              </div>
                )}
            </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Quick Actions - Hidden on small screens */}
              <div className="hidden sm:flex items-center gap-2">
                <AdminActionButton
                  icon={RefreshCw}
                  label="تحديث"
                onClick={handleRefresh}
                  variant="info"
                />
                <AdminActionButton
                  icon={Edit}
                  label="تعديل"
                  onClick={handleEdit}
                  variant="primary"
                />
                <AdminActionButton
                  icon={Download}
                  label="تصدير"
                  onClick={handleExportReport}
                  variant="success"
                />
              </div>

              {/* Mobile Menu Button */}
              <div className="sm:hidden relative dropdown-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdvancedActions(!showAdvancedActions)}
                  className="p-2 rounded-xl bg-purple-500/12 backdrop-blur-sm text-purple-400 hover:bg-purple-500/15 transition-all duration-300 border border-purple-400/15 shadow-[0_0_8px_rgba(168,85,247,0.15)] hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                >
                  <Settings size={18} />
                </motion.button>
                
                {showAdvancedActions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-20 right-4 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20 p-2 z-[9999]"
                  >
                    <div className="space-y-1">
                      {/* Mobile Actions */}
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                        <button
                          onClick={() => {
                            handleRefresh();
                            setShowAdvancedActions(false);
                          }}
                          className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <RefreshCw size={16} />
                          تحديث البيانات
              </button>
              <button
                          onClick={() => {
                            handleEdit();
                            setShowAdvancedActions(false);
                          }}
                          className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                تعديل البيانات
              </button>
                        <button
                          onClick={() => {
                            handleExportReport();
                            setShowAdvancedActions(false);
                          }}
                          className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download size={16} />
                          تصدير التقرير
                        </button>
            </div>
                      
                      {/* Advanced Actions */}
                      <button
                        onClick={() => {
                          handleToggleAccountStatus();
                          setShowAdvancedActions(false);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {studentData?.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                        {studentData?.isActive ? 'إلغاء تفعيل الحساب' : 'تفعيل الحساب'}
                      </button>
                      <button
                        onClick={() => {
                          handleResetPassword();
                          setShowAdvancedActions(false);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Key size={16} />
                        إعادة تعيين كلمة المرور
                      </button>
                      <button
                        onClick={() => {
                          handleViewAsStudent();
                          setShowAdvancedActions(false);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        عرض كطالب
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          handleDeleteAccount();
                          setShowAdvancedActions(false);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        حذف الحساب
                      </button>
          </div>
                  </motion.div>
                )}
              </div>

              {/* Desktop Advanced Actions Dropdown */}
              <div className="hidden sm:block relative dropdown-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdvancedActions(!showAdvancedActions)}
                  className="p-3 rounded-xl bg-purple-500/12 backdrop-blur-sm text-purple-400 hover:bg-purple-500/15 transition-all duration-300 border border-purple-400/15 shadow-[0_0_8px_rgba(168,85,247,0.15)] hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                >
                  <Settings size={20} />
                </motion.button>
                
                {showAdvancedActions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-20 right-4 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/20 p-2 z-[9999]"
                  >
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          handleToggleAccountStatus();
                          setShowAdvancedActions(false);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {studentData?.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                        {studentData?.isActive ? 'إلغاء تفعيل الحساب' : 'تفعيل الحساب'}
                      </button>
                      <button
                        onClick={() => {
                          handleResetPassword();
                          setShowAdvancedActions(false);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Key size={16} />
                        إعادة تعيين كلمة المرور
                      </button>
                      <button
                        onClick={() => {
                          handleViewAsStudent();
                          setShowAdvancedActions(false);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        عرض كطالب
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          handleDeleteAccount();
                          setShowAdvancedActions(false);
                        }}
                        className="w-full px-4 py-2 text-right text-sm hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        حذف الحساب
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20 overflow-x-auto">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'academic', label: 'الأداء الأكاديمي', icon: GraduationCap },
              { id: 'courses', label: 'الكورسات', icon: BookOpen },
              { id: 'payments', label: 'المدفوعات', icon: CreditCard },
              { id: 'attendance', label: 'الحضور', icon: Calendar },
              { id: 'activity', label: 'النشاط', icon: Activity },
              { id: 'settings', label: 'الإعدادات', icon: Settings }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px] flex-shrink-0" />
                <span className="text-xs sm:text-sm lg:text-base truncate">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
        {/* Student Profile Header */}
              <LuxuryCard className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-white/95 to-blue-50/95 dark:from-gray-800/95 dark:to-gray-700/95 backdrop-blur-xl border border-cyan-400/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8">
            {/* Profile Picture */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white text-xl sm:text-2xl lg:text-3xl font-bold shadow-2xl">
                {studentData.firstName?.charAt(0) || 'U'}
              </div>
                    <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 sm:border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                      <CheckCircle size={14} className="sm:w-5 sm:h-5 text-white" />
              </div>
                    {/* Status Indicator */}
                    <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                      studentData.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
            </div>

            {/* Student Info */}
                  <div className="flex-1 w-full text-center sm:text-right">
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 break-words">
                    {studentData.firstName} {studentData.secondName} {studentData.thirdName} {studentData.fourthName}
                  </h2>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-4 sm:mb-6">
                        <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${
                          studentData.isActive 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {studentData.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                        <span className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium">
                      {studentData.role === 'student' ? 'طالب' : 'ولي أمر'}
                    </span>
                        <span className="px-3 py-1 sm:px-4 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs sm:text-sm font-medium">
                          {getGradeText(studentData.grade)}
                        </span>
                </div>
              </div>

                    {/* Contact Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Email */}
                      <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Mail size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {studentData.email || 'غير محدد'}
                          </p>
                        </div>
                  {studentData.email && (
                    <button
                      onClick={() => copyToClipboard(studentData.email, 'البريد الإلكتروني')}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                      <Copy size={14} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                </div>

                {/* Student Phone */}
                      <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <Phone size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">هاتف الطالب</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {studentData.phoneStudent || studentData.phoneNumber || 'غير محدد'}
                          </p>
                        </div>
                  {(studentData.phoneStudent || studentData.phoneNumber) && (
                    <button
                      onClick={() => copyToClipboard(studentData.phoneStudent || studentData.phoneNumber, 'رقم هاتف الطالب')}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                      <Copy size={14} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                </div>

                {/* Guardian Phone */}
                      <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                          <Users size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">هاتف ولي الأمر</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {studentData.guardianPhone || studentData.parentPhone || studentData.phoneNumber || 'غير محدد'}
                          </p>
                        </div>
                  {(studentData.guardianPhone || studentData.parentPhone || studentData.phoneNumber) && (
                    <button
                      onClick={() => copyToClipboard(studentData.guardianPhone || studentData.parentPhone || studentData.phoneNumber, 'رقم هاتف ولي الأمر')}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                      <Copy size={14} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                </div>

                {/* Student ID */}
                      <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                          <Hash size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رقم الطالب</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                    {studentData.studentId || studentData._id || 'غير محدد'}
                          </p>
                        </div>
                  {(studentData.studentId || studentData._id) && (
                    <button
                      onClick={() => copyToClipboard(studentData.studentId || studentData._id, 'رقم الطالب')}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                      <Copy size={14} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                </div>

                {/* Governorate */}
                      <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <MapPin size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">المحافظة</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {studentData.governorate || 'غير محدد'}
                          </p>
                        </div>
                </div>

                {/* Grade */}
                      <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <GraduationCap size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الصف الدراسي</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getGradeText(studentData.grade)}
                          </p>
                        </div>
                </div>
              </div>
            </div>
          </div>
        </LuxuryCard>

              {/* Statistics Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <DataCard
                  title="إجمالي الكورسات"
                  value={enrolledCourses.length}
                  icon={BookOpen}
                  color="blue"
                  subtitle="مقررات مسجلة"
                />
                <DataCard
                  title="الكورسات المكتملة"
                  value={enrolledCourses.filter(course => course.progressPercentage >= 100 || course.isCompleted).length}
                  icon={CheckCircle}
                  color="green"
                  subtitle="مقررات منجزة"
                />
                <DataCard
                  title="متوسط الدرجات"
                  value={gradesData.length > 0 
                    ? Math.round(gradesData.reduce((sum, grade) => sum + grade.percentage, 0) / gradesData.length)
                    : 0}
                  icon={Award}
                  color="orange"
                  subtitle="تقييم عام"
                />
                <DataCard
                  title="إجمالي الامتحانات"
                  value={gradesData.length}
                  icon={Calendar}
                  color="purple"
                  subtitle="اختبارات مكتملة"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'academic' && (
            <motion.div
              key="academic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              {/* Academic Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Grade Progression Chart */}
                <LuxuryCard className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500 sm:w-6 sm:h-6" />
                    تطور الدرجات عبر الوقت
                  </h3>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={gradeProgression}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
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
                      </RechartsLineChart>
                    </ResponsiveContainer>
              </div>
                </LuxuryCard>

                {/* Subject Performance Chart */}
                <LuxuryCard className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-green-500 sm:w-6 sm:h-6" />
                    أداء المواد الدراسية
                  </h3>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={subjectDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="subject" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
            </div>
          </LuxuryCard>
              </div>

              {/* Grades Table */}
              <LuxuryCard className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <Award size={20} className="text-purple-500 sm:w-6 sm:h-6" />
                  الترتيب
                </h3>
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  {gradesData.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-full">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                          <tr>
                            <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">اسم الاختبار</th>
                            <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">المادة الدراسية</th>
                            <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">الدرجة المحققة</th>
                            <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">النسبة المئوية</th>
                            <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">التقدير</th>
                            <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm">تاريخ الامتحان</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradesData.map((grade, index) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                              <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-900 dark:text-white font-medium text-right border-l border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>{grade.examTitle || grade.title || grade.name || 'اختبار غير محدد'}</span>
              </div>
                              </td>
                              <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 text-right border-l border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                  <BookOpen size={14} className="text-blue-500 sm:w-4 sm:h-4" />
                                  <span className="text-xs sm:text-sm">{grade.courseName || grade.course?.title || grade.subject || 'مادة غير محددة'}</span>
              </div>
                              </td>
                              <td className="py-3 px-3 sm:py-4 sm:px-6 text-center border-l border-gray-100 dark:border-gray-700">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm">
                                    {grade.studentScore || grade.score || grade.obtainedMarks || 0}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    من أصل {grade.totalScore || grade.totalMarks || grade.maxScore || 100}
                                  </span>
            </div>
                              </td>
                              <td className="py-3 px-3 sm:py-4 sm:px-6 text-center border-l border-gray-100 dark:border-gray-700">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm ${
                                    (grade.percentage || 0) >= 90 ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300' :
                                    (grade.percentage || 0) >= 80 ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300' :
                                    (grade.percentage || 0) >= 70 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300' :
                                    'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300'
                                  }`}>
                                    {grade.percentage || grade.percent || Math.round(((grade.studentScore || 0) / (grade.totalScore || 100)) * 100)}%
                                  </span>
                                  <div className="w-12 sm:w-16 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-500 ${
                                        (grade.percentage || 0) >= 90 ? 'bg-green-500' :
                                        (grade.percentage || 0) >= 80 ? 'bg-blue-500' :
                                        (grade.percentage || 0) >= 70 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${Math.min(grade.percentage || 0, 100)}%` }}
                                    ></div>
              </div>
              </div>
                              </td>
                              <td className="py-3 px-3 sm:py-4 sm:px-6 text-center border-l border-gray-100 dark:border-gray-700">
                                <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm ${
                                  (grade.percentage || 0) >= 90 ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300' :
                                  (grade.percentage || 0) >= 80 ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300' :
                                  (grade.percentage || 0) >= 70 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300' :
                                  'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300'
                                }`}>
                                  {grade.grade || grade.letterGrade || 
                                    ((grade.percentage || 0) >= 90 ? 'ممتاز' :
                                     (grade.percentage || 0) >= 80 ? 'جيد جداً' :
                                     (grade.percentage || 0) >= 70 ? 'جيد' :
                                     (grade.percentage || 0) >= 60 ? 'مقبول' : 'ضعيف')}
                                </span>
                              </td>
                              <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-600 dark:text-gray-400 text-xs sm:text-sm text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <Calendar size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                                  <span className="text-xs sm:text-sm">
                                    {grade.examDate || grade.date || grade.createdAt ? 
                                      new Date(grade.examDate || grade.date || grade.createdAt).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      }) : 'غير محدد'}
                                  </span>
            </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
              </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award size={48} className="text-gray-400" />
              </div>
                      <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-3">لا توجد درجات متاحة</h4>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">لم يتم العثور على نتائج امتحانات في قاعدة البيانات</p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>البيانات قيد التحميل</span>
            </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>سيتم عرضها قريباً</span>
        </div>
            </div>
                    </div>
                  )}
                </div>
              </LuxuryCard>
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              {/* Courses Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <LuxuryCard className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-500 sm:w-6 sm:h-6" />
                    الكورسات المسجلة
                  </h3>
            <div className="space-y-4">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <div key={course._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {course.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          course.progressPercentage >= 100 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}
                        style={{ width: `${course.progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{course.instructor}</span>
                      <span className={course.isCompleted ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                        {course.isCompleted ? 'مكتمل' : 'قيد التقدم'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">لا توجد كورسات مسجلة</p>
                </div>
              )}
            </div>
          </LuxuryCard>

                <LuxuryCard className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                    <PieChart size={20} className="text-green-500 sm:w-6 sm:h-6" />
                    معدل الإكمال
                  </h3>
                  <div className="h-64 sm:h-80">
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
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
            </div>
                </LuxuryCard>
              </div>
            </motion.div>
          )}

          {/* Other tabs can be added similarly */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              <LuxuryCard className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-green-500 sm:w-6 sm:h-6" />
                  سجل المدفوعات
                </h3>
                
                {paymentHistory.length > 0 ? (
            <div className="space-y-4">
                    {/* Payment Statistics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard size={16} className="text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">إجمالي المدفوعات</span>
                    </div>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                          {paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0)} ج.م
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={16} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">مدفوع</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                          {paymentHistory.filter(p => p.status === 'paid' || p.status === 'completed').length}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">معلق</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">
                          {paymentHistory.filter(p => p.status === 'pending').length}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <X size={16} className="text-red-600 dark:text-red-400" />
                          <span className="text-sm font-medium text-red-800 dark:text-red-300">مرفوض</span>
                        </div>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-200">
                          {paymentHistory.filter(p => p.status === 'failed' || p.status === 'rejected').length}
                        </p>
                      </div>
                    </div>

                    {/* Payment History Table */}
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-full">
                        <table className="w-full min-w-[600px]">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                            <tr>
                              <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">رقم المعاملة</th>
                              <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">المبلغ</th>
                              <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">الحالة</th>
                              <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm border-l border-gray-200 dark:border-gray-600">طريقة الدفع</th>
                              <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm">التاريخ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentHistory.map((payment, index) => (
                              <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-900 dark:text-white font-medium text-right border-l border-gray-100 dark:border-gray-700">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs sm:text-sm">{payment.transactionId || payment.id || `TXN-${index + 1}`}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 sm:py-4 sm:px-6 text-center border-l border-gray-100 dark:border-gray-700">
                                  <span className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm">
                                    {payment.amount || 0} ج.م
                                  </span>
                                </td>
                                <td className="py-3 px-3 sm:py-4 sm:px-6 text-center border-l border-gray-100 dark:border-gray-700">
                                  <span className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm ${
                                    payment.status === 'paid' || payment.status === 'completed' 
                                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300'
                                      : payment.status === 'pending'
                                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300'
                                      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300'
                                  }`}>
                                    {payment.status === 'paid' || payment.status === 'completed' ? 'مدفوع' :
                                     payment.status === 'pending' ? 'معلق' : 'مرفوض'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 sm:py-4 sm:px-6 text-center border-l border-gray-100 dark:border-gray-700">
                                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    {payment.paymentMethod || 'فودافون كاش'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 sm:py-4 sm:px-6 text-gray-600 dark:text-gray-400 text-xs sm:text-sm text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <Calendar size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                                    <span>
                                      {payment.date || payment.createdAt ? 
                                        new Date(payment.date || payment.createdAt).toLocaleDateString('ar-EG', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        }) : 'غير محدد'}
                      </span>
                    </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                  </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <CreditCard size={32} className="text-gray-400 mx-auto mb-4 sm:w-12 sm:h-12" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">لا توجد مدفوعات متاحة</p>
                </div>
              )}
              </LuxuryCard>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              <LuxuryCard className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-500 sm:w-6 sm:h-6" />
                  سجل الحضور
                </h3>
                <div className="text-center py-8 sm:py-12">
                  <Calendar size={32} className="text-gray-400 mx-auto mb-4 sm:w-12 sm:h-12" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">بيانات الحضور قيد التطوير</p>
            </div>
          </LuxuryCard>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              <LuxuryCard className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <Activity size={20} className="text-purple-500 sm:w-6 sm:h-6" />
                  سجل النشاط
                </h3>
                <div className="text-center py-8 sm:py-12">
                  <Activity size={32} className="text-gray-400 mx-auto mb-4 sm:w-12 sm:h-12" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">سجل النشاط قيد التطوير</p>
        </div>
              </LuxuryCard>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8"
            >
              <LuxuryCard className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-gray-500 sm:w-6 sm:h-6" />
                  إعدادات الحساب
                </h3>
                <div className="text-center py-8 sm:py-12">
                  <Settings size={32} className="text-gray-400 mx-auto mb-4 sm:w-12 sm:h-12" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">إعدادات الحساب قيد التطوير</p>
                </div>
              </LuxuryCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">تعديل بيانات الطالب</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الأول
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الثاني
                    </label>
                    <input
                      type="text"
                      value={editForm.secondName || ''}
                      onChange={(e) => setEditForm({...editForm, secondName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الثالث
                    </label>
                    <input
                      type="text"
                      value={editForm.thirdName || ''}
                      onChange={(e) => setEditForm({...editForm, thirdName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الرابع
                    </label>
                    <input
                      type="text"
                      value={editForm.fourthName || ''}
                      onChange={(e) => setEditForm({...editForm, fourthName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber || editForm.phoneStudent || ''}
                      onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المحافظة
                    </label>
                    <input
                      type="text"
                      value={editForm.governorate || ''}
                      onChange={(e) => setEditForm({...editForm, governorate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الصف
                    </label>
                    <select
                      value={editForm.grade || ''}
                      onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">اختر الصف</option>
                      <option value="7">أولى إعدادي</option>
                      <option value="8">ثانية إعدادي</option>
                      <option value="9">ثالثة إعدادي</option>
                      <option value="10">أولى ثانوي</option>
                      <option value="11">ثانية ثانوي</option>
                      <option value="12">ثالثة ثانوي</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Save size={16} />
                  حفظ التغييرات
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;