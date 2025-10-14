import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MoreVertical,
  Filter,
  Search,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Star,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  AlertCircle,
  Plus,
  Settings
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const LuxuryAdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    totalRevenue: 0
  });
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await axiosInstance.get('/api/admin/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
      
      // Fetch recent payments
      const paymentsResponse = await axiosInstance.get('/api/admin/payments?limit=10');
      if (paymentsResponse.data.success) {
        setRecentPayments(paymentsResponse.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('خطأ في تحميل البيانات', 'فشل في تحميل بيانات لوحة التحكم من الخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    showSuccess('تم التحديث', 'تم تحديث البيانات بنجاح');
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      const response = await axiosInstance.post(`/api/admin/orders/${paymentId}/approve`);
      
      if (response.data.success) {
        showSuccess('تم الموافقة', 'تم الموافقة على الدفع بنجاح');
        await fetchDashboardData(); // Refresh data
      } else {
        throw new Error(response.data.error || 'Failed to approve payment');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      showError('خطأ في الموافقة', error.response?.data?.error || 'فشل في الموافقة على الدفع');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    try {
      const response = await axiosInstance.post(`/api/admin/orders/${paymentId}/reject`);
      
      if (response.data.success) {
        showSuccess('تم الرفض', 'تم رفض الدفع بنجاح');
        await fetchDashboardData(); // Refresh data
      } else {
        throw new Error(response.data.error || 'Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      showError('خطأ في الرفض', error.response?.data?.error || 'فشل في رفض الدفع');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <LuxuryCard hover={true}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            {title}
          </p>
          <h3 style={{
            color: colors.text,
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            {value}
          </h3>
          {subtitle && (
            <p style={{
              color: colors.textMuted,
              fontSize: typography.fontSize.xs,
              margin: 0
            }}>
              {subtitle}
            </p>
          )}
        </div>
        
        <div style={{
          width: '60px',
          height: '60px',
          background: color,
          borderRadius: borderRadius.full,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.background
        }}>
          <Icon size={24} />
        </div>
      </div>
    </LuxuryCard>
  );

  const PaymentCard = ({ payment }) => (
    <LuxuryCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: colors.accent,
          borderRadius: borderRadius.full,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.background,
          flexShrink: 0
        }}>
          <CreditCard size={20} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            color: colors.text,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            {payment.studentId?.firstName} {payment.studentId?.secondName}
          </h4>
          <p style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.sm,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            {payment.courseId?.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <span style={{
              color: colors.accent,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold
            }}>
              {payment.amount} جنيه
            </span>
            <span style={{
              color: colors.textMuted,
              fontSize: typography.fontSize.xs
            }}>
              {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{
            background: payment.status === 'approved' ? colors.success :
                       payment.status === 'pending' ? colors.warning : colors.error,
            color: colors.background,
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: borderRadius.full,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semibold,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs
          }}>
            {payment.status === 'approved' && <CheckCircle size={12} />}
            {payment.status === 'pending' && <Clock size={12} />}
            {payment.status === 'rejected' && <XCircle size={12} />}
            {payment.status === 'approved' ? 'موافق عليه' :
             payment.status === 'pending' ? 'في الانتظار' : 'مرفوض'}
          </div>
          
          {payment.status === 'pending' && (
            <div style={{ display: 'flex', gap: spacing.xs }}>
              <LuxuryButton
                variant="primary"
                size="sm"
                onClick={() => handleApprovePayment(payment._id)}
              >
                <CheckCircle size={14} />
              </LuxuryButton>
              <LuxuryButton
                variant="secondary"
                size="sm"
                onClick={() => handleRejectPayment(payment._id)}
              >
                <XCircle size={14} />
              </LuxuryButton>
            </div>
          )}
        </div>
      </div>
    </LuxuryCard>
  );

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '60px',
            height: '60px',
            border: `4px solid ${colors.border}`,
            borderTop: `4px solid ${colors.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: colors.textMuted, marginTop: spacing.lg }}>
            جاري تحميل لوحة التحكم...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.gradient,
      padding: spacing.xl 
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['2xl'] }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: spacing.lg 
        }}>
          <div>
            <h1 style={{
              color: colors.text,
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              fontFamily: typography.fontFamily.heading,
              margin: 0,
              marginBottom: spacing.sm,
              background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              لوحة التحكم
            </h1>
            <p style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.lg,
              margin: 0
            }}>
              إدارة النظام والإحصائيات
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <LuxuryButton
              variant="ghost"
              size="md"
              onClick={handleRefresh}
              loading={refreshing}
            >
              <RefreshCw size={16} />
              تحديث
            </LuxuryButton>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: spacing.lg,
        marginBottom: spacing['2xl']
      }}>
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers}
          icon={Users}
          color={colors.info}
          subtitle="مستخدم مسجل"
        />
        <StatCard
          title="إجمالي الدورات"
          value={stats.totalCourses}
          icon={BookOpen}
          color={colors.accent}
          subtitle="دورة متاحة"
        />
        <StatCard
          title="إجمالي المدفوعات"
          value={stats.totalPayments}
          icon={CreditCard}
          color={colors.success}
          subtitle="دفعة مكتملة"
        />
        <StatCard
          title="في انتظار الموافقة"
          value={stats.pendingPayments}
          icon={Clock}
          color={colors.warning}
          subtitle="طلب معلق"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue} جنيه`}
          icon={DollarSign}
          color={colors.accent}
          subtitle="إجمالي المبيعات"
        />
      </div>

      {/* Recent Payments */}
      <LuxuryCard>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: spacing.lg 
        }}>
          <h3 style={{
            color: colors.text,
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            margin: 0
          }}>
            المدفوعات الأخيرة
          </h3>
          
          <LuxuryButton
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/payments')}
          >
            عرض الكل
          </LuxuryButton>
        </div>
        
        {recentPayments && recentPayments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {recentPayments.map((payment) => (
              <PaymentCard key={payment._id} payment={payment} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
            <CreditCard size={48} color={colors.textMuted} style={{ marginBottom: spacing.lg }} />
            <h4 style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.sm }}>
              لا توجد مدفوعات
            </h4>
            <p style={{ color: colors.textMuted, margin: 0 }}>
              لم يتم العثور على أي مدفوعات حتى الآن
            </p>
          </div>
        )}
      </LuxuryCard>

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: spacing.lg,
        marginTop: spacing['2xl']
      }}>
        <LuxuryCard hover={true} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
          <div style={{ textAlign: 'center', padding: spacing.lg }}>
            <Users size={32} color={colors.accent} style={{ marginBottom: spacing.md }} />
            <h4 style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
              إدارة المستخدمين
            </h4>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: typography.fontSize.sm }}>
              عرض وإدارة المستخدمين
            </p>
          </div>
        </LuxuryCard>
        
        <LuxuryCard hover={true} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/courses')}>
          <div style={{ textAlign: 'center', padding: spacing.lg }}>
            <BookOpen size={32} color={colors.accent} style={{ marginBottom: spacing.md }} />
            <h4 style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
              إدارة الدورات
            </h4>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: typography.fontSize.sm }}>
              إضافة وتعديل الدورات
            </p>
          </div>
        </LuxuryCard>
        
        <LuxuryCard hover={true} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/payments')}>
          <div style={{ textAlign: 'center', padding: spacing.lg }}>
            <CreditCard size={32} color={colors.accent} style={{ marginBottom: spacing.md }} />
            <h4 style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
              إدارة المدفوعات
            </h4>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: typography.fontSize.sm }}>
              مراجعة وموافقة المدفوعات
            </p>
          </div>
        </LuxuryCard>
        
        <LuxuryCard hover={true} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/settings')}>
          <div style={{ textAlign: 'center', padding: spacing.lg }}>
            <Settings size={32} color={colors.accent} style={{ marginBottom: spacing.md }} />
            <h4 style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
              الإعدادات
            </h4>
            <p style={{ color: colors.textMuted, margin: 0, fontSize: typography.fontSize.sm }}>
              إعدادات النظام العامة
            </p>
          </div>
        </LuxuryCard>
      </div>

      {/* Add CSS for spin animation */}
      <style jsx="true">{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LuxuryAdminDashboard;
