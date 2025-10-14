import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Activity,
  Clock,
  Target,
  Star,
  BarChart3,
  PieChart,
  RefreshCw,
  MessageSquare,
  Users,
  Eye,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Zap,
  Trophy,
  GraduationCap,
  FileText,
  Video,
  PlayCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';

const StudentGroupProfile = () => {
  const { groupId, studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  
  // State management
  const [student, setStudent] = useState(null);
  const [group, setGroup] = useState(null);
  const [studentStats, setStudentStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    averageScore: 0,
    totalStudyTime: 0,
    lastActivity: null,
    recentExams: [],
    courseProgress: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (groupId && studentId) {
      fetchStudentData();
    }
  }, [groupId, studentId]);

  const fetchStudentData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch group details
      const groupResponse = await axiosInstance.get(`/api/groups/admin/groups/${groupId}`);
      if (groupResponse.data.success) {
        setGroup(groupResponse.data.data);
        
        // Find the specific student in the group
        const foundStudent = groupResponse.data.data.students.find(s => s._id === studentId);
        if (foundStudent) {
          setStudent(foundStudent);
          
          // Generate mock stats for demonstration
          generateMockStats(foundStudent);
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateMockStats = (studentData) => {
    // Mock data for demonstration - in real app, this would come from API
    const mockStats = {
      totalCourses: Math.floor(Math.random() * 8) + 3,
      completedCourses: Math.floor(Math.random() * 3) + 1,
      inProgressCourses: Math.floor(Math.random() * 4) + 1,
      averageScore: Math.floor(Math.random() * 30) + 70,
      totalStudyTime: Math.floor(Math.random() * 200) + 50,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      recentExams: [
        { course: 'الرياضيات', score: 85, date: '2024-01-15', status: 'completed' },
        { course: 'العلوم', score: 92, date: '2024-01-12', status: 'completed' },
        { course: 'اللغة العربية', score: 78, date: '2024-01-10', status: 'completed' },
        { course: 'التاريخ', score: 88, date: '2024-01-08', status: 'completed' }
      ],
      courseProgress: [
        { course: 'الرياضيات', progress: 85, totalLessons: 20, completedLessons: 17 },
        { course: 'العلوم', progress: 92, totalLessons: 15, completedLessons: 14 },
        { course: 'اللغة العربية', progress: 78, totalLessons: 25, completedLessons: 20 },
        { course: 'التاريخ', progress: 88, totalLessons: 18, completedLessons: 16 },
        { course: 'اللغة الإنجليزية', progress: 65, totalLessons: 22, completedLessons: 14 }
      ]
    };
    
    setStudentStats(mockStats);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعة ${mins} دقيقة`;
  };

  // Chart data
  const progressData = studentStats.courseProgress.map(course => ({
    name: course.course,
    progress: course.progress,
    lessons: course.completedLessons,
    total: course.totalLessons
  }));

  const examData = studentStats.recentExams.map(exam => ({
    name: exam.course,
    score: exam.score,
    date: exam.date
  }));

  const pieData = [
    { name: 'مكتمل', value: studentStats.completedCourses, color: '#10B981' },
    { name: 'جاري', value: studentStats.inProgressCourses, color: '#F97316' },
    { name: 'لم يبدأ', value: studentStats.totalCourses - studentStats.completedCourses - studentStats.inProgressCourses, color: '#6B7280' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={32} className="text-[#F97316]" />
        </motion.div>
      </div>
    );
  }

  if (!student || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>الطالب غير موجود</h2>
          <p style={{ color: colors.textSecondary }}>لا يمكن العثور على بيانات الطالب المطلوبة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/admin/groups/${groupId}`)}
            className="p-3 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              ملف الطالب - {student.firstName} {student.secondName}
            </h1>
            <p className="text-lg" style={{ color: colors.textSecondary }}>
              في مجموعة {group.name}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchStudentData}
            disabled={refreshing}
            className="p-3 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text
            }}
          >
            <RefreshCw 
              size={20} 
              className={`transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Student Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <div className="p-8 rounded-2xl border shadow-xl" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Student Avatar and Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="w-32 h-32 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-lg">
                {student.firstName.charAt(0)}{student.secondName.charAt(0)}
              </div>
              
              <div className="text-center lg:text-right">
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                  {student.firstName} {student.secondName}
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                    <Mail size={16} />
                    <span>{student.userEmail}</span>
                  </div>
                  {student.parentPhone && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                      <Phone size={16} />
                      <span>{student.parentPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.background }}>
                <div className="p-3 bg-[#F97316]/20 rounded-xl w-fit mx-auto mb-3">
                  <BookOpen className="text-[#F97316]" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
                  {studentStats.totalCourses}
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  إجمالي الدورات
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.background }}>
                <div className="p-3 bg-[#10B981]/20 rounded-xl w-fit mx-auto mb-3">
                  <CheckCircle className="text-[#10B981]" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
                  {studentStats.completedCourses}
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  دورات مكتملة
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.background }}>
                <div className="p-3 bg-[#3B82F6]/20 rounded-xl w-fit mx-auto mb-3">
                  <Award className="text-[#3B82F6]" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
                  {studentStats.averageScore}%
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  متوسط الدرجات
                </p>
              </div>
              
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: colors.background }}>
                <div className="p-3 bg-[#F59E0B]/20 rounded-xl w-fit mx-auto mb-3">
                  <Clock className="text-[#F59E0B]" size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: colors.text }}>
                  {formatDuration(studentStats.totalStudyTime)}
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  وقت الدراسة
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex gap-2 border-b" style={{ borderColor: colors.border }}>
          {[
            { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { id: 'courses', label: 'الدورات', icon: BookOpen },
            { id: 'exams', label: 'الامتحانات', icon: Award },
            { id: 'activity', label: 'النشاط', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-300 relative ${
                  isActive ? 'text-[#F97316]' : 'text-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
                {tab.label}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Progress Chart */}
            <div className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
                تقدم الدورات
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#F9731620" : "#F9731640"} />
                  <XAxis 
                    dataKey="name" 
                    stroke={isDarkMode ? "#a0a0a0" : "#6b7280"}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={isDarkMode ? "#a0a0a0" : "#6b7280"}
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#F9731640' : '#F9731660'}`,
                      borderRadius: '12px',
                      color: isDarkMode ? '#ffffff' : '#1a1a2e'
                    }}
                  />
                  <Bar dataKey="progress" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Course Distribution */}
            <div className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: colors.text }}>
                توزيع الدورات
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#F9731640' : '#F9731660'}`,
                      borderRadius: '12px',
                      color: isDarkMode ? '#ffffff' : '#1a1a2e'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm" style={{ color: colors.textSecondary }}>
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
              الدورات المسجلة
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studentStats.courseProgress.map((course, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#F97316]/20 rounded-lg">
                        <BookOpen className="text-[#F97316]" size={20} />
                      </div>
                      <h4 className="font-bold" style={{ color: colors.text }}>
                        {course.course}
                      </h4>
                    </div>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ 
                      backgroundColor: course.progress >= 80 ? '#10B98120' : course.progress >= 60 ? '#F9731620' : '#EF444420',
                      color: course.progress >= 80 ? '#10B981' : course.progress >= 60 ? '#F97316' : '#EF4444'
                    }}>
                      {course.progress}%
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2" style={{ color: colors.textSecondary }}>
                      <span>التقدم</span>
                      <span>{course.completedLessons} / {course.totalLessons} درس</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${course.progress}%`,
                          background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                    <Clock size={14} />
                    <span>آخر نشاط: منذ {Math.floor(Math.random() * 7) + 1} أيام</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
              نتائج الامتحانات
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Exam Results List */}
              <div className="space-y-4">
                {studentStats.recentExams.map((exam, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 rounded-xl border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold" style={{ color: colors.text }}>
                          {exam.course}
                        </h4>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {formatDate(exam.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          exam.score >= 80 ? 'text-[#10B981]' : 
                          exam.score >= 60 ? 'text-[#F97316]' : 'text-[#EF4444]'
                        }`}>
                          {exam.score}%
                        </div>
                        <div className="flex items-center gap-1">
                          {exam.score >= 80 ? (
                            <CheckCircle size={16} className="text-[#10B981]" />
                          ) : exam.score >= 60 ? (
                            <AlertCircle size={16} className="text-[#F97316]" />
                          ) : (
                            <XCircle size={16} className="text-[#EF4444]" />
                          )}
                          <span className="text-xs" style={{ color: colors.textSecondary }}>
                            {exam.status === 'completed' ? 'مكتمل' : 'قيد المراجعة'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Exam Performance Chart */}
              <div className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                <h4 className="text-lg font-bold mb-6" style={{ color: colors.text }}>
                  أداء الامتحانات
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={examData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#F9731620" : "#F9731640"} />
                    <XAxis 
                      dataKey="name" 
                      stroke={isDarkMode ? "#a0a0a0" : "#6b7280"}
                      fontSize={12}
                    />
                    <YAxis 
                      stroke={isDarkMode ? "#a0a0a0" : "#6b7280"}
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#F9731640' : '#F9731660'}`,
                        borderRadius: '12px',
                        color: isDarkMode ? '#ffffff' : '#1a1a2e'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#F97316" 
                      strokeWidth={3}
                      dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
              النشاط الأخير
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Stats */}
              <div className="lg:col-span-2 space-y-4">
                {[
                  { icon: BookOpen, label: 'آخر دورة تم الوصول إليها', value: 'الرياضيات المتقدمة', time: 'منذ ساعتين' },
                  { icon: Video, label: 'آخر فيديو تم مشاهدته', value: 'الكسور العشرية', time: 'منذ 3 ساعات' },
                  { icon: FileText, label: 'آخر امتحان تم إجراؤه', value: 'امتحان العلوم', time: 'منذ يومين' },
                  { icon: MessageSquare, label: 'آخر نشاط في المجموعة', value: 'مشاركة في المناقشة', time: 'منذ 4 أيام' }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-4 rounded-xl border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#F97316]/20 rounded-lg">
                        <activity.icon className="text-[#F97316]" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold" style={{ color: colors.text }}>
                          {activity.value}
                        </h4>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {activity.label}
                        </p>
                      </div>
                      <div className="text-sm" style={{ color: colors.textMuted }}>
                        {activity.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Activity Summary */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                  <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                    ملخص النشاط
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>ساعات الدراسة هذا الأسبوع</span>
                      <span className="font-bold" style={{ color: colors.text }}>24 ساعة</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>الدورات المكتملة</span>
                      <span className="font-bold" style={{ color: colors.text }}>{studentStats.completedCourses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>الامتحانات المنجزة</span>
                      <span className="font-bold" style={{ color: colors.text }}>{studentStats.recentExams.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: colors.textSecondary }}>متوسط الدرجات</span>
                      <span className="font-bold" style={{ color: colors.text }}>{studentStats.averageScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border shadow-lg" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                  <h4 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
                    الإنجازات
                  </h4>
                  <div className="space-y-3">
                    {[
                      { icon: Trophy, label: 'طالب متفوق', description: 'متوسط درجات أعلى من 85%' },
                      { icon: Star, label: 'مثابر', description: 'أكمل 5 دورات' },
                      { icon: Zap, label: 'نشط', description: 'درس لأكثر من 20 ساعة' }
                    ].map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="p-2 bg-[#F97316]/20 rounded-lg">
                          <achievement.icon className="text-[#F97316]" size={16} />
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm" style={{ color: colors.text }}>
                            {achievement.label}
                          </h5>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentGroupProfile;
