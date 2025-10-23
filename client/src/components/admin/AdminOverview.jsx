import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Badge from '../ui/badge';
import Button from '../ui/button';
import SimpleChart from './SimpleChart';
import QuickActions from './QuickActions';
import SimpleNotificationCenter from './SimpleNotificationCenter';
import SystemStatus from './SystemStatus';
import DashboardSummary from './DashboardSummary';
import SummaryCards from './SummaryCards';
import MessagesCenter from './MessagesCenter';
import LuxuryTimeFilter from './LuxuryTimeFilter';
import LuxuryStatsGrid from './LuxuryStatsGrid';
import LuxuryChartsGrid from './LuxuryChartsGrid';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/use-toast';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap,
  RefreshCw,
  BarChart3,
  TrendingDown
} from 'lucide-react';

const AdminOverview = ({ analytics, onRefresh, isLoading }) => {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTimePeriodChange = async (period) => {
    setSelectedTimePeriod(period);
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh(period);
      }
      toast({
        title: "تم تحديث البيانات",
        description: `تم تحديث الإحصائيات للفترة المحددة`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث البيانات",
        description: "حدث خطأ أثناء تحديث الإحصائيات",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh(selectedTimePeriod);
      }
      toast({
        title: "تم تحديث البيانات",
        description: "تم تحديث جميع الإحصائيات بنجاح",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "خطأ في تحديث البيانات",
        description: "حدث خطأ أثناء تحديث الإحصائيات",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!analytics && !isLoading) {
    return (
      <div className="space-y-8">
        {/* Time Filter */}
        <LuxuryTimeFilter
          selectedPeriod={selectedTimePeriod}
          onPeriodChange={handleTimePeriodChange}
          isLoading={isRefreshing}
        />
        
        {/* Loading State */}
        <LuxuryStatsGrid analytics={null} isLoading={true} />
      </div>
    );
  }

  // Destructure with safe defaults
  const { 
    users = { total: 0, byGrade: [], byGovernorate: [], byRole: [] },
    courses = { total: 0, byEnrollment: [], topCourses: [], byGrade: [], bySubject: [] },
    payments = { total: 0, pending: 0, confirmed: 0, rejected: 0, revenue: 0, monthlyRevenue: [] },
    activity = { totalViews: 0, watchTime: 0, recentLogs: [] },
    recentPayments = [],
    recentMessages = []
  } = analytics;

  // Calculate percentage changes (mock data for now)
  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Calculate total subscriptions (pending + confirmed)
  const totalSubscriptions = (payments.pending || 0) + (payments.confirmed || 0);

  const kpiCards = [
    {
      title: 'إجمالي الطلاب',
      value: users.total || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'جميع الطلاب المسجلين'
    },
    {
      title: 'إجمالي الدورات',
      value: courses.total || 0,
      change: '+8%',
      changeType: 'positive',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'جميع الدورات المتاحة'
    },
    {
      title: 'إجمالي الاشتراكات',
      value: totalSubscriptions,
      change: '+15%',
      changeType: 'positive',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'الاشتراكات النشطة والمعلقة'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${payments.revenue || 0} ج.م`,
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'من الاشتراكات المؤكدة'
    },
    {
      title: 'إجمالي المشاهدات',
      value: activity.totalViews || 0,
      change: '+18%',
      changeType: 'positive',
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'من جميع الدورات'
    },
    {
      title: 'ساعات المشاهدة',
      value: `${activity.watchTime || 0} ساعة`,
      change: '+25%',
      changeType: 'positive',
      icon: Clock,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'إجمالي الوقت المستغرق'
    }
  ];

  const paymentStatusCards = [
    {
      title: 'في الانتظار',
      value: payments.pending || 0,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'تتطلب مراجعة'
    },
    {
      title: 'مؤكدة',
      value: payments.confirmed || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: `إيرادات: ${payments.revenue || 0} ج.م`
    },
    {
      title: 'مرفوضة',
      value: payments.rejected || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'تم رفضها من قبل الإدارة'
    }
  ];

  const activityCards = [
    {
      title: 'إجمالي المشاهدات',
      value: activity.totalViews || 0,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'من جميع الدورات'
    },
    {
      title: 'وقت المشاهدة',
      value: `${activity.watchTime || 0} ساعة`,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'إجمالي الوقت المستغرق'
    }
  ];

  // Mock data for recent payments (in real app, this would come from backend)
  const mockRecentPayments = [
    { id: 1, student: 'أحمد علي', course: 'الرياضيات أولي إعدادي', amount: 150, status: 'pending', date: '2024-12-20' },
    { id: 2, student: 'فاطمة حسن', course: 'الفيزياء أولي ثانوي', amount: 200, status: 'confirmed', date: '2024-12-19' },
    { id: 3, student: 'عمر خليل', course: 'الكيمياء ثاني ثانوي', amount: 180, status: 'pending', date: '2024-12-18' },
    { id: 4, student: 'سارة محمد', course: 'الأحياء ثالث إعدادي', amount: 160, status: 'confirmed', date: '2024-12-17' },
    { id: 5, student: 'محمد أحمد', course: 'الرياضيات ثاني إعدادي', amount: 140, status: 'pending', date: '2024-12-16' }
  ];

  // Mock data for recent messages (in real app, this would come from backend)
  const mockRecentMessages = [
    { id: 1, student: 'أحمد علي', message: 'هل يمكنني تغيير موعد الاختبار؟', course: 'الرياضيات أولي إعدادي', time: '2024-12-20 14:30' },
    { id: 2, student: 'فاطمة حسن', message: 'محتوى الدرس الثالث غير واضح', course: 'الفيزياء أولي ثانوي', time: '2024-12-19 16:45' },
    { id: 3, student: 'عمر خليل', message: 'أريد إضافة دورة جديدة', course: 'الكيمياء ثاني ثانوي', time: '2024-12-18 10:20' },
    { id: 4, student: 'سارة محمد', message: 'مشكلة في تحميل الفيديو', course: 'الأحياء ثالث إعدادي', time: '2024-12-17 13:15' },
    { id: 5, student: 'محمد أحمد', message: 'استفسار عن الامتحان النهائي', course: 'الرياضيات ثاني إعدادي', time: '2024-12-16 15:30' }
  ];

  const finalRecentPayments = recentPayments.length > 0 ? recentPayments : mockRecentPayments;
  const finalRecentMessages = recentMessages.length > 0 ? recentMessages : mockRecentMessages;

  // Prepare chart data
  const monthlyRevenueData = payments.monthlyRevenue?.map(item => ({
    label: `${item._id.month}/${item._id.year}`,
    value: item.revenue
  })) || [];

  const usersByGradeData = users.byGrade?.map(item => ({
    label: `الصف ${item._id}`,
    value: item.count
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header with Time Filter and Refresh */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
      >
        <div className="flex-1">
          <LuxuryTimeFilter
            selectedPeriod={selectedTimePeriod}
            onPeriodChange={handleTimePeriodChange}
            isLoading={isRefreshing || isLoading}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className={`
            flex items-center space-x-3 px-6 py-4 rounded-2xl
            transition-all duration-300 ease-out
            ${isDark 
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
              : 'bg-white border-gray-200 hover:bg-gray-50'
            }
            border-2 shadow-lg hover:shadow-xl
            ${isRefreshing || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
          >
            <RefreshCw className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </motion.div>
          <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            تحديث البيانات
          </span>
        </motion.button>
      </motion.div>

      {/* Luxury Statistics Grid */}
      <LuxuryStatsGrid 
        analytics={analytics} 
        isLoading={isLoading || isRefreshing}
        timePeriod={selectedTimePeriod}
      />

      {/* Luxury Charts Grid */}
      <LuxuryChartsGrid 
        analytics={analytics} 
        isLoading={isLoading || isRefreshing}
        timePeriod={selectedTimePeriod}
      />

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentStatusCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className={`border-l-4 ${card.borderColor} hover:shadow-lg transition-shadow duration-200`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {card.value}
                </div>
                <div className="text-xs text-gray-500">
                  {card.description}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payment Requests */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              آخر طلبات الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finalRecentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === 'confirmed' ? 'bg-green-500' : 
                      payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-sm">{payment.student}</div>
                      <div className="text-xs text-gray-500">{payment.course}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{payment.amount} ج.م</div>
                    <div className="text-xs text-gray-500">{payment.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                عرض جميع المدفوعات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              الرسائل الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finalRecentMessages.map((message) => (
                <div key={message.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{message.student}</div>
                      <div className="text-xs text-gray-500 mb-1">{message.course}</div>
                      <div className="text-xs text-gray-700 line-clamp-2">{message.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{message.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                عرض جميع الرسائل
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activityCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {card.value}
                </div>
                <div className="text-xs text-gray-500">
                  {card.description}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-6 h-24 hover:bg-blue-50 hover:border-blue-300 transition-colors">
              <Users className="h-8 w-8 mb-2 text-blue-600" />
              <span className="text-sm font-medium">إضافة طالب جديد</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-24 hover:bg-green-50 hover:border-green-300 transition-colors">
              <BookOpen className="h-8 w-8 mb-2 text-green-600" />
              <span className="text-sm font-medium">إنشاء دورة جديدة</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-24 hover:bg-purple-50 hover:border-purple-300 transition-colors">
              <CreditCard className="h-8 w-8 mb-2 text-purple-600" />
              <span className="text-sm font-medium">مراجعة المدفوعات</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-24 hover:bg-orange-50 hover:border-orange-300 transition-colors">
              <TrendingUp className="h-8 w-8 mb-2 text-orange-600" />
              <span className="text-sm font-medium">عرض التقارير</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <SimpleChart
          title="نمو الإيرادات الشهري"
          data={monthlyRevenueData}
          type="bar"
          height="h-64"
        />

        {/* Users by Grade Chart */}
        <SimpleChart
          title="الطلاب حسب الصف"
          data={usersByGradeData}
          type="bar"
          height="h-64"
        />
      </div>

      {/* Recent Activity & Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.recentLogs && activity.recentLogs.length > 0 ? (
                activity.recentLogs.map((log, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{log.action}</div>
                      <div className="text-xs text-gray-500">
                        {log.course || log.user} • {log.time ? new Date(log.time).toLocaleDateString('ar-EG') : 'الآن'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  لا توجد أنشطة حديثة
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Courses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              أفضل الدورات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.topCourses && courses.topCourses.length > 0 ? (
                courses.topCourses.map((course, index) => (
                  <div key={course._id || index} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium text-sm">{course.title || 'دورة غير معروفة'}</div>
                        <div className="text-xs text-gray-500">
                          {course.subject || 'مادة غير محددة'} • {course.grade || 'صف غير محدد'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{course.price || 0} ج.م</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  لا توجد دورات متاحة
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
