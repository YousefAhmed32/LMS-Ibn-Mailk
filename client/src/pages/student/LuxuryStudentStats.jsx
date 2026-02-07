import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  Trophy,
  Crown,
  Star,
  Target,
  Calendar,
  Clock,
  BookOpen,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Sparkles,
  Flame,
  Rocket,
  Gem,
  Heart,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Share2,
  Filter,
  Settings,
  Home,
  GraduationCap,
  Brain,
  Lightbulb,
  Shield,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Save,
  Upload,
  Send,
  MessageSquare,
  PhoneCall,
  Video,
  Camera,
  Mic,
  MicOff,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Database,
  Cloud,
  CloudOff,
  Wrench,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Power,
  PowerOff,
  PlayCircle,
  PauseCircle,
  StopCircle,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume1,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Hand,
  Diamond,
  Coins,
  Gift,
  Badge,
  Ribbon,
  Scroll,
  Bookmark,
  Timer,
  Hourglass,
  History,
  Circle,
  Triangle,
  Sun,
  Moon,
  Palette,
  Layers,
  Grid,
  List,
  PenTool,
  FileText
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
  Legend
} from 'recharts';

// Luxury Card Component
const LuxuryCard = ({ children, className = "", gradient = "", ...props }) => (
  <motion.div
    className={`relative overflow-hidden rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl ${gradient} ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    whileHover={{ scale: 1.02, y: -5 }}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
    <div className="relative z-10 p-6">
      {children}
    </div>
  </motion.div>
);

// Luxury Stat Card Component
const LuxuryStatCard = ({ title, value, change, icon: Icon, color, gradient, delay = 0 }) => (
  <motion.div
    className="relative group"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    whileHover={{ scale: 1.05, y: -10 }}
  >
    <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-2xl border border-white/20 backdrop-blur-xl`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              change > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

// Luxury Chart Card Component
const LuxuryChartCard = ({ title, children, className = "" }) => (
  <LuxuryCard className={`p-6 ${className}`} gradient="bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-700/70">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        {title}
      </h3>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
    {children}
  </LuxuryCard>
);

const LuxuryStudentStats = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [viewMode, setViewMode] = useState('grid');
  const [error, setError] = useState(null);
  
  // Real data states
  const [studentData, setStudentData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [gradesData, setGradesData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Charts data states
  const [gradeProgression, setGradeProgression] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  
  // Ref to prevent multiple API calls
  const isFetchingRef = useRef(false);

  // Helper function to get grade from percentage (same as ParentDashboard)
  const getGradeFromPercentage = (percentage) => {
    if (percentage >= 90) return 'ممتاز';
    if (percentage >= 80) return 'جيد جداً';
    if (percentage >= 70) return 'جيد';
    if (percentage >= 50) return 'مقبول';
    return 'ضعيف';
  };

  // Fetch real student statistics data
  const fetchStudentStats = useCallback(async (forceRefresh = false) => {
    if (!user?._id) return;
    
    // Prevent multiple simultaneous calls unless force refresh
    if (isFetchingRef.current && !forceRefresh) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching student stats for user:', user._id, forceRefresh ? '(Force Refresh)' : '');
      
        // Try multiple API endpoints to get comprehensive data
        console.log('🔍 Trying to fetch data from multiple endpoints...');
        
        const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
        const res = await axiosInstance.get(`/api/student/me/stats${cacheBuster}`, { timeout: 15000 });
        const data = res?.data?.success ? res.data : null;
        if (!data) throw new Error('No data received from API');
      
            // Process the data - real data only, no fake fallbacks
            if (data) {
              const rawStudent = data.student || data.data?.student;
              setStudentData(rawStudent ? { ...rawStudent } : {
                firstName: user?.firstName || 'الطالب',
                secondName: user?.secondName || '',
                name: user?.name || 'الطالب',
                email: user?.email || '',
                studentId: user?.studentId || '',
                grade: user?.grade || '',
                section: user?.section || ''
              });

              const rawStats = data.statistics || data.data?.statistics;
              setStatistics(rawStats ? { ...rawStats } : {
                totalCourses: 0,
                completedCourses: 0,
                averageGrade: 0,
                attendanceRate: 0
              });

              const coursesData = data.enrolledCourses || data.data?.enrolledCourses || [];
              console.log('📚 Enrolled courses data:', coursesData);
              console.log('📊 Course progress details:', coursesData.map(c => ({
                name: c.courseName || c.name,
                progress: c.progress,
                completedVideos: c.completedVideos,
                totalVideos: c.totalVideos,
                completedExams: c.completedExams,
                totalExams: c.totalExams,
                status: c.status
              })));
              setEnrolledCourses(coursesData);
              
              // Process grades data exactly like ParentDashboard
              if (data.examResults && data.examResults.length > 0) {
                // Group results by exam to calculate proper ranking (same as ParentDashboard)
                const examGroups = {};
                
                data.examResults.forEach((result) => {
                  const examKey = result.examTitle || result.title || 'امتحان غير محدد';
                  if (!examGroups[examKey]) {
                    examGroups[examKey] = [];
                  }
                  examGroups[examKey].push(result);
                });
                
                // Calculate ranking within each exam group (same as ParentDashboard)
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
                console.log('✅ Processed grades data like ParentDashboard:', finalResults);
                console.log('📊 Exam results summary:', finalResults.map(r => ({
                  exam: r.examTitle,
                  course: r.courseName,
                  score: `${r.studentScore}/${r.totalScore}`,
                  percentage: r.percentage,
                  grade: r.grade,
                  rank: r.rank
                })));
              } else {
                setGradesData([]);
                console.log('⚠️ No exam results found in API response');
              }
              setRecentActivity(data.recentActivity || data.data?.recentActivity || []);
        
        // Process charts data
        const charts = data.progressCharts || data.charts || data.data?.charts || {};
        
        // Grade progression - real data only; empty when none
        if (charts.gradeProgression && charts.gradeProgression.length > 0) {
          setGradeProgression(charts.gradeProgression.map(item => ({
            month: item.month,
            grade: item.grade || item.score,
            target: item.target || 90
          })));
        } else {
          setGradeProgression([]);
        }

        // Subject performance - real data only; empty when none
        if (charts.subjectDistribution && charts.subjectDistribution.length > 0) {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
          setSubjectPerformance(charts.subjectDistribution.map((item, index) => ({
            subject: item.name || item.subject,
            score: item.value || item.score || item.percentage,
            color: item.color || colors[index % colors.length]
          })));
        } else {
          setSubjectPerformance([]);
        }

        // Completion data - real data only; zeros when none
        if (charts.completionRates && charts.completionRates.length > 0) {
          setCompletionData(charts.completionRates);
        } else {
          setCompletionData([
            { name: 'مكتمل', value: 0, color: '#10B981' },
            { name: 'قيد التقدم', value: 0, color: '#F59E0B' }
          ]);
        }
        
        const attendanceData = charts.attendanceChart?.length > 0
          ? charts.attendanceChart
          : (data.attendance && data.attendance.length > 0 ? data.attendance : []);
        setAttendanceData(attendanceData);
        setLastRefreshTime(new Date());
      }
      
    } catch (error) {
      console.error('❌ Error fetching student stats:', error);
      setError(error.message);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "فشل في تحميل إحصائياتك. سيتم عرض القيم الفارغة أو صفر.",
        variant: "destructive",
      });
      setStatistics({
        totalCourses: 0,
        completedCourses: 0,
        averageGrade: 0,
        attendanceRate: 0
      });
      setStudentData({
        firstName: user?.firstName || 'الطالب',
        secondName: user?.secondName || '',
        name: user?.name || 'الطالب',
        email: user?.email || '',
        studentId: user?.studentId || '',
        grade: user?.grade || '',
        section: user?.section || ''
      });
      setEnrolledCourses([]);
      setGradesData([]);
      setRecentActivity([]);
      setGradeProgression([]);
      setSubjectPerformance([]);
      setCompletionData([
        { name: 'مكتمل', value: 0, color: '#10B981' },
        { name: 'قيد التقدم', value: 0, color: '#F59E0B' }
      ]);
      setAttendanceData([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?._id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  useEffect(() => {
    // Load data only once on component mount
    fetchStudentStats();
  }, [fetchStudentStats]);

  const handleBack = () => {
    navigate('/courses');
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered by user');
    fetchStudentStats(true); // Force refresh
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // No auto-refresh when switching tabs - user can manually refresh if needed
  };

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
    { id: 'performance', name: 'الأداء', icon: TrendingUp },
    { id: 'courses', name: 'الدورات', icon: BookOpen },
    { id: 'achievements', name: 'الإنجازات', icon: Trophy }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} flex items-center justify-center`}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={floatingVariants}
              animate="float"
            >
              <Sparkles className="w-8 h-8 text-purple-500" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            جاري تحميل الإحصائيات
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            نعد لك أفضل تجربة إحصائية...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error && !statistics) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-red-900 to-orange-900' : 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50'} flex items-center justify-center`}>
        <motion.div
          className="text-center max-w-md mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              خطأ في تحميل البيانات
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={handleRefresh}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              إعادة المحاولة
            </motion.button>
            <motion.button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              العودة
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900' : 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100'}`}>
      {/* Ultra Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary floating orbs */}
        <motion.div
          className={`absolute -top-40 -right-40 w-96 h-96 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20' : 'bg-gradient-to-br from-blue-400/15 to-purple-500/15'} rounded-full blur-3xl`}
          variants={floatingVariants}
          animate="float"
        />
        <motion.div
          className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDarkMode ? 'bg-gradient-to-br from-pink-500/20 to-rose-600/20' : 'bg-gradient-to-br from-pink-400/15 to-rose-500/15'} rounded-full blur-3xl`}
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 1 }}
        />
        <motion.div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 ${isDarkMode ? 'bg-gradient-to-br from-cyan-500/15 to-blue-600/15' : 'bg-gradient-to-br from-cyan-400/10 to-blue-500/10'} rounded-full blur-3xl`}
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
        />
        
        {/* Secondary accent orbs */}
        <motion.div
          className={`absolute top-20 right-1/4 w-32 h-32 ${isDarkMode ? 'bg-gradient-to-br from-emerald-500/10 to-teal-600/10' : 'bg-gradient-to-br from-emerald-400/8 to-teal-500/8'} rounded-full blur-2xl`}
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 0.5 }}
        />
        <motion.div
          className={`absolute bottom-20 left-1/4 w-40 h-40 ${isDarkMode ? 'bg-gradient-to-br from-amber-500/10 to-orange-600/10' : 'bg-gradient-to-br from-amber-400/8 to-orange-500/8'} rounded-full blur-2xl`}
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 1.5 }}
        />
        
        {/* Grid pattern overlay */}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]' : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]'}`}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Ultra Modern Header */}
        <motion.div
          className={`mb-12 ${isDarkMode ? 'bg-gradient-to-r from-slate-800/80 via-gray-800/80 to-slate-900/80' : 'bg-gradient-to-r from-white/80 via-blue-50/80 to-indigo-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-blue-200/50'} shadow-2xl p-8`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-3xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                onClick={handleBack}
                className={`group p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700/60 hover:bg-slate-600/60' : 'bg-white/60 hover:bg-white/80'} backdrop-blur-xl transition-all duration-300 shadow-xl border ${isDarkMode ? 'border-slate-600/30' : 'border-blue-200/30'}`}
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
              </motion.button>
              
              <div className="space-y-3">
                <motion.h1 
                  className={`text-5xl font-black bg-gradient-to-r ${isDarkMode ? 'from-white via-blue-100 to-purple-100' : 'from-slate-900 via-blue-800 to-purple-800'} bg-clip-text text-transparent flex items-center gap-4`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="p-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 shadow-xl"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Crown className="w-8 h-8 text-white" />
                  </motion.div>
                  الإحصائيات الأكاديمية
                </motion.h1>
                <motion.p 
                  className={`text-xl font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {studentData ? `مرحباً ${studentData.firstName || user?.firstName || 'الطالب'} 👋` : 'تتبع تقدمك الأكاديمي وإنجازاتك 📊'}
                </motion.p>
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    متصل - البيانات محدثة
                  </span>
                  {error && (
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} bg-yellow-500/10 px-3 py-1 rounded-full`}>
                      ⚠️ بيانات تجريبية
                    </span>
                  )}
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 ">
              <motion.div
                className={`text-right ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {lastRefreshTime && (
                  <>
                    <div className="text-sm font-semibold">آخر تحديث</div>
                    <div className="text-xs">{lastRefreshTime.toLocaleTimeString('ar-SA')}</div>
                  </>
                )}
              </motion.div>
              
              <motion.button
                onClick={handleRefresh}
                className={`group px-6 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-xl flex items-center gap-3 ${
                  loading 
                    ? `${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-200/50'} cursor-not-allowed` 
                    : `bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40`
                }`}
                disabled={loading}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
              </motion.button>
              
              <motion.button
                className={`group p-4 rounded-2xl ${isDarkMode ? 'bg-slate-700/60 hover:bg-slate-600/60' : 'bg-white/60 hover:bg-white/80'} backdrop-blur-xl transition-all duration-300 shadow-xl border ${isDarkMode ? 'border-slate-600/30' : 'border-blue-200/30'}`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Download className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Ultra Modern Tabs */}
        <motion.div
          className={`${isDarkMode ? 'bg-slate-800/60' : 'bg-white/60'} backdrop-blur-2xl rounded-2xl border ${isDarkMode ? 'border-slate-700/50' : 'border-blue-200/50'} shadow-xl p-2`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex gap-2">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`group relative flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? `${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'}`
                    : `${isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-700/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'}`
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <tab.icon className={`w-5 h-5 transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm">{tab.name}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Ultra Modern Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 mt-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-blue-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-blue-200/50'} shadow-2xl p-8`}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 mt-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-xl">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-800 dark:text-white">
                    {statistics?.totalCourses || enrolledCourses.length || 0}
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    إجمالي الدورات
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  +{enrolledCourses.length > 0 ? Math.round((enrolledCourses.length / 10) * 100) : 0}%
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-green-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-green-200/50'} shadow-2xl p-8`}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-500/20 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 shadow-xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-800 dark:text-white">
                    {statistics?.averageGrade || 0}%
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    متوسط الدرجات
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  {statistics?.averageGrade >= 90 ? 'ممتاز' : statistics?.averageGrade >= 80 ? 'جيد جداً' : statistics?.averageGrade >= 70 ? 'جيد' : 'يحتاج تحسين'}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-purple-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-purple-200/50'} shadow-2xl p-8`}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-500/20 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 shadow-xl">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-800 dark:text-white">
                    {statistics?.completedCourses || enrolledCourses.filter(c => c.status === 'completed').length || 0}
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    الدورات المكتملة
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {statistics?.completedCourses > 0 ? Math.round((statistics.completedCourses / (statistics?.totalCourses || 1)) * 100) : 0}% مكتمل
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-orange-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-orange-200/50'} shadow-2xl p-8`}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-orange-500/20 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-800 dark:text-white">
                    {statistics?.attendanceRate || 0}%
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    معدل الحضور
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {statistics?.attendanceRate >= 90 ? 'ممتاز' : statistics?.attendanceRate >= 80 ? 'جيد جداً' : statistics?.attendanceRate >= 70 ? 'جيد' : 'يحتاج تحسين'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Ultra Modern Charts Section - Only show if we have real data */}
        {(gradeProgression.length > 0 || subjectPerformance.length > 0 || completionData.length > 0 || attendanceData.length > 0) && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
          {/* Grade Progression Chart - Only show if we have data */}
          {gradeProgression.length > 0 && (
            <motion.div
              className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-blue-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-blue-200/50'} shadow-2xl p-8`}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">تطور الدرجات</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">متابعة تقدمك عبر الأشهر</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsLineChart data={gradeProgression}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
                    <XAxis 
                      dataKey="month" 
                      stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="grade" 
                      stroke="#3B82F6" 
                      strokeWidth={4}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 8 }}
                      activeDot={{ r: 10, stroke: '#3B82F6', strokeWidth: 3, fill: '#FFFFFF' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      strokeDasharray="8 8"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Subject Performance Chart - Only show if we have data */}
          {subjectPerformance.length > 0 && (
            <motion.div
              className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-green-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-green-200/50'} shadow-2xl p-8`}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">أداء المواد</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">مقارنة درجاتك في كل مادة</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsBarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
                    <XAxis 
                      dataKey="subject" 
                      stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937'
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      radius={[12, 12, 0, 0]}
                    >
                      {subjectPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Additional Stats */}
       
          {/* Completion Rate - Only show if we have data */}
          {completionData.length > 0 && (
            <motion.div
              className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-purple-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-purple-200/50'} shadow-2xl p-8`}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 shadow-xl">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">معدل الإكمال</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">نسبة إكمال الدورات</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-3">
                  {completionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-lg" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-white text-lg">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Attendance Chart - Only show if we have data */}
          {attendanceData.length > 0 ? (
            <motion.div
              className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-emerald-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-emerald-200/50'} shadow-2xl p-8`}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 shadow-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">معدل الحضور</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">متابعة حضورك عبر الأشهر</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
                    <XAxis 
                      dataKey="month" 
                      stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={isDarkMode ? "#9CA3AF" : "#6B7280"}
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        color: isDarkMode ? '#F9FAFB' : '#1F2937'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="#10B981" 
                      fill="url(#colorGradient)"
                      strokeWidth={4}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className={`group relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80' : 'bg-gradient-to-br from-white/80 to-emerald-50/80'} backdrop-blur-2xl rounded-3xl border ${isDarkMode ? 'border-slate-700/50' : 'border-emerald-200/50'} shadow-2xl p-8`}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-green-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 shadow-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">معدل الحضور</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">متابعة حضورك عبر الأشهر</p>
                  </div>
                </div>
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-xl">
                    <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    لا توجد بيانات حضور
                  </h4>
                  <p className="text-slate-500 dark:text-slate-500 mb-6">
                    لم يتم العثور على بيانات حضور في قاعدة البيانات
                  </p>
                  <motion.button 
                    onClick={handleRefresh}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-xl font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    إعادة المحاولة
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
          
        </motion.div>
        )}

        {/* No Data Message */}
        {gradeProgression.length === 0 && subjectPerformance.length === 0 && completionData.length === 0 && attendanceData.length === 0 && !loading && (
          <motion.div
            className="mt-8"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <LuxuryCard gradient="bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-700/85">
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  لا توجد بيانات متاحة
                </h4>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  لم يتم العثور على بيانات الرسوم البيانية من قاعدة البيانات
                </p>
                <button 
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  إعادة المحاولة
                </button>
              </div>
            </LuxuryCard>
          </motion.div>
        )}

        {/* Enrolled Courses Section */}
        <motion.div
          className="mt-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <LuxuryCard gradient="bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-700/85">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    الدورات المسجلة
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    الدورات التي تشارك فيها حالياً
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                عرض جميع الدورات
              </button>
            </div>
            
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.slice(0, 6).map((course, index) => (
                  <motion.div
                    key={course._id || index}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-2xl transition-all duration-500"
                    whileHover={{ scale: 1.03, y: -8 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Course Image */}
                    <div className="relative h-48 overflow-hidden">
                      {course.imageUrl || course.image ? (
                        <img
                          src={course.imageUrl || course.image}
                          alt={course.courseName || course.name || 'صورة الدورة'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Placeholder when no image */}
                      <div 
                        className={`w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 dark:from-blue-600 dark:via-purple-700 dark:to-pink-700 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${course.imageUrl || course.image ? 'hidden' : 'flex'}`}
                      >
                        <div className="text-center text-white">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-80" />
                          <p className="text-sm font-medium opacity-90 px-2">
                            {course.courseName || course.name || 'صورة الدورة'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Course Status Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          course.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' :
                          course.status === 'in_progress' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' :
                          'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          {course.status === 'completed' ? 'مكتمل' :
                           course.status === 'in_progress' ? 'قيد التقدم' : 'لم يبدأ'}
                        </div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {course.courseName || course.name || 'دورة تعليمية'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {course.subject || 'مادة عامة'}
                        </p>
                      </div>

                      {/* Progress Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            التقدم الفعلي
                          </span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">
                            {course.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress || 0}%` }}
                            transition={{ duration: 1.5, delay: index * 0.2 }}
                          />
                        </div>
                        {/* Show completed items if available */}
                        {(course.completedVideos !== undefined || course.completedExams !== undefined) && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {course.completedVideos || 0} فيديو / {course.totalVideos || 0} • {course.completedExams || 0} امتحان / {course.totalExams || 0}
                          </div>
                        )}
                      </div>

                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>مدة الدورة</span>
                        </div>
                        <div className="text-gray-800 dark:text-white font-medium">
                          {course.duration || '4 أسابيع'}
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  لا توجد دورات مسجلة
                </h4>
                <p className="text-gray-500 dark:text-gray-500">
                  لم يتم تسجيلك في أي دورات حالياً
                </p>
              </div>
            )}
          </LuxuryCard>
        </motion.div>

        {/* Real Grades Table from Database - Beautiful Design (Same as Parent Dashboard) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="mb-8  mt-8 p-8 rounded-2xl bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-700/15 light:from-cyan-50/30 light:to-blue-100/30 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        >
          <h3 className="text-xl font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700 mb-6 flex items-center gap-2">
            <Award size={24} />
            نتائج الاختبارات الأخيرة
          </h3>
          
          <div className="overflow-x-auto">
            {gradesData.length > 0 ? (
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
                      <td className="py-4 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600 font-medium text-right whitespace-nowrap">
                        <div className="truncate" title={grade.examTitle || 'امتحان غير محدد'}>
                          {grade.examTitle || 'امتحان غير محدد'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600 text-right whitespace-nowrap">
                        <div className="truncate" title={grade.courseName || 'غير محدد'}>
                          {grade.courseName || 'غير محدد'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-cyan-500/10 px-3 py-1 rounded-lg text-sm font-mono font-bold text-cyan-200 dark:text-cyan-100 light:text-cyan-600 whitespace-nowrap">
                          {grade.studentScore || 0}/{grade.totalScore || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          (grade.percentage || 0) >= 90 ? 'bg-green-500/20 text-green-300 dark:text-green-400' :
                          (grade.percentage || 0) >= 80 ? 'bg-blue-500/20 text-blue-300 dark:text-blue-400' :
                          (grade.percentage || 0) >= 70 ? 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-400' :
                          (grade.percentage || 0) >= 50 ? 'bg-orange-500/20 text-orange-300 dark:text-orange-400' :
                          'bg-red-500/20 text-red-300 dark:text-red-400'
                        }`}>
                          {grade.percentage || 0}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          (grade.percentage || 0) >= 90 ? 'bg-green-500/20 text-green-300 dark:text-green-400' :
                          (grade.percentage || 0) >= 80 ? 'bg-blue-500/20 text-blue-300 dark:text-blue-400' :
                          (grade.percentage || 0) >= 70 ? 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-400' :
                          (grade.percentage || 0) >= 50 ? 'bg-orange-500/20 text-orange-300 dark:text-orange-400' :
                          'bg-red-500/20 text-red-300 dark:text-red-400'
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

        {/* Exam Grades Section - Enhanced UX */}
        <motion.div
          className="mt-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
         
        </motion.div>

        {/* Achievement Section */}
        <motion.div
          className="mt-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <LuxuryCard gradient="bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-800/95 dark:to-gray-700/85">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    الإنجازات والتميز
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    إنجازاتك المتميزة في رحلة التعلم
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                عرض جميع الإنجازات
              </button>
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { 
                    title: 'طالب مجتهد', 
                    description: 'حافظ على حضور منتظم ومثابر في التعلم', 
                    icon: Star, 
                    color: 'text-amber-500',
                    gradient: 'from-amber-400 to-yellow-500'
                  },
                  { 
                    title: 'مشارك نشط', 
                    description: 'يساهم بفعالية في الأنشطة الصفية', 
                    icon: Users, 
                    color: 'text-emerald-500',
                    gradient: 'from-emerald-400 to-green-500'
                  },
                  { 
                    title: 'قارئ ممتاز', 
                    description: 'يقرأ بانتظام ويطور مهاراته اللغوية', 
                    icon: BookOpen, 
                    color: 'text-blue-500',
                    gradient: 'from-blue-400 to-indigo-500'
                  },
                  { 
                    title: 'مبدع في التعبير', 
                    description: 'يتميز في الكتابة والتعبير عن الأفكار', 
                    icon: PenTool, 
                    color: 'text-purple-500',
                    gradient: 'from-purple-400 to-violet-500'
                  },
                  { 
                    title: 'منظم ومخطط', 
                    description: 'يدير وقته وواجباته بشكل ممتاز', 
                    icon: Calendar, 
                    color: 'text-orange-500',
                    gradient: 'from-orange-400 to-red-500'
                  },
                  { 
                    title: 'قائد في الفصل', 
                    description: 'يساعد زملاءه ويقود الأنشطة الجماعية', 
                    icon: Crown, 
                    color: 'text-rose-500',
                    gradient: 'from-rose-400 to-pink-500'
                  }
                ].map((achievement, index) => (
                <motion.div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-2xl transition-all duration-500"
                  whileHover={{ scale: 1.05, y: -8 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Achievement Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${achievement.gradient} shadow-lg`} />
                  </div>

                  {/* Achievement Content */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${achievement.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <achievement.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${achievement.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </motion.div>
              ))}
            </div>
          </LuxuryCard>
        </motion.div>
      </div>
    </div>
  );
};

export default LuxuryStudentStats;
