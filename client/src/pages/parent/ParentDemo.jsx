import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  UserCheck, 
  CheckCircle, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Calendar, 
  Award, 
  Clock, 
  Target,
  BarChart3,
  Users,
  Star,
  Activity,
  Sun,
  Moon,
  Download,
  Eye,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart as RechartsLineChart, BarChart as RechartsBarChart, PieChart as RechartsPieChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Pie, Cell } from 'recharts';

const ParentDemo = () => {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // بيانات وهمية شاملة للطالب التجريبي
  const demoStudent = {
    _id: 'demo-student-001',
    firstName: 'أحمد',
    secondName: 'محمد',
    lastName: 'علي',
    email: 'ahmed.mohamed@demo.com',
    phone: '+201234567890',
    studentId: 'STU-2024-001',
    grade: 'الصف الثالث الثانوي',
    school: 'مدرسة النهضة الثانوية',
    parentName: 'محمد علي',
    parentPhone: '+201234567891',
    profileImage: null,
    isActive: true,
    enrollmentDate: '2024-09-01',
    lastLogin: '2024-10-10T08:30:00Z'
  };

  // إحصائيات وهمية شاملة
  const demoStats = {
    totalCourses: 12,
    completedCourses: 8,
    inProgressCourses: 4,
    averageGrade: 87.5,
    attendanceRate: 94.2,
    examsPassed: 15,
    totalExams: 18,
    highestGrade: 98,
    lowestGrade: 72,
    studyHours: 156,
    lastActivity: '2024-10-10T14:30:00Z',
    currentStreak: 12,
    longestStreak: 25,
    certificatesEarned: 6,
    assignmentsCompleted: 45,
    totalAssignments: 52
  };

  // دورات وهمية مع تفاصيل شاملة - منصة لغة عربية للصفوف العليا
  const demoCourses = [
    {
      _id: 'course-001',
      title: 'النحو والصرف',
      description: 'قواعد النحو والصرف في اللغة العربية',
      instructor: 'أ. جميلة السيد',
      progress: 100,
      totalLessons: 20,
      completedLessons: 20,
      duration: '80 ساعة',
      difficulty: 'متوسط',
      rating: 4.9,
      studentsCount: 187,
      startDate: '2024-09-01',
      endDate: '2024-11-15',
      status: 'مكتمل',
      category: 'اللغة العربية',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      lastAccessed: '2024-11-15T12:00:00Z',
      timeSpent: '80 ساعة',
      upcomingLessons: 0,
      assignments: 5,
      completedAssignments: 5
    },
    {
      _id: 'course-002',
      title: 'الأدب العربي',
      description: 'الأدب العربي القديم والحديث',
      instructor: 'أ. جميلة السيد',
      progress: 95,
      totalLessons: 16,
      completedLessons: 15,
      duration: '70 ساعة',
      difficulty: 'متوسط',
      rating: 4.5,
      studentsCount: 145,
      startDate: '2024-09-05',
      endDate: '2024-11-25',
      status: 'جاري',
      category: 'اللغة العربية',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      lastAccessed: '2024-10-10T09:30:00Z',
      timeSpent: '28 ساعة',
      upcomingLessons: 1,
      assignments: 4,
      completedAssignments: 3
    },
    {
      _id: 'course-003',
      title: 'التعبير والإنشاء',
      description: 'فنون التعبير والإنشاء الأدبي',
      instructor: 'أ. جميلة السيد',
      progress: 75,
      totalLessons: 22,
      completedLessons: 17,
      duration: '85 ساعة',
      difficulty: 'متقدم',
      rating: 4.7,
      studentsCount: 98,
      startDate: '2024-09-15',
      endDate: '2024-12-20',
      status: 'جاري',
      category: 'اللغة العربية',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      lastAccessed: '2024-10-09T15:20:00Z',
      timeSpent: '28 ساعة',
      upcomingLessons: 5,
      assignments: 8,
      completedAssignments: 5
    },
    {
      _id: 'course-004',
      title: 'البلاغة العربية',
      description: 'علم البلاغة والبيان والبديع',
      instructor: 'أ. جميلة السيد',
      progress: 82,
      totalLessons: 20,
      completedLessons: 16,
      duration: '75 ساعة',
      difficulty: 'متقدم',
      rating: 4.8,
      studentsCount: 110,
      startDate: '2024-09-08',
      endDate: '2024-12-15',
      status: 'جاري',
      category: 'اللغة العربية',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      lastAccessed: '2024-10-10T11:30:00Z',
      timeSpent: '35 ساعة',
      upcomingLessons: 4,
      assignments: 7,
      completedAssignments: 5
    },
    {
      _id: 'course-005',
      title: 'النقد الأدبي',
      description: 'مبادئ النقد الأدبي والتحليل',
      instructor: 'أ. جميلة السيد',
      progress: 100,
      totalLessons: 16,
      completedLessons: 16,
      duration: '60 ساعة',
      difficulty: 'متوسط',
      rating: 4.9,
      studentsCount: 85,
      startDate: '2024-08-25',
      endDate: '2024-11-10',
      status: 'مكتمل',
      category: 'اللغة العربية',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      lastAccessed: '2024-11-10T14:00:00Z',
      timeSpent: '60 ساعة',
      upcomingLessons: 0,
      assignments: 4,
      completedAssignments: 4
    },
    {
      _id: 'course-006',
      title: 'اللغة العربية المتقدمة',
      description: 'دراسة متقدمة في اللغة العربية',
      instructor: 'أ. جميلة السيد',
      progress: 90,
      totalLessons: 24,
      completedLessons: 22,
      duration: '95 ساعة',
      difficulty: 'متقدم',
      rating: 4.8,
      studentsCount: 125,
      startDate: '2024-09-12',
      endDate: '2024-12-25',
      status: 'جاري',
      category: 'اللغة العربية',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      lastAccessed: '2024-10-10T13:15:00Z',
      timeSpent: '42 ساعة',
      upcomingLessons: 2,
      assignments: 9,
      completedAssignments: 7
    }
  ];

  // نتائج اختبارات وهمية - منصة لغة عربية للصفوف العليا
  const demoExamResults = [
    {
      _id: 'exam-001',
      examTitle: 'امتحان النحو والصرف',
      course: 'النحو والصرف',
      studentScore: 48,
      totalScore: 50,
      percentage: 96,
      grade: 'ممتاز',
      examDate: '2024-10-05T09:00:00Z',
      duration: '80 دقيقة',
      questionsCount: 18,
      correctAnswers: 17,
      wrongAnswers: 1,
      timeSpent: '75 دقيقة',
      rank: 2,
      totalStudents: 187,
      averageScore: 36.4,
      highestScore: 49,
      lowestScore: 20
    },
    {
      _id: 'exam-002',
      examTitle: 'امتحان الأدب العربي',
      course: 'الأدب العربي',
      studentScore: 41,
      totalScore: 50,
      percentage: 82,
      grade: 'جيد جداً',
      examDate: '2024-10-03T13:00:00Z',
      duration: '75 دقيقة',
      questionsCount: 16,
      correctAnswers: 14,
      wrongAnswers: 2,
      timeSpent: '70 دقيقة',
      rank: 8,
      totalStudents: 145,
      averageScore: 33.6,
      highestScore: 47,
      lowestScore: 16
    },
    {
      _id: 'exam-003',
      examTitle: 'امتحان التعبير والإنشاء',
      course: 'التعبير والإنشاء',
      studentScore: 39,
      totalScore: 50,
      percentage: 78,
      grade: 'جيد',
      examDate: '2024-09-25T11:00:00Z',
      duration: '90 دقيقة',
      questionsCount: 12,
      correctAnswers: 10,
      wrongAnswers: 2,
      timeSpent: '85 دقيقة',
      rank: 10,
      totalStudents: 98,
      averageScore: 32.5,
      highestScore: 45,
      lowestScore: 15
    },
    {
      _id: 'exam-004',
      examTitle: 'امتحان البلاغة العربية',
      course: 'البلاغة العربية',
      studentScore: 42,
      totalScore: 50,
      percentage: 84,
      grade: 'جيد جداً',
      examDate: '2024-09-20T14:00:00Z',
      duration: '75 دقيقة',
      questionsCount: 16,
      correctAnswers: 14,
      wrongAnswers: 2,
      timeSpent: '70 دقيقة',
      rank: 7,
      totalStudents: 110,
      averageScore: 34.8,
      highestScore: 46,
      lowestScore: 17
    },
    {
      _id: 'exam-005',
      examTitle: 'امتحان اللغة العربية المتقدمة',
      course: 'اللغة العربية المتقدمة',
      studentScore: 45,
      totalScore: 50,
      percentage: 90,
      grade: 'ممتاز',
      examDate: '2024-09-18T10:00:00Z',
      duration: '85 دقيقة',
      questionsCount: 20,
      correctAnswers: 18,
      wrongAnswers: 2,
      timeSpent: '80 دقيقة',
      rank: 4,
      totalStudents: 125,
      averageScore: 36.2,
      highestScore: 48,
      lowestScore: 19
    }
  ];

  // بيانات الرسوم البيانية - منصة لغة عربية للصفوف العليا
  const gradeProgression = [
    { month: 'سبتمبر', grade: 82 },
    { month: 'أكتوبر', grade: 85 },
    { month: 'نوفمبر', grade: 88 },
    { month: 'ديسمبر', grade: 87 }
  ];

  const subjectDistribution = [
    { subject: 'النحو والصرف', score: 96, color: '#F59E0B' },
    { subject: 'الأدب العربي', score: 82, color: '#EF4444' },
    { subject: 'التعبير والإنشاء', score: 78, color: '#8B5CF6' },
    { subject: 'البلاغة العربية', score: 84, color: '#06B6D4' },
    { subject: 'اللغة العربية المتقدمة', score: 90, color: '#10B981' }
  ];

  const completionRates = [
    { name: 'مكتمل', value: 67, color: '#10B981' },
    { name: 'جاري', value: 33, color: '#06B6D4' }
  ];

  // محاكاة تحميل البيانات
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setSelectedChild(demoStudent);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExportReport = () => {
    // محاكاة تصدير التقرير
    alert('تم تصدير التقرير بنجاح! (عرض تجريبي)');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 light:from-gray-50 light:via-white light:to-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-t-4 border-cyan-500 rounded-full mx-auto mb-4"
            ></motion.div>
            <h2 className="text-2xl font-bold mb-2 text-white dark:text-white light:text-gray-800">جاري تحميل البيانات التجريبية...</h2>
            <p className="text-lg text-gray-400 dark:text-gray-400 light:text-gray-600">يرجى الانتظار قليلاً</p>
          </motion.div>
        </div>
      </div>
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
            duration: 30,
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
            duration: 30,
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
            duration: 30,
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
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
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
              y: [0, -20, 0],
              x: [0, Math.random() * 15 - 7.5, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 0.8, 0]
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
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
        <div className="relative w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-cyan-500/12 dark:bg-cyan-500/15 light:bg-cyan-500/6 backdrop-blur-sm text-cyan-400 dark:text-cyan-300 light:text-cyan-600 hover:bg-cyan-500/15 dark:hover:bg-cyan-500/20 light:hover:bg-cyan-500/8 transition-all duration-300 border border-cyan-400/15 dark:border-cyan-400/25 light:border-cyan-600/10 shadow-[0_0_8px_rgba(6,182,212,0.15)] dark:shadow-[0_0_12px_rgba(6,182,212,0.25)] light:shadow-[0_0_6px_rgba(6,182,212,0.1)] hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] light:hover:shadow-[0_0_8px_rgba(6,182,212,0.15)]"
              >
                <ArrowLeft size={18} />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 dark:from-cyan-300 dark:via-blue-300 dark:to-purple-300 light:from-cyan-600 light:via-blue-600 light:to-purple-600 bg-clip-text text-transparent mb-1 drop-shadow-[0_0_4px_rgba(6,182,212,0.25)] dark:drop-shadow-[0_0_6px_rgba(6,182,212,0.35)] light:drop-shadow-[0_0_3px_rgba(6,182,212,0.15)]">
                  عرض تجريبي - درجات {selectedChild?.firstName} {selectedChild?.secondName}
                </h1>
                <p className="text-cyan-300 dark:text-cyan-200 light:text-cyan-700 text-base font-medium">
                  تجربة شاملة لجميع ميزات لوحة تحكم الوالدين
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400 dark:text-emerald-300 light:text-emerald-600 drop-shadow-[0_0_2px_rgba(16,185,129,0.25)] dark:drop-shadow-[0_0_3px_rgba(16,185,129,0.35)] light:drop-shadow-[0_0_1px_rgba(16,185,129,0.15)]" />
                  <span className="text-emerald-300 dark:text-emerald-200 light:text-emerald-700 text-xs font-medium">
                    بيانات تجريبية شاملة
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/12 to-teal-500/12 dark:from-emerald-500/15 dark:to-teal-500/15 light:from-emerald-500/6 light:to-teal-500/6 backdrop-blur-sm text-emerald-400 dark:text-emerald-300 light:text-emerald-600 hover:from-emerald-500/15 hover:to-teal-500/15 dark:hover:from-emerald-500/20 dark:hover:to-teal-500/20 light:hover:from-emerald-500/8 light:hover:to-teal-500/8 transition-all duration-300 border border-emerald-400/15 dark:border-emerald-400/25 light:border-emerald-600/10 shadow-[0_0_8px_rgba(16,185,129,0.15)] dark:shadow-[0_0_12px_rgba(16,185,129,0.25)] light:shadow-[0_0_6px_rgba(16,185,129,0.1)] hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] light:hover:shadow-[0_0_8px_rgba(16,185,129,0.15)]"
              >
                <RefreshCw size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportReport}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/15 to-blue-500/15 dark:from-cyan-500/20 dark:to-blue-500/20 light:from-cyan-500/8 light:to-blue-500/8 backdrop-blur-sm text-cyan-300 dark:text-cyan-200 light:text-cyan-700 hover:from-cyan-500/20 hover:to-blue-500/20 dark:hover:from-cyan-500/25 dark:hover:to-blue-500/25 light:hover:from-cyan-500/12 light:hover:to-blue-500/12 transition-all duration-300 flex items-center gap-2 border border-cyan-400/30 dark:border-cyan-400/40 light:border-cyan-600/20 shadow-[0_0_12px_rgba(6,182,212,0.2)] dark:shadow-[0_0_18px_rgba(6,182,212,0.3)] light:shadow-[0_0_8px_rgba(6,182,212,0.15)] hover:shadow-[0_0_18px_rgba(6,182,212,0.3)] dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] light:hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] text-sm font-medium"
              >
                <Download size={16} />
                تصدير التقرير
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-6 py-8">
        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-orange-500/20 dark:from-amber-500/30 dark:via-yellow-500/35 dark:to-orange-500/30 light:from-amber-500/15 light:via-yellow-500/20 light:to-orange-500/15 backdrop-blur-xl border border-amber-400/40 dark:border-amber-400/60 light:border-amber-600/30 shadow-[0_0_30px_rgba(245,158,11,0.3)] dark:shadow-[0_0_40px_rgba(245,158,11,0.4)] light:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 light:bg-amber-500/15">
              <Eye size={24} className="text-amber-300 dark:text-amber-200 light:text-amber-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-300 dark:text-amber-200 light:text-amber-700 mb-2">
                عرض تجريبي شامل
              </h3>
              <p className="text-amber-200 dark:text-amber-100 light:text-amber-600">
                هذا عرض تجريبي يوضح جميع ميزات لوحة تحكم الوالدين مع بيانات وهمية شاملة. يمكنك تجربة جميع الوظائف والتصفح بحرية.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Student Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-700/15 light:from-cyan-50/30 light:to-blue-100/30 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] dark:hover:shadow-[0_0_80px_rgba(6,182,212,0.6)] light:hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all duration-500"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              {selectedChild?.firstName?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700 mb-2">
                {selectedChild?.firstName} {selectedChild?.secondName} {selectedChild?.lastName}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">رقم الطالب:</span>
                  <span className="text-cyan-200 dark:text-cyan-100 light:text-cyan-600 ml-2">{selectedChild?.studentId}</span>
                </div>
                <div>
                  <span className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">الصف:</span>
                  <span className="text-cyan-200 dark:text-cyan-100 light:text-cyan-600 ml-2">{selectedChild?.grade}</span>
                </div>
                <div>
                  <span className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">المدرسة:</span>
                  <span className="text-cyan-200 dark:text-cyan-100 light:text-cyan-600 ml-2">{selectedChild?.school}</span>
                </div>
                <div>
                  <span className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">تاريخ التسجيل:</span>
                  <span className="text-cyan-200 dark:text-cyan-100 light:text-cyan-600 ml-2">{new Date(selectedChild?.enrollmentDate).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'إجمالي الدورات', value: demoStats.totalCourses, icon: BookOpen, color: 'cyan' },
            { title: 'الدورات المكتملة', value: demoStats.completedCourses, icon: CheckCircle, color: 'emerald' },
            { title: 'متوسط الدرجات', value: `${demoStats.averageGrade}%`, icon: TrendingUp, color: 'blue' },
            { title: 'معدل الحضور', value: `${demoStats.attendanceRate}%`, icon: Calendar, color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-700/15 light:from-cyan-50/30 light:to-blue-100/30 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] dark:hover:shadow-[0_0_80px_rgba(6,182,212,0.6)] light:hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20 dark:bg-${stat.color}-500/30 light:bg-${stat.color}-500/15`}>
                  <stat.icon size={24} className={`text-${stat.color}-300 dark:text-${stat.color}-200 light:text-${stat.color}-700`} />
                </div>
                <span className="text-2xl font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700">
                  {stat.value}
                </span>
              </div>
              <h3 className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                {stat.title}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'الاختبارات الناجحة', value: `${demoStats.examsPassed}/${demoStats.totalExams}`, icon: Award, color: 'emerald' },
            { title: 'أعلى درجة', value: `${demoStats.highestGrade}%`, icon: Star, color: 'yellow' },
            { title: 'ساعات الدراسة', value: `${demoStats.studyHours}`, icon: Clock, color: 'blue' },
            { title: 'الشهادات', value: demoStats.certificatesEarned, icon: GraduationCap, color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-700/15 light:from-cyan-50/30 light:to-blue-100/30 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] dark:hover:shadow-[0_0_80px_rgba(6,182,212,0.6)] light:hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/20 dark:bg-${stat.color}-500/30 light:bg-${stat.color}-500/15`}>
                  <stat.icon size={24} className={`text-${stat.color}-300 dark:text-${stat.color}-200 light:text-${stat.color}-700`} />
                </div>
                <span className="text-2xl font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700">
                  {stat.value}
                </span>
              </div>
              <h3 className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                {stat.title}
              </h3>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-700/15 light:from-cyan-50/30 light:to-blue-100/30 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
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
                  <RechartsLineChart data={gradeProgression}>
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
                  </RechartsLineChart>
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

          {/* Subject Distribution */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-cyan-400 dark:text-cyan-300 light:text-cyan-600 mb-4">
              توزيع درجات المواد
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={subjectDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.2)" />
                  <XAxis dataKey="subject" stroke="rgba(6,182,212,0.6)" />
                  <YAxis stroke="rgba(6,182,212,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(6,182,212,0.3)',
                      borderRadius: '8px',
                      color: '#06B6D4'
                    }} 
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {subjectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Course Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-50/20 to-blue-100/20 dark:from-gray-800/15 dark:to-gray-700/15 light:from-cyan-50/30 light:to-blue-100/30 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        >
          <h3 className="text-xl font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700 mb-6 flex items-center gap-2">
            <BookOpen size={24} />
            ملخص تقدم الدورات
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                className="p-6 rounded-xl bg-gradient-to-br from-slate-800/30 to-gray-900/30 dark:from-slate-800/40 dark:to-gray-900/40 light:from-slate-100/40 light:to-gray-200/40 backdrop-blur-xl border border-slate-600/30 dark:border-slate-600/40 light:border-slate-400/30 shadow-[0_0_20px_rgba(71,85,105,0.2)] dark:shadow-[0_0_30px_rgba(71,85,105,0.3)] light:shadow-[0_0_15px_rgba(71,85,105,0.1)] hover:shadow-[0_0_40px_rgba(71,85,105,0.4)] dark:hover:shadow-[0_0_50px_rgba(71,85,105,0.5)] light:hover:shadow-[0_0_25px_rgba(71,85,105,0.2)] transition-all duration-500"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-cyan-300 dark:text-cyan-200 light:text-cyan-700 mb-1">
                      {course.title}
                    </h4>
                    <p className="text-sm text-cyan-400 dark:text-cyan-300 light:text-cyan-600">
                      {course.instructor}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-cyan-400 dark:text-cyan-300 light:text-cyan-600">التقدم</span>
                    <span className="text-sm font-medium text-cyan-300 dark:text-cyan-200 light:text-cyan-700">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 dark:bg-slate-700/60 light:bg-slate-300/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600">الدروس:</span>
                    <span className="text-cyan-200 dark:text-cyan-100 light:text-cyan-600 ml-1">
                      {course.completedLessons}/{course.totalLessons}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600">المدة:</span>
                    <span className="text-cyan-200 dark:text-cyan-100 light:text-cyan-600 ml-1">
                      {course.duration}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600">التقييم:</span>
                    <span className="text-cyan-200 dark:text-cyan-100 light:text-cyan-600 ml-1">
                      {course.rating} ⭐
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400 dark:text-cyan-300 light:text-cyan-600">الحالة:</span>
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'مكتمل' 
                        ? 'bg-emerald-500/20 text-emerald-300 dark:text-emerald-200 light:text-emerald-700' 
                        : 'bg-cyan-500/20 text-cyan-300 dark:text-cyan-200 light:text-cyan-700'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Exam Results */}
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-400/30 dark:border-cyan-400/40 light:border-cyan-600/20">
                  <th className="text-right py-3 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                    الاختبار
                  </th>
                  <th className="text-right py-3 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                    المادة
                  </th>
                  <th className="text-right py-3 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                    الدرجة
                  </th>
                  <th className="text-right py-3 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                    النسبة
                  </th>
                  <th className="text-right py-3 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                    التقدير
                  </th>
                  <th className="text-right py-3 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                    التاريخ
                  </th>
                  <th className="text-right py-3 px-4 text-cyan-400 dark:text-cyan-300 light:text-cyan-600 font-medium">
                    الترتيب
                  </th>
                </tr>
              </thead>
              <tbody>
                {demoExamResults.map((exam, index) => (
                  <motion.tr
                    key={exam._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                    className="border-b border-cyan-400/20 dark:border-cyan-400/30 light:border-cyan-600/15 hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 light:hover:bg-cyan-500/5 transition-colors duration-300"
                  >
                    <td className="py-3 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600">
                      {exam.examTitle}
                    </td>
                    <td className="py-3 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600">
                      {exam.course}
                    </td>
                    <td className="py-3 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600">
                      {exam.studentScore}/{exam.totalScore}
                    </td>
                    <td className="py-3 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600">
                      {exam.percentage}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        exam.grade === 'ممتاز' 
                          ? 'bg-emerald-500/20 text-emerald-300 dark:text-emerald-200 light:text-emerald-700'
                          : exam.grade === 'جيد جداً'
                          ? 'bg-blue-500/20 text-blue-300 dark:text-blue-200 light:text-blue-700'
                          : 'bg-yellow-500/20 text-yellow-300 dark:text-yellow-200 light:text-yellow-700'
                      }`}>
                        {exam.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600">
                      {new Date(exam.examDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-3 px-4 text-cyan-200 dark:text-cyan-100 light:text-cyan-600">
                      {exam.rank} من {exam.totalStudents}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
          className="text-center p-8 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/25 to-purple-500/20 dark:from-cyan-500/30 dark:via-blue-500/35 dark:to-purple-500/30 light:from-cyan-500/15 light:via-blue-500/20 light:to-purple-500/15 backdrop-blur-xl border border-cyan-400/40 dark:border-cyan-400/60 light:border-cyan-600/30 shadow-[0_0_30px_rgba(6,182,212,0.3)] dark:shadow-[0_0_40px_rgba(6,182,212,0.4)] light:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        >
          <h3 className="text-2xl font-bold text-cyan-300 dark:text-cyan-200 light:text-cyan-700 mb-4">
            هل أعجبك العرض التجريبي؟
          </h3>
          <p className="text-cyan-200 dark:text-cyan-100 light:text-cyan-600 mb-6">
            سجل الآن للحصول على تجربة حقيقية مع بيانات طفلك الفعلية
          </p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-300"
            >
              سجل الآن
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-gray-700 text-white font-semibold shadow-[0_0_20px_rgba(71,85,105,0.4)] hover:shadow-[0_0_30px_rgba(71,85,105,0.6)] transition-all duration-300"
            >
              تسجيل الدخول
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDemo;
