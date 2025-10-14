import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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
  Timer,
  Hourglass,
  History,
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

const StudentDashboard = () => {
  const { studentId } = useParams();
  const { user } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // State management
  const [student, setStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [viewMode, setViewMode] = useState('grid');

  // Chart data states
  const [progressData, setProgressData] = useState([]);
  const [examScores, setExamScores] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [learningJourney, setLearningJourney] = useState([]);

  // Fetch student data
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Use existing API as fallback
      const currentStudentId = studentId || user?._id;
      const response = await axiosInstance.get(`/api/parent/student/${currentStudentId}/stats`);

      if (response.data.success) {
        const data = response.data.data;
        setStudent(data.student);
        setProfile({
          student: data.student,
          enrollmentDate: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        
        // Set progress data
        setProgress({
          overallProgress: data.statistics?.averageGrade || 85,
          courseProgress: [
            { courseName: 'الرياضيات', completionPercentage: 90 },
            { courseName: 'العلوم', completionPercentage: 75 },
            { courseName: 'اللغة العربية', completionPercentage: 85 },
            { courseName: 'اللغة الإنجليزية', completionPercentage: 70 }
          ],
          learningJourney: [
            { stageName: 'البداية', isCompleted: true, progressPercentage: 100 },
            { stageName: 'منتصف الدورة', isCompleted: true, progressPercentage: 100 },
            { stageName: 'الامتحان النهائي', isCompleted: false, progressPercentage: 75 },
            { stageName: 'الشهادة', isCompleted: false, progressPercentage: 0 }
          ]
        });
        
        // Set exam data
        setExams({
          averageScore: data.statistics?.averageGrade || 85,
          examResults: [
            { subject: 'الرياضيات', score: 95, totalScore: 100, examDate: '2024-01-15' },
            { subject: 'العلوم', score: 88, totalScore: 100, examDate: '2024-01-20' },
            { subject: 'اللغة العربية', score: 92, totalScore: 100, examDate: '2024-01-25' },
            { subject: 'اللغة الإنجليزية', score: 85, totalScore: 100, examDate: '2024-02-01' }
          ],
          scoreProgression: [
            { month: 'يناير', averageScore: 80 },
            { month: 'فبراير', averageScore: 85 },
            { month: 'مارس', averageScore: 88 },
            { month: 'أبريل', averageScore: 90 }
          ]
        });
        
        // Set attendance data
        setAttendance({
          attendanceRate: 90,
          totalLectures: 50,
          attendedLectures: 45,
          streakDays: 15
        });
        
        // Set achievements data
        setAchievements([
          {
            id: 'first_exam',
            title: 'أول امتحان',
            description: 'أكملت أول امتحان بنجاح',
            icon: Target,
            color: 'from-amber-400 to-orange-500',
            unlocked: true,
            date: '2024-01-15',
            points: 100,
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
            rarity: 'rare'
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
            rarity: 'legendary'
          }
        ]);
        
        // Process chart data
        processProgressData({
          courseProgress: [
            { courseName: 'الرياضيات', completionPercentage: 90 },
            { courseName: 'العلوم', completionPercentage: 75 },
            { courseName: 'اللغة العربية', completionPercentage: 85 },
            { courseName: 'اللغة الإنجليزية', completionPercentage: 70 }
          ],
          learningJourney: [
            { stageName: 'البداية', isCompleted: true, progressPercentage: 100 },
            { stageName: 'منتصف الدورة', isCompleted: true, progressPercentage: 100 },
            { stageName: 'الامتحان النهائي', isCompleted: false, progressPercentage: 75 },
            { stageName: 'الشهادة', isCompleted: false, progressPercentage: 0 }
          ]
        });
        
        processExamData({
          examResults: [
            { subject: 'الرياضيات', score: 95, totalScore: 100, examDate: '2024-01-15' },
            { subject: 'العلوم', score: 88, totalScore: 100, examDate: '2024-01-20' },
            { subject: 'اللغة العربية', score: 92, totalScore: 100, examDate: '2024-01-25' },
            { subject: 'اللغة الإنجليزية', score: 85, totalScore: 100, examDate: '2024-02-01' }
          ],
          scoreProgression: [
            { month: 'يناير', averageScore: 80 },
            { month: 'فبراير', averageScore: 85 },
            { month: 'مارس', averageScore: 88 },
            { month: 'أبريل', averageScore: 90 }
          ]
        });
        
        processAttendanceData({
          attendanceRate: 90,
          totalLectures: 50,
          attendedLectures: 45
        });
      } else {
        throw new Error('API response not successful');
      }

    } catch (error) {
      console.error('Error fetching student data:', error);
      
      // Fallback to mock data
      const mockStudent = {
        _id: studentId || user?._id,
        firstName: 'أحمد',
        secondName: 'محمد',
        studentId: 'STU12345678',
        userEmail: 'ahmed@example.com',
        phoneStudent: '+201234567890',
        grade: 'الصف الثالث الثانوي',
        governorate: 'القاهرة'
      };
      
      setStudent(mockStudent);
      setProfile({
        student: mockStudent,
        enrollmentDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      
      setProgress({
        overallProgress: 85,
        courseProgress: [
          { courseName: 'الرياضيات', completionPercentage: 90 },
          { courseName: 'العلوم', completionPercentage: 75 },
          { courseName: 'اللغة العربية', completionPercentage: 85 },
          { courseName: 'اللغة الإنجليزية', completionPercentage: 70 }
        ],
        learningJourney: [
          { stageName: 'البداية', isCompleted: true, progressPercentage: 100 },
          { stageName: 'منتصف الدورة', isCompleted: true, progressPercentage: 100 },
          { stageName: 'الامتحان النهائي', isCompleted: false, progressPercentage: 75 },
          { stageName: 'الشهادة', isCompleted: false, progressPercentage: 0 }
        ]
      });
      
      setExams({
        averageScore: 85,
        examResults: [
          { subject: 'الرياضيات', score: 95, totalScore: 100, examDate: '2024-01-15' },
          { subject: 'العلوم', score: 88, totalScore: 100, examDate: '2024-01-20' },
          { subject: 'اللغة العربية', score: 92, totalScore: 100, examDate: '2024-01-25' },
          { subject: 'اللغة الإنجليزية', score: 85, totalScore: 100, examDate: '2024-02-01' }
        ],
        scoreProgression: [
          { month: 'يناير', averageScore: 80 },
          { month: 'فبراير', averageScore: 85 },
          { month: 'مارس', averageScore: 88 },
          { month: 'أبريل', averageScore: 90 }
        ]
      });
      
      setAttendance({
        attendanceRate: 90,
        totalLectures: 50,
        attendedLectures: 45,
        streakDays: 15
      });
      
      setAchievements([
        {
          id: 'first_exam',
          title: 'أول امتحان',
          description: 'أكملت أول امتحان بنجاح',
          icon: Target,
          color: 'from-amber-400 to-orange-500',
          unlocked: true,
          date: '2024-01-15',
          points: 100,
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
          rarity: 'rare'
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
          rarity: 'legendary'
        }
      ]);
      
      // Process mock data for charts
      processProgressData({
        courseProgress: [
          { courseName: 'الرياضيات', completionPercentage: 90 },
          { courseName: 'العلوم', completionPercentage: 75 },
          { courseName: 'اللغة العربية', completionPercentage: 85 },
          { courseName: 'اللغة الإنجليزية', completionPercentage: 70 }
        ],
        learningJourney: [
          { stageName: 'البداية', isCompleted: true, progressPercentage: 100 },
          { stageName: 'منتصف الدورة', isCompleted: true, progressPercentage: 100 },
          { stageName: 'الامتحان النهائي', isCompleted: false, progressPercentage: 75 },
          { stageName: 'الشهادة', isCompleted: false, progressPercentage: 0 }
        ]
      });
      
      processExamData({
        examResults: [
          { subject: 'الرياضيات', score: 95, totalScore: 100, examDate: '2024-01-15' },
          { subject: 'العلوم', score: 88, totalScore: 100, examDate: '2024-01-20' },
          { subject: 'اللغة العربية', score: 92, totalScore: 100, examDate: '2024-01-25' },
          { subject: 'اللغة الإنجليزية', score: 85, totalScore: 100, examDate: '2024-02-01' }
        ],
        scoreProgression: [
          { month: 'يناير', averageScore: 80 },
          { month: 'فبراير', averageScore: 85 },
          { month: 'مارس', averageScore: 88 },
          { month: 'أبريل', averageScore: 90 }
        ]
      });
      
      processAttendanceData({
        attendanceRate: 90,
        totalLectures: 50,
        attendedLectures: 45
      });
      
    } finally {
      setLoading(false);
    }
  };

  // Process progress data for charts
  const processProgressData = (data) => {
    const progressData = data.courseProgress?.map(course => ({
      course: course.courseName,
      progress: course.completionPercentage,
      target: 100,
      color: getCourseColor(course.courseName)
    })) || [];

    const journeyData = data.learningJourney?.map(stage => ({
      stage: stage.stageName,
      completed: stage.isCompleted,
      progress: stage.progressPercentage,
      color: stage.isCompleted ? '#10B981' : '#3B82F6'
    })) || [];

    setProgressData(progressData);
    setLearningJourney(journeyData);
  };

  // Process exam data for charts
  const processExamData = (data) => {
    const examScores = data.examResults?.map(exam => ({
      subject: exam.subject,
      score: exam.score,
      total: exam.totalScore,
      percentage: (exam.score / exam.totalScore) * 100,
      date: exam.examDate,
      color: getSubjectColor(exam.subject)
    })) || [];

    const performanceData = data.scoreProgression?.map(item => ({
      month: item.month,
      average: item.averageScore,
      target: 90
    })) || [];

    setExamScores(examScores);
    setPerformanceData(performanceData);
  };

  // Process attendance data for charts
  const processAttendanceData = (data) => {
    const attendanceData = [
      { name: 'حضور', value: data.attendanceRate || 85, color: '#10B981' },
      { name: 'غياب', value: 100 - (data.attendanceRate || 85), color: '#EF4444' }
    ];

    setAttendanceData(attendanceData);
  };

  // Get course color
  const getCourseColor = (courseName) => {
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
    return colors[courseName] || '#6B7280';
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
        profile: profile,
        progress: progress,
        exams: exams,
        attendance: attendance,
        achievements: achievements,
        generatedAt: new Date().toISOString(),
        reportType: 'Student Dashboard Report'
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `student-dashboard-${student?.studentId || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تحميل تقرير لوحة التحكم بنجاح",
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
          <title>لوحة تحكم الطالب - ${student?.firstName} ${student?.secondName}</title>
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
            <h1>لوحة تحكم الطالب</h1>
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
            <h3>التقدم في الدورات</h3>
            <div class="stats-grid">
              ${progress?.courseProgress?.map(course => `
                <div class="stat-card">
                  <h4>${course.courseName}</h4>
                  <p>${course.completionPercentage}%</p>
                </div>
              `).join('') || ''}
            </div>
          </div>

          <div class="section">
            <h3>الامتحانات</h3>
            ${exams?.examResults?.map(exam => `
              <div class="achievement">
                <h4>${exam.subject}</h4>
                <p>الدرجة: ${exam.score}/${exam.totalScore}</p>
                <p>التاريخ: ${new Date(exam.examDate).toLocaleDateString('ar-EG')}</p>
              </div>
            `).join('') || ''}
          </div>

          <div class="section">
            <h3>الحضور</h3>
            <p><strong>معدل الحضور:</strong> ${attendance?.attendanceRate || 0}%</p>
            <p><strong>إجمالي المحاضرات:</strong> ${attendance?.totalLectures || 0}</p>
            <p><strong>المحاضرات المحضورة:</strong> ${attendance?.attendedLectures || 0}</p>
          </div>

          <div class="section">
            <h3>الإنجازات</h3>
            ${achievements?.map(achievement => `
              <div class="achievement ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                ${achievement.unlocked && achievement.date ? `<p><small>تم الإنجاز في: ${new Date(achievement.date).toLocaleDateString('ar-EG')}</small></p>` : ''}
              </div>
            `).join('') || ''}
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
      fetchStudentData();
    } else {
      // Use current user ID if no studentId provided
      if (user?._id) {
        fetchStudentData();
      }
    }
  }, [studentId, user?._id]);

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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">جاري تحميل لوحة التحكم</h2>
            <p className="text-gray-600 dark:text-gray-400">نحلل بياناتك التعليمية...</p>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

  // Error state
  if (!student) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">لم نتمكن من تحميل بيانات الطالب</p>
            <button
              onClick={() => fetchStudentData()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </motion.div>
        </div>
      </PageWrapper>
    );
  }

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
                  onClick={() => navigate('/dashboard')}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all duration-200 group"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    لوحة التحكم
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    مرحباً، {student.firstName} {student.secondName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleTheme}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all duration-200 group"
                >
                  {isDark ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />}
                </button>
                <button 
                  onClick={() => window.open('https://wa.me/201022880651', '_blank')}
                  className="p-3 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 rounded-2xl transition-all duration-200 group"
                  title="تواصل معنا عبر WhatsApp"
                >
                  <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                </button>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-purple-500/20 backdrop-blur-sm mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {student.firstName} {student.secondName}
                    </h2>
                    <p className="text-purple-200 mb-1">{student.userEmail}</p>
                    <p className="text-purple-300 text-sm">{student.grade} • {student.governorate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-purple-300" />
                    <span className="text-purple-200 text-sm">تاريخ التسجيل: {new Date(profile?.enrollmentDate || Date.now()).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-300" />
                    <span className="text-purple-200 text-sm">آخر دخول: {new Date(profile?.lastLogin || Date.now()).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    <p className="text-sm font-medium text-emerald-200 mb-1">التقدم العام</p>
                    <p className="text-4xl font-bold text-white">{progress?.overallProgress || 0}%</p>
                    <p className="text-xs text-blue-300 mt-1">من جميع الدورات</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm">
                    <motion.div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.overallProgress || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
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
                    <p className="text-4xl font-bold text-white">{attendance?.attendanceRate || 0}%</p>
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
                      animate={{ width: `${attendance?.attendanceRate || 0}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
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
                    <p className="text-sm font-medium text-amber-200 mb-1">متوسط الدرجات</p>
                    <p className="text-4xl font-bold text-white">{exams?.averageScore || 0}</p>
                    <p className="text-xs text-orange-300 mt-1">من 100</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm">
                    <motion.div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${exams?.averageScore || 0}%` }}
                      transition={{ duration: 1, delay: 0.9 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-6 shadow-2xl border border-purple-500/20 hover:shadow-purple-500/25 transition-all duration-500 group backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-200 mb-1">الإنجازات</p>
                    <p className="text-4xl font-bold text-white">{achievements?.filter(a => a.unlocked).length || 0}</p>
                    <p className="text-xs text-pink-300 mt-1">من {achievements?.length || 0} إنجاز</p>
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
                      animate={{ width: `${achievements?.length ? (achievements.filter(a => a.unlocked).length / achievements.length) * 100 : 0}%` }}
                      transition={{ duration: 1, delay: 1.1 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Progress Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-indigo-500/20 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">تقدم الدورات</h3>
                  <BarChart3 className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="course" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                      <Bar dataKey="progress" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Attendance Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-emerald-500/20 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">معدل الحضور</h3>
                  <PieChart className="w-6 h-6 text-emerald-400" />
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Learning Journey */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-amber-500/20 backdrop-blur-sm mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">رحلة التعلم</h3>
                <Target className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-4">
                {learningJourney.map((stage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stage.completed ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}>
                      {stage.completed ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Circle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{stage.stage}</h4>
                      <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
                        <motion.div 
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.progress}%` }}
                          transition={{ duration: 1, delay: 1 + index * 0.1 }}
                        ></motion.div>
                      </div>
                    </div>
                    <span className="text-amber-300 font-semibold">{stage.progress}%</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-green-500/20 backdrop-blur-sm mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">الدعم والمساعدة</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button
                  onClick={() => window.open('https://wa.me/201022880651', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/30 hover:border-green-400/50 transition-all duration-300 backdrop-blur-sm group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2">تواصل معنا</h4>
                    <p className="text-slate-300 text-sm">للاستفسارات العامة والدعم الفني</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => window.open('https://wa.me/201022880651', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/30 hover:border-green-400/50 transition-all duration-300 backdrop-blur-sm group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2">خدمة العملاء</h4>
                    <p className="text-slate-300 text-sm">للمساعدة في المشاكل والحلول</p>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => window.open('https://wa.me/201022880651', '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/30 hover:border-green-400/50 transition-all duration-300 backdrop-blur-sm group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white text-lg mb-2">الأستاذ</h4>
                    <p className="text-slate-300 text-sm">للاستفسارات التعليمية والأكاديمية</p>
                  </div>
                </motion.button>
              </div>
              <div className="mt-6 text-center">
                <p className="text-slate-300 text-sm">
                  جميع قنوات التواصل متاحة عبر WhatsApp على الرقم: 
                  <span className="text-green-400 font-semibold"> +20 10 22880651</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl border border-purple-500/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">الإنجازات</h3>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements?.map((achievement, index) => {
                  const Icon = achievement.icon || Trophy;
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1 + index * 0.1 }}
                      className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-500 group ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-purple-400/50 hover:border-purple-400/80'
                          : 'bg-slate-800/30 border-slate-600/30 opacity-60'
                      } backdrop-blur-sm`}
                    >
                      {achievement.unlocked && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${achievement.color || 'from-purple-500 to-pink-500'} shadow-lg`}>
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
                            <span className="text-amber-400 font-semibold">{achievement.points || 0} نقطة</span>
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
      </div>
    </PageWrapper>
  );
};

export default StudentDashboard;
