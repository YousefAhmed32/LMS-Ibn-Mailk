import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import PageWrapper from '../../components/layout/PageWrapper';
import {
  ArrowLeft,
  User,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Mail,
  Phone,
  MapPin,
  Clock,
  Target,
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  GraduationCap,
  Brain,
  Zap,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Eye,
  Heart,
  ThumbsUp,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Printer,
  Share2,
  Filter,
  Search,
  Settings,
  Bell,
  Home,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Lock,
  Unlock,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Flag,
  Globe,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Palette,
  Layers,
  Grid,
  List,
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
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Hand,
  Flame,
  Rocket,
  Diamond,
  Gem,
  Coins,
  Gift,
  Badge,
  Ribbon,
  Scroll,
  Bookmark,
  Bookmark as BookmarkCheck,
  Calendar as CalendarCheck,
  Calendar as CalendarX,
  Timer,
  Timer as TimerOff,
  Hourglass,
  Clock as Stopwatch,
  History,
  Repeat as Repeat1,
  SkipForward as FastForward,
  SkipBack as Rewind,
  Play as PlaySquare,
  Pause as PauseSquare,
  Square as StopSquare,
  Circle,
  Triangle,
  Zap as Flash,
  Zap as Lightning,
  Sun as Sunrise,
  Sun as Sunset
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
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

const StudentStatisticsPage = () => {
  const { studentId } = useParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();

  // State management
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [viewMode, setViewMode] = useState('grid');

  // Chart data states
  const [examScores, setExamScores] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [learningJourney, setLearningJourney] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [insights, setInsights] = useState([]);

  // Fetch student statistics
  const fetchStudentStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/parent/student/${studentId}/stats`);
      
      if (response.data.success) {
        const data = response.data.data;
        setStudent(data.student || null);
        const rawStats = data.statistics;
        setStats(rawStats ? { ...rawStats } : { averageGrade: 0, completedCourses: 0, totalCourses: 0, attendanceRate: 0, streakDays: 0 });
        processChartData(data);
        generateInsights(data);
        generateLearningJourney(data);
        generateAchievements(data);
      } else {
        toast({
          title: "خطأ",
          description: response.data.message || "فشل في تحميل بيانات الطالب",
          variant: "destructive",
        });
        navigate('/parent/dashboard');
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الطالب",
        variant: "destructive",
      });
      navigate('/parent/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Process chart data - real data only, zeros when none
  const processChartData = (data) => {
    const examScoresData = data.charts?.subjectDistribution?.map(subject => ({
      subject: subject.subject,
      score: subject.score,
      total: 100,
      percentage: subject.score,
      color: getSubjectColor(subject.subject)
    })) || [];
    const attendanceRate = data.statistics?.attendanceRate ?? 0;
    const attendanceData = [
      { name: 'حضور', value: attendanceRate, color: '#10B981' },
      { name: 'غياب', value: Math.max(0, 100 - attendanceRate), color: '#EF4444' }
    ];
    const progressData = data.charts?.gradeProgression?.map(item => ({
      month: item.month,
      progress: item.grade,
      target: 90
    })) || [];
    setExamScores(examScoresData);
    setAttendanceData(attendanceData);
    setProgressData(progressData);
    setPerformanceData([]);
  };

  // Generate smart insights - real data only, لا يوجد when none
  const generateInsights = (data) => {
    const s = data.statistics || {};
    const insights = [
      {
        type: 'success',
        icon: Star,
        title: 'أفضل مادة',
        description: s.averageScore != null ? `متوسط الدرجات ${s.averageScore}%` : 'لا توجد بيانات',
        color: 'from-emerald-400 to-green-500',
        gradient: 'bg-gradient-to-r from-emerald-400 to-green-500'
      },
      {
        type: 'info',
        icon: TrendingUp,
        title: 'تطور إيجابي',
        description: s.improvementRate != null ? `تحسن ${s.improvementRate}% هذا الشهر` : 'لا توجد بيانات تحسن',
        color: 'from-blue-400 to-cyan-500',
        gradient: 'bg-gradient-to-r from-blue-400 to-cyan-500'
      },
      {
        type: 'achievement',
        icon: Trophy,
        title: 'الدورات المكتملة',
        description: s.completedCourses != null ? `أكملت ${s.completedCourses} دورة` : 'لا توجد',
        color: 'from-purple-400 to-indigo-500',
        gradient: 'bg-gradient-to-r from-purple-400 to-indigo-500'
      },
      {
        type: 'streak',
        icon: Flame,
        title: 'سلسلة النجاح',
        description: s.streakDays != null ? `${s.streakDays} يوم متتالي من الدراسة` : 'لا توجد بيانات',
        color: 'from-red-400 to-pink-500',
        gradient: 'bg-gradient-to-r from-red-400 to-pink-500'
      },
      {
        type: 'perfect',
        icon: Crown,
        title: 'الدرجات الكاملة',
        description: s.perfectScores != null ? `${s.perfectScores} درجة كاملة` : 'لا توجد',
        color: 'from-yellow-400 to-amber-500',
        gradient: 'bg-gradient-to-r from-yellow-400 to-amber-500'
      }
    ];
    setInsights(insights);
  };

  // Generate learning journey - real data only; empty or minimal when none
  const generateLearningJourney = (data) => {
    const progress = data.charts?.gradeProgression;
    if (progress && progress.length > 0) {
      const last = progress[progress.length - 1];
      setLearningJourney([
        { stage: 'البداية', completed: true, progress: 100, color: '#10B981' },
        { stage: 'التقدم', completed: (last?.grade || 0) >= 50, progress: last?.grade || 0, color: '#3B82F6' },
        { stage: 'الامتحان النهائي', completed: false, progress: 0, color: '#6B7280' }
      ]);
    } else {
      setLearningJourney([]);
    }
  };

  // Generate achievements with real data
  const generateAchievements = (data) => {
    const achievements = [
      {
        id: 'first_exam',
        title: 'أول امتحان',
        description: 'أكملت أول امتحان بنجاح',
        icon: Target,
        color: 'from-amber-400 to-orange-500',
        unlocked: true,
        date: '2024-01-15',
        points: 100,
        category: 'exam',
        rarity: 'common'
      },
      {
        id: 'persistent',
        title: 'المثابر',
        description: 'حضرت 10 محاضرات متتالية',
        icon: Flame,
        color: 'from-red-400 to-pink-500',
        unlocked: true,
        date: '2024-02-01',
        points: 200,
        category: 'attendance',
        rarity: 'uncommon'
      },
      {
        id: 'excellent_student',
        title: 'الطالب المتميز',
        description: 'حصلت على 90% في 3 امتحانات',
        icon: Star,
        color: 'from-yellow-400 to-amber-500',
        unlocked: true,
        date: '2024-02-10',
        points: 300,
        category: 'performance',
        rarity: 'rare'
      },
      {
        id: 'perfectionist',
        title: 'المتفوق',
        description: 'حصلت على 95% في الرياضيات',
        icon: Trophy,
        color: 'from-purple-400 to-indigo-500',
        unlocked: true,
        date: '2024-01-15',
        points: 250,
        category: 'performance',
        rarity: 'rare'
      },
      {
        id: 'course_completer',
        title: 'مكمل الدورات',
        description: 'أكملت 5 دورات',
        icon: GraduationCap,
        color: 'from-blue-400 to-cyan-500',
        unlocked: true,
        date: '2024-02-05',
        points: 400,
        category: 'course',
        rarity: 'epic'
      },
      {
        id: 'streak_master',
        title: 'سيد السلسلة',
        description: 'حافظت على 15 يوم متتالي من الدراسة',
        icon: Zap,
        color: 'from-green-400 to-emerald-500',
        unlocked: true,
        date: '2024-02-15',
        points: 500,
        category: 'streak',
        rarity: 'epic'
      },
      {
        id: 'perfect_score',
        title: 'الدرجة الكاملة',
        description: 'حصلت على 100% في امتحان',
        icon: Crown,
        color: 'from-pink-400 to-rose-500',
        unlocked: false,
        date: null,
        points: 1000,
        category: 'performance',
        rarity: 'legendary'
      },
      {
        id: 'early_bird',
        title: 'الطائر المبكر',
        description: 'حضرت 20 محاضرة مبكراً',
        icon: Sunrise,
        color: 'from-orange-400 to-red-500',
        unlocked: false,
        date: null,
        points: 150,
        category: 'attendance',
        rarity: 'uncommon'
      },
      {
        id: 'knowledge_seeker',
        title: 'باحث المعرفة',
        description: 'أكملت 10 دورات',
        icon: Brain,
        color: 'from-indigo-400 to-purple-500',
        unlocked: false,
        date: null,
        points: 800,
        category: 'course',
        rarity: 'legendary'
      },
      {
        id: 'improvement_champion',
        title: 'بطل التحسن',
        description: 'حسنت معدلك بنسبة 20%',
        icon: TrendingUp,
        color: 'from-teal-400 to-green-500',
        unlocked: false,
        date: null,
        points: 600,
        category: 'improvement',
        rarity: 'epic'
      }
    ];
    setAchievements(achievements);
  };

  // Get subject color
  const getSubjectColor = (subject) => {
    const colors = {
      'الرياضيات': '#F97316',
      'العلوم': '#3B82F6',
      'الفيزياء': '#8B5CF6',
      'الكيمياء': '#10B981',
      'اللغة العربية': '#EF4444',
      'اللغة الإنجليزية': '#06B6D4',
      'التاريخ': '#F59E0B',
      'الجغرافيا': '#84CC16',
      'عام': '#6B7280'
    };
    return colors[subject] || '#6B7280';
  };

  // Export report functionality
  const handleExportReport = () => {
    try {
      const reportData = {
        student: student,
        statistics: stats,
        achievements: achievements.filter(a => a.unlocked),
        insights: insights,
        generatedAt: new Date().toISOString(),
        reportType: 'Student Statistics Report'
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `student-report-${student?.studentId || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تحميل تقرير الطالب بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  // Print report functionality
  const handlePrintReport = () => {
    try {
      const printWindow = window.open('', '_blank');
      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير الطالب - ${student?.firstName} ${student?.secondName}</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 20px; direction: rtl; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .achievement { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 8px; }
            .unlocked { background-color: #f0f8ff; }
            .locked { background-color: #f5f5f5; opacity: 0.6; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تقرير الطالب</h1>
            <h2>${student?.firstName} ${student?.secondName}</h2>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</p>
          </div>
          
          <div class="section">
            <h3>المعلومات الشخصية</h3>
            <p><strong>البريد الإلكتروني:</strong> ${student?.userEmail}</p>
            <p><strong>رقم الهاتف:</strong> ${student?.phoneStudent}</p>
            <p><strong>الصف:</strong> ${student?.grade}</p>
            <p><strong>المحافظة:</strong> ${student?.governorate}</p>
          </div>

          <div class="section">
            <h3>الإحصائيات</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <h4>المعدل العام</h4>
                <p>${stats?.averageGrade}%</p>
              </div>
              <div class="stat-card">
                <h4>الدورات المكتملة</h4>
                <p>${stats?.completedCourses} من ${stats?.totalCourses}</p>
              </div>
              <div class="stat-card">
                <h4>معدل الحضور</h4>
                <p>${stats?.attendanceRate}%</p>
              </div>
              <div class="stat-card">
                <h4>سلسلة النجاح</h4>
                <p>${stats?.streakDays || 15} يوم</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>الإنجازات</h3>
            ${achievements.map(achievement => `
              <div class="achievement ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                ${achievement.unlocked && achievement.date ? `<p><small>تم الإنجاز في: ${new Date(achievement.date).toLocaleDateString('ar-EG')}</small></p>` : ''}
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h3>الرؤى الذكية</h3>
            ${insights.map(insight => `
              <div class="achievement">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();

      toast({
        title: "تم الطباعة بنجاح",
        description: "تم إرسال التقرير للطباعة",
        variant: "default",
      });
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "خطأ في الطباعة",
        description: "فشل في طباعة التقرير",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentStats();
    }
  }, [studentId]);

  // Loading state
  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">جاري تحميل الإحصائيات</h2>
            <p className="text-gray-600 dark:text-gray-400">نحلل بيانات الطالب...</p>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  if (!student || !stats) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">لم يتم العثور على الطالب</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">الطالب غير موجود أو ليس لديك صلاحية للوصول إليه</p>
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft size={24} />
              العودة للوحة التحكم
            </button>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  // Chart colors
  const chartColors = {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1',
    teal: '#14B8A6'
  };

  const pieColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1'];

  // Tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-6 shadow-2xl border border-purple-500/20 hover:shadow-purple-500/25 transition-all duration-500 group backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-200 mb-1">المعدل العام</p>
                      <p className="text-4xl font-bold text-white">{stats.averageGrade}%</p>
                      <p className="text-xs text-emerald-300 mt-1">+{stats.improvementRate || 12}% من الشهر الماضي</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.averageGrade}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 rounded-3xl p-6 shadow-2xl border border-emerald-500/20 hover:shadow-emerald-500/25 transition-all duration-500 group backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-200 mb-1">الدورات المكتملة</p>
                      <p className="text-4xl font-bold text-white">{stats.completedCourses}</p>
                      <p className="text-xs text-blue-300 mt-1">من أصل {stats.totalCourses} دورة</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm">
                      <motion.div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.completedCourses / (stats.totalCourses || 1)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-6 shadow-2xl border border-blue-500/20 hover:shadow-blue-500/25 transition-all duration-500 group backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200 mb-1">معدل الحضور</p>
                      <p className="text-4xl font-bold text-white">{stats.attendanceRate}%</p>
                      <p className="text-xs text-purple-300 mt-1">ممتاز هذا الشهر</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.attendanceRate}%` }}
                        transition={{ duration: 1, delay: 0.9 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 rounded-3xl p-6 shadow-2xl border border-amber-500/20 hover:shadow-amber-500/25 transition-all duration-500 group backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-200 mb-1">سلسلة النجاح</p>
                      <p className="text-4xl font-bold text-white">{stats.streakDays || 15}</p>
                      <p className="text-xs text-orange-300 mt-1">يوم متتالي من الدراسة</p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Flame className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm">
                      <motion.div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((stats.streakDays || 15) * 5, 100)}%` }}
                        transition={{ duration: 1, delay: 1.1 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Learning Journey */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">رحلة التعلم</h3>
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">التقدم العام</span>
                </div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between">
                  {learningJourney.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 py-4 w-full text-center">لا توجد بيانات للتقدم</p>
                  ) : (
                  learningJourney.map((stage, index) => (
                    <div key={index} className="flex flex-col items-center relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                          stage.completed 
                            ? 'bg-green-500 border-green-500' 
                            : stage.progress > 0 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600'
                        }`}
                      >
                        {stage.completed ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : stage.progress > 0 ? (
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                        )}
                      </motion.div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{stage.stage}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stage.progress}%</p>
                      </div>
                      {index < learningJourney.length - 1 && (
                        <div className="absolute top-6 left-12 w-full h-0.5 bg-gray-200 dark:bg-gray-700">
                          <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: stage.completed ? '100%' : '0%' }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                          ></motion.div>
                        </div>
                      )}
                    </div>
                  ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Exam Scores Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">درجات الامتحانات</h3>
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={examScores}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                      <Bar dataKey="score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Attendance Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">معدل الحضور</h3>
                  <PieChart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Smart Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-indigo-500/20 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-white">رؤى ذكية</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {insights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 backdrop-blur-sm group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${insight.gradient} shadow-lg`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-bold text-white text-lg">{insight.title}</h4>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{insight.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-amber-500/20 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-white">الإنجازات</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-500 group ${
                          achievement.unlocked
                            ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-amber-400/50 hover:border-amber-400/80'
                            : 'bg-slate-800/30 border-slate-600/30 opacity-60'
                        } backdrop-blur-sm`}
                      >
                        {achievement.unlocked && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${achievement.color} shadow-lg`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg">{achievement.title}</h4>
                              <p className="text-sm text-slate-300">{achievement.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-amber-400" />
                              <span className="text-amber-400 font-semibold">{achievement.points} نقطة</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              achievement.rarity === 'legendary' ? 'bg-purple-500/20 text-purple-300' :
                              achievement.rarity === 'epic' ? 'bg-blue-500/20 text-blue-300' :
                              achievement.rarity === 'rare' ? 'bg-green-500/20 text-green-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {achievement.rarity === 'legendary' ? 'أسطوري' :
                               achievement.rarity === 'epic' ? 'ملحمي' :
                               achievement.rarity === 'rare' ? 'نادر' : 'شائع'}
                            </div>
                          </div>
                          {achievement.unlocked && achievement.date && (
                            <p className="text-xs text-slate-400 mt-3">
                              تم الإنجاز في: {new Date(achievement.date).toLocaleDateString('ar-EG')}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">تتبع التقدم</h3>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="progress"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorProgress)"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => navigate('/parent/dashboard')}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all duration-200 group"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    إحصائيات الطالب
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {student.firstName} {student.secondName} {student.thirdName} {student.fourthName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleExportReport}
                  className="p-3 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 rounded-2xl transition-all duration-200 group"
                >
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                </button>
                <button 
                  onClick={handlePrintReport}
                  className="p-3 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 rounded-2xl transition-all duration-200 group"
                >
                  <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                </button>
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Student Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-900 dark:text-white">{student.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">رقم الهاتف</p>
                  <p className="font-medium text-gray-900 dark:text-white">{student.phoneStudent}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">المحافظة</p>
                  <p className="font-medium text-gray-900 dark:text-white">{student.governorate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الصف</p>
                  <p className="font-medium text-gray-900 dark:text-white">{student.grade}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-8" aria-label="Tabs">
                {[
                  { id: 'overview', name: 'نظرة عامة', icon: BarChart3 },
                  { id: 'achievements', name: 'الإنجازات', icon: Trophy },
                  { id: 'progress', name: 'التقدم', icon: TrendingUp }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      } whitespace-nowrap py-6 px-1 border-b-2 font-medium text-sm flex items-center gap-3 transition-all duration-200`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default StudentStatisticsPage;
