import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
  User,
  BookOpen,
  Calendar,
  FileText,
  Image,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Star,
  MoreVertical,
  ExternalLink,
  Crown,
  Zap,
  Shield,
  Target,
  Gem,
  Sparkles,
  Maximize2,
  ZoomIn,
  Download as DownloadIcon,
  Copy,
  Share2
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import { getImageUrlSafe } from '../../utils/imageUtils';

const PaymentManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;
  
  // State management
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Statistics
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    rejectedPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/payments');
      if (response.data.success) {
        setPayments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      const response = await axiosInstance.post(`/api/admin/orders/${paymentId}/approve`);
      if (response.data.success) {
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/payment-proofs/${paymentId}/reject`, {
        reason: reason
      });
      if (response.data.success) {
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId?.secondName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId?.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    const matchesDate = filterDate === 'all' || 
      (filterDate === 'today' && isToday(payment.createdAt)) ||
      (filterDate === 'week' && isThisWeek(payment.createdAt)) ||
      (filterDate === 'month' && isThisMonth(payment.createdAt));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDate]);

  const isToday = (date) => {
    const today = new Date();
    const paymentDate = new Date(date);
    return paymentDate.toDateString() === today.toDateString();
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const paymentDate = new Date(date);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return paymentDate >= weekAgo;
  };

  const isThisMonth = (date) => {
    const today = new Date();
    const paymentDate = new Date(date);
    return paymentDate.getMonth() === today.getMonth() && 
           paymentDate.getFullYear() === today.getFullYear();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} color={colors.success} />;
      case 'pending':
        return <Clock size={16} color={colors.warning} />;
      case 'rejected':
        return <XCircle size={16} color={colors.error} />;
      default:
        return <AlertCircle size={16} color={colors.textMuted} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'rejected':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'معتمد';
      case 'pending':
        return 'معلق';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'غير محدد';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
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

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const downloadImage = (imageUrl, fileName) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || 'payment-proof.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyImageUrl = (imageUrl) => {
    navigator.clipboard.writeText(imageUrl);
    // You can add a toast notification here
  };

  const exportPayments = () => {
    console.log('🔄 بدء تصدير البيانات...');
    console.log('📊 عدد المدفوعات:', filteredPayments.length);
    
    try {
      // Prepare data for export
      const exportData = filteredPayments.map(payment => ({
        'اسم الطالب': `${payment.studentId?.firstName || ''} ${payment.studentId?.secondName || ''}`,
        'البريد الإلكتروني': payment.studentId?.userEmail || '',
        'عنوان الدورة': payment.courseId?.title || '',
        'المادة': payment.courseId?.subject || '',
        'الصف': payment.courseId?.grade || '',
        'المبلغ': payment.amount,
        'الحالة': getStatusText(payment.status),
        'تاريخ الطلب': formatDate(payment.createdAt),
        'تاريخ الاعتماد': payment.approvedAt ? formatDate(payment.approvedAt) : '',
        'إثبات الدفع': payment.screenshot ? 'متوفر' : 'غير متوفر'
      }));

      console.log('📋 البيانات المحضرة:', exportData);

      if (exportData.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
      }

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      console.log('📄 محتوى CSV:', csvContent);

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `مدفوعات_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      console.log('✅ تم تصدير البيانات بنجاح');
      alert('تم تصدير البيانات بنجاح!');
      
    } catch (error) {
      console.error('❌ خطأ في تصدير البيانات:', error);
      alert('حدث خطأ في تصدير البيانات: ' + error.message);
    }
  };

  const exportToExcel = () => {
    console.log('🔄 بدء تصدير البيانات إلى Excel...');
    console.log('📊 عدد المدفوعات:', filteredPayments.length);
    
    try {
      // Prepare data for export
      const exportData = filteredPayments.map(payment => ({
        'اسم الطالب': `${payment.studentId?.firstName || ''} ${payment.studentId?.secondName || ''}`,
        'البريد الإلكتروني': payment.studentId?.userEmail || '',
        'عنوان الدورة': payment.courseId?.title || '',
        'المادة': payment.courseId?.subject || '',
        'الصف': payment.courseId?.grade || '',
        'المبلغ': payment.amount,
        'الحالة': getStatusText(payment.status),
        'تاريخ الطلب': formatDate(payment.createdAt),
        'تاريخ الاعتماد': payment.approvedAt ? formatDate(payment.approvedAt) : '',
        'إثبات الدفع': payment.screenshot ? 'متوفر' : 'غير متوفر'
      }));

      console.log('📋 البيانات المحضرة:', exportData);

      if (exportData.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
      }

      // Convert to Excel format (HTML table)
      const headers = Object.keys(exportData[0]);
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
              th { background-color: #f2f2f2; font-weight: bold; }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <tr>
                  ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${exportData.map(row => 
                  `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`
                ).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      console.log('📄 محتوى HTML:', htmlContent);

      // Create and download file
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `مدفوعات_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ تم تصدير البيانات إلى Excel بنجاح');
      alert('تم تصدير البيانات إلى Excel بنجاح!');
      
    } catch (error) {
      console.error('❌ خطأ في تصدير البيانات إلى Excel:', error);
      alert('حدث خطأ في تصدير البيانات إلى Excel: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CreditCard size={32} color={colors.accent} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden mb-8" style={{
        background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}05)`,
        borderRadius: borderRadius.xl,
        border: `2px solid ${colors.border}30`
      }}>
        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <Crown size={32} color={colors.accent} />
        </div>
        <div className="absolute bottom-4 left-4 opacity-15">
          <Gem size={24} color={colors.accent} />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
          <Sparkles size={48} color={colors.accent} />
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl" style={{
                background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                border: `2px solid ${colors.accent}30`,
                boxShadow: `0 8px 25px ${colors.accent}20`
              }}>
                <CreditCard size={32} color={colors.accent} />
              </div>
        <div>
                <h1 className="text-4xl lg:text-6xl font-bold mb-3" style={{ 
            color: colors.text,
                  background: `linear-gradient(135deg, ${colors.text}, ${colors.accent})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  إدارة المدفوعات المتقدمة
          </h1>
                <p className="text-xl font-medium" style={{ color: colors.textMuted }}>
                  مراجعة وإدارة جميع المدفوعات والاشتراكات مع عرض إثباتات الدفع
                </p>
              </div>
        </div>
        
            <div className="flex items-center gap-4">
          <LuxuryButton
            variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                className="flex items-center gap-2"
              >
                {viewMode === 'grid' ? <BarChart3 size={16} /> : <Target size={16} />}
                {viewMode === 'grid' ? 'عرض الجدول' : 'عرض البطاقات'}
              </LuxuryButton>
              
              <LuxuryButton
                variant="outline"
                onClick={() => {
                  console.log('🧪 اختبار زر التصدير');
                  alert('زر التصدير يعمل!');
                }}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                اختبار التصدير
              </LuxuryButton>
              
              <LuxuryButton
                variant="outline"
                onClick={exportPayments}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                تصدير CSV
              </LuxuryButton>
              
              <LuxuryButton
                variant="outline"
                onClick={exportToExcel}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                تصدير Excel
          </LuxuryButton>
          
          <LuxuryButton
            variant="primary"
            onClick={fetchPayments}
                className="flex items-center gap-2"
          >
                <RefreshCw size={16} />
                تحديث البيانات
          </LuxuryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <LuxuryCard className="h-full overflow-hidden hover:shadow-2xl transition-all duration-500" style={{
            background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
            border: `2px solid ${colors.border}60`,
            boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)`,
            backdropFilter: 'blur(20px)',
            borderRadius: borderRadius.xl
          }}>
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                border: `2px solid ${colors.accent}30`,
                boxShadow: `0 8px 25px ${colors.accent}20`
              }}>
                <CreditCard size={24} color={colors.accent} />
              </div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              {stats.totalPayments}
            </h3>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                إجمالي المدفوعات
              </p>
          </div>
        </LuxuryCard>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <LuxuryCard className="h-full overflow-hidden hover:shadow-2xl transition-all duration-500" style={{
            background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
            border: `2px solid ${colors.border}60`,
            boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)`,
            backdropFilter: 'blur(20px)',
            borderRadius: borderRadius.xl
          }}>
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                background: `linear-gradient(135deg, ${colors.warning}25, ${colors.warning}15)`,
                border: `2px solid ${colors.warning}30`,
                boxShadow: `0 8px 25px ${colors.warning}20`
              }}>
                <Clock size={24} color={colors.warning} />
              </div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              {stats.pendingPayments}
            </h3>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                مدفوعات معلقة
              </p>
          </div>
        </LuxuryCard>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <LuxuryCard className="h-full overflow-hidden hover:shadow-2xl transition-all duration-500" style={{
            background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
            border: `2px solid ${colors.border}60`,
            boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)`,
            backdropFilter: 'blur(20px)',
            borderRadius: borderRadius.xl
          }}>
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                background: `linear-gradient(135deg, ${colors.success}25, ${colors.success}15)`,
                border: `2px solid ${colors.success}30`,
                boxShadow: `0 8px 25px ${colors.success}20`
              }}>
                <CheckCircle size={24} color={colors.success} />
              </div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              {stats.approvedPayments}
            </h3>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                مدفوعات معتمدة
              </p>
          </div>
        </LuxuryCard>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <LuxuryCard className="h-full overflow-hidden hover:shadow-2xl transition-all duration-500" style={{
            background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
            border: `2px solid ${colors.border}60`,
            boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)`,
            backdropFilter: 'blur(20px)',
            borderRadius: borderRadius.xl
          }}>
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                border: `2px solid ${colors.accent}30`,
                boxShadow: `0 8px 25px ${colors.accent}20`
              }}>
                <DollarSign size={24} color={colors.accent} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              {formatCurrency(stats.totalRevenue)}
            </h3>
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                إجمالي الإيرادات
              </p>
          </div>
        </LuxuryCard>
        </motion.div>
      </div>

      {/* Enhanced Filters Section */}
      <LuxuryCard className="mb-8 overflow-hidden" style={{
        background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
        border: `2px solid ${colors.border}60`,
        boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)`,
        backdropFilter: 'blur(20px)',
        borderRadius: borderRadius.xl
      }}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{
              background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
              border: `2px solid ${colors.accent}30`
            }}>
              <Search size={20} color={colors.accent} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: colors.text }}>
              البحث والتصفية المتقدمة
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
              <input
                type="text"
                placeholder="البحث في المدفوعات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:scale-105"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  fontSize: typography.fontSize.sm,
                  focusRingColor: colors.accent
                }}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:scale-105"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                fontSize: typography.fontSize.sm,
                focusRingColor: colors.accent
              }}
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">معلق</option>
              <option value="approved">معتمد</option>
              <option value="rejected">مرفوض</option>
            </select>
            
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:scale-105"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                fontSize: typography.fontSize.sm,
                focusRingColor: colors.accent
              }}
            >
              <option value="all">جميع التواريخ</option>
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <LuxuryButton
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterDate('all');
              }}
              className="flex items-center gap-2"
            >
              <X size={14} />
              مسح الفلاتر
            </LuxuryButton>
            
            <LuxuryButton
              variant="outline"
              size="sm"
              onClick={exportFilteredResults}
              className="flex items-center gap-2"
            >
              <Download size={14} />
              تصدير النتائج
            </LuxuryButton>
          </div>
        </div>
      </LuxuryCard>

      {/* Payments Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPayments.map((payment, index) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <LuxuryCard className="h-full overflow-hidden" style={{
                background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
                border: `2px solid ${colors.border}60`,
                boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)`,
                backdropFilter: 'blur(20px)',
                borderRadius: borderRadius.xl
              }}>
                {/* Payment Proof Image */}
                {payment.screenshot && (
                  <div className="relative overflow-hidden" style={{
                    height: '200px',
                    background: `url(${getImageUrlSafe(payment.screenshot)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`
                  }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-2 rounded-lg text-sm font-bold" style={{
                        backgroundColor: getStatusColor(payment.status) + '25',
                        color: getStatusColor(payment.status),
                        border: `2px solid ${getStatusColor(payment.status)}40`,
                        boxShadow: `0 4px 15px ${getStatusColor(payment.status)}20`,
                        backdropFilter: 'blur(10px)'
                      }}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                    
                    {/* Action Buttons Overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex gap-2">
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          className="p-2 hover:scale-110 transition-transform duration-200 active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageModal(getImageUrlSafe(payment.screenshot));
                          }}
                          style={{
                            backgroundColor: colors.surfaceCard + 'CC',
                            backdropFilter: 'blur(15px)',
                            border: `2px solid ${colors.border}40`,
                            borderRadius: borderRadius.lg,
                            boxShadow: `0 8px 25px ${colors.shadow}20`
                          }}
                        >
                          <ZoomIn size={16} color={colors.text} />
                        </LuxuryButton>
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          className="p-2 hover:scale-110 transition-transform duration-200 active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(getImageUrlSafe(payment.screenshot), `payment-proof-${payment._id}.jpg`);
                          }}
                          style={{
                            backgroundColor: colors.surfaceCard + 'CC',
                            backdropFilter: 'blur(15px)',
                            border: `2px solid ${colors.border}40`,
                            borderRadius: borderRadius.lg,
                            boxShadow: `0 8px 25px ${colors.shadow}20`
                          }}
                        >
                          <DownloadIcon size={16} color={colors.text} />
                        </LuxuryButton>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Payment Content */}
                <div className="p-6">
                  {/* Student Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: colors.accent + '20',
                      border: `2px solid ${colors.accent}30`
                    }}>
                      <User size={20} color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                        {payment.studentId?.firstName} {payment.studentId?.secondName}
                      </h3>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        {payment.studentId?.userEmail}
                      </p>
                    </div>
                  </div>
                  
                  {/* Course Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen size={16} color={colors.info} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.text }}>
                        {payment.courseId?.title || 'غير محدد'}
                      </p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        {payment.courseId?.subject || 'غير محدد'} • الصف {payment.courseId?.grade || 'غير محدد'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment Amount */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} color={colors.success} />
                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                        المبلغ
                      </span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: colors.success }}>
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar size={14} color={colors.textMuted} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <LuxuryButton
                      variant="outline"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPayment(payment);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Eye size={14} />
                      تفاصيل
                    </LuxuryButton>
                    
                    {payment.status === 'pending' && (
                      <>
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprovePayment(payment._id);
                          }}
                          style={{ 
                            color: colors.success, 
                            borderColor: colors.success,
                            backgroundColor: colors.success + '10'
                          }}
                        >
                          <Check size={14} />
                          اعتماد
                        </LuxuryButton>
                        
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectPayment(payment._id, 'مرفوض من قبل المدير');
                          }}
                          style={{ 
                            color: colors.error, 
                            borderColor: colors.error,
                            backgroundColor: colors.error + '10'
                          }}
                        >
                          <X size={14} />
                          رفض
                        </LuxuryButton>
                      </>
                    )}
                  </div>
                </div>
              </LuxuryCard>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <LuxuryCard className="hidden lg:block overflow-hidden" style={{
          background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
          border: `2px solid ${colors.border}60`,
          boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)`,
          backdropFilter: 'blur(20px)',
          borderRadius: borderRadius.xl
        }}>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: colors.border }}>
                    <th className="text-right p-4 text-sm font-semibold" style={{ color: colors.text }}>
                    الطالب
                  </th>
                    <th className="text-right p-4 text-sm font-semibold" style={{ color: colors.text }}>
                    الدورة
                  </th>
                    <th className="text-right p-4 text-sm font-semibold" style={{ color: colors.text }}>
                    المبلغ
                  </th>
                    <th className="text-right p-4 text-sm font-semibold" style={{ color: colors.text }}>
                    الحالة
                  </th>
                    <th className="text-right p-4 text-sm font-semibold" style={{ color: colors.text }}>
                    التاريخ
                  </th>
                    <th className="text-center p-4 text-sm font-semibold" style={{ color: colors.text }}>
                      إثبات الدفع
                    </th>
                    <th className="text-center p-4 text-sm font-semibold" style={{ color: colors.text }}>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => (
                    <tr key={payment._id} className="border-b" style={{ 
                      borderColor: colors.border,
                      backgroundColor: 'transparent'
                    }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                            backgroundColor: colors.accent + '20'
                        }}>
                          <User size={20} color={colors.accent} />
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: colors.text }}>
                            {payment.studentId?.firstName} {payment.studentId?.secondName}
                          </p>
                            <p className="text-xs" style={{ color: colors.textMuted }}>
                            {payment.studentId?.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                        <BookOpen size={16} color={colors.info} />
                          <span className="text-sm" style={{ color: colors.text }}>
                          {payment.courseId?.title || 'غير محدد'}
                        </span>
                      </div>
                    </td>
                    
                      <td className="p-4">
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                          <span className="text-sm font-medium" style={{ color: getStatusColor(payment.status) }}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </td>
                    
                      <td className="p-4">
                        <span className="text-sm" style={{ color: colors.textMuted }}>
                        {formatDate(payment.createdAt)}
                      </span>
                    </td>
                    
                      <td className="p-4 text-center">
                        {payment.screenshot ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                              style={{
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = colors.accent + '20';
                                e.target.style.borderColor = colors.accent;
                                e.target.style.color = colors.accent;
                                e.target.style.transform = 'scale(1.1)';
                                e.target.style.boxShadow = `0 8px 25px ${colors.accent}30`;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = colors.surface;
                                e.target.style.borderColor = colors.border;
                                e.target.style.color = colors.text;
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                openImageModal(getImageUrlSafe(payment.screenshot));
                              }}
                              title="عرض الصورة"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                              style={{
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.text
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = colors.success + '20';
                                e.target.style.borderColor = colors.success;
                                e.target.style.color = colors.success;
                                e.target.style.transform = 'scale(1.1)';
                                e.target.style.boxShadow = `0 8px 25px ${colors.success}30`;
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = colors.surface;
                                e.target.style.borderColor = colors.border;
                                e.target.style.color = colors.text;
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(getImageUrlSafe(payment.screenshot), `payment-proof-${payment._id}.jpg`);
                              }}
                              title="تحميل الصورة"
                            >
                              <DownloadIcon size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: colors.textMuted }}>
                            غير متوفر
                          </span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex gap-1 justify-center">
                          <button
                            className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                            style={{
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                              color: colors.text
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = colors.accent + '20';
                              e.target.style.borderColor = colors.accent;
                              e.target.style.color = colors.accent;
                              e.target.style.transform = 'scale(1.1)';
                              e.target.style.boxShadow = `0 8px 25px ${colors.accent}30`;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = colors.surface;
                              e.target.style.borderColor = colors.border;
                              e.target.style.color = colors.text;
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = 'none';
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            setSelectedPayment(payment);
                            setShowDetailsModal(true);
                          }}
                            title="عرض التفاصيل"
                        >
                          <Eye size={16} />
                          </button>
                        
                        {payment.status === 'pending' && (
                          <>
                              <button
                                className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                                style={{
                                  backgroundColor: colors.success + '10',
                                  borderColor: colors.success,
                                  color: colors.success
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = colors.success + '30';
                                  e.target.style.borderColor = colors.success;
                                  e.target.style.color = colors.success;
                                  e.target.style.transform = 'scale(1.1)';
                                  e.target.style.boxShadow = `0 8px 25px ${colors.success}40`;
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = colors.success + '10';
                                  e.target.style.borderColor = colors.success;
                                  e.target.style.color = colors.success;
                                  e.target.style.transform = 'scale(1)';
                                  e.target.style.boxShadow = 'none';
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprovePayment(payment._id);
                                }}
                                title="اعتماد الدفع"
                            >
                              <Check size={16} />
                              </button>
                              
                              <button
                                className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                                style={{
                                  backgroundColor: colors.error + '10',
                                  borderColor: colors.error,
                                  color: colors.error
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = colors.error + '30';
                                  e.target.style.borderColor = colors.error;
                                  e.target.style.color = colors.error;
                                  e.target.style.transform = 'scale(1.1)';
                                  e.target.style.boxShadow = `0 8px 25px ${colors.error}40`;
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = colors.error + '10';
                                  e.target.style.borderColor = colors.error;
                                  e.target.style.color = colors.error;
                                  e.target.style.transform = 'scale(1)';
                                  e.target.style.boxShadow = 'none';
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectPayment(payment._id, 'مرفوض من قبل المدير');
                                }}
                                title="رفض الدفع"
                            >
                              <X size={16} />
                              </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalItems === 0 && (
              <div className="text-center py-16">
                <CreditCard size={48} color={colors.textMuted} className="mx-auto mb-4" />
                <p className="text-lg font-medium" style={{ color: colors.textMuted }}>
                لا توجد مدفوعات مطابقة للبحث
              </p>
            </div>
          )}
        </div>
      </LuxuryCard>
      )}

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {paginatedPayments.map((payment, index) => (
          <motion.div
            key={payment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="overflow-hidden"
          >
            <LuxuryCard className="overflow-hidden" style={{
              background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
              border: `2px solid ${colors.border}60`,
              boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)`,
              backdropFilter: 'blur(20px)',
              borderRadius: borderRadius.xl
            }}>
              <div className="p-4">
                {/* Payment Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                      backgroundColor: colors.accent + '20'
                    }}>
                      <User size={20} color={colors.accent} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: colors.text }}>
                        {payment.studentId?.firstName} {payment.studentId?.secondName}
                      </p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        {payment.studentId?.userEmail}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    <span className="text-sm font-medium" style={{ color: getStatusColor(payment.status) }}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3 mb-4">
                  {/* Course */}
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} color={colors.info} />
                    <span className="text-sm" style={{ color: colors.text }}>
                      {payment.courseId?.title || 'غير محدد'}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} color={colors.success} />
                    <span className="text-sm font-semibold" style={{ color: colors.text }}>
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} color={colors.textMuted} />
                    <span className="text-sm" style={{ color: colors.textMuted }}>
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: colors.border }}>
                  <div className="flex items-center gap-2">
                    {/* View Details */}
                    <button
                      className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.text
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = colors.accent + '20';
                        e.target.style.borderColor = colors.accent;
                        e.target.style.color = colors.accent;
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = `0 8px 25px ${colors.accent}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = colors.surface;
                        e.target.style.borderColor = colors.border;
                        e.target.style.color = colors.text;
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPayment(payment);
                        setShowDetailsModal(true);
                      }}
                      title="عرض التفاصيل"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Payment Proof */}
                    {payment.screenshot && (
                      <button
                        className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          color: colors.text
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = colors.accent + '20';
                          e.target.style.borderColor = colors.accent;
                          e.target.style.color = colors.accent;
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = `0 8px 25px ${colors.accent}30`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = colors.surface;
                          e.target.style.borderColor = colors.border;
                          e.target.style.color = colors.text;
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageModal(getImageUrlSafe(payment.screenshot));
                        }}
                        title="عرض الصورة"
                      >
                        <Image size={16} />
                      </button>
                    )}
                  </div>

                  {/* Status Actions */}
                  {payment.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                        style={{
                          backgroundColor: colors.success + '10',
                          borderColor: colors.success,
                          color: colors.success
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = colors.success + '20';
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = `0 8px 25px ${colors.success}30`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = colors.success + '10';
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentAction(payment._id, 'approved');
                        }}
                        title="قبول الدفع"
                      >
                        <CheckCircle size={16} />
                      </button>
                      
                      <button
                        className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 group"
                        style={{
                          backgroundColor: colors.error + '10',
                          borderColor: colors.error,
                          color: colors.error
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = colors.error + '20';
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = `0 8px 25px ${colors.error}30`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = colors.error + '10';
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentAction(payment._id, 'rejected');
                        }}
                        title="رفض الدفع"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </LuxuryCard>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">عرض:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">من أصل {totalItems}</span>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              عرض {startIndex + 1} إلى {Math.min(endIndex, totalItems)} من {totalItems} مدفوعات
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                الأولى
              </button>
              
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                السابقة
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                        currentPage === pageNum
                          ? 'bg-luxury-gold text-white border-luxury-gold'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                التالية
              </button>
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                الأخيرة
              </button>
            </div>
          </div>
        )}

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="إثبات الدفع"
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                />
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70"
                    onClick={() => downloadImage(selectedImage, 'payment-proof.jpg')}
                  >
                    <DownloadIcon size={16} color="white" />
                  </LuxuryButton>
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70"
                    onClick={() => copyImageUrl(selectedImage)}
                  >
                    <Copy size={16} color="white" />
                  </LuxuryButton>
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70"
                    onClick={closeImageModal}
                  >
                    <X size={16} color="white" />
                  </LuxuryButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing['2xl'],
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.lg
              }}>
                <h2 style={{ color: colors.text, margin: 0, fontSize: typography.fontSize.xl }}>
                  تفاصيل الدفع
                </h2>
                <LuxuryButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <X size={16} />
                </LuxuryButton>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                {/* Student Info */}
                <div>
                  <h3 style={{
                    color: colors.text,
                    margin: 0,
                    marginBottom: spacing.md,
                    fontSize: typography.fontSize.lg
                  }}>
                    معلومات الطالب
                  </h3>
                  <div style={{
                    padding: spacing.md,
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border}`
                  }}>
                    <p style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
                      <strong>الاسم:</strong> {selectedPayment.studentId?.firstName} {selectedPayment.studentId?.secondName}
                    </p>
                    <p style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
                      <strong>البريد الإلكتروني:</strong> {selectedPayment.studentId?.userEmail}
                    </p>
                    <p style={{ color: colors.text, margin: 0 }}>
                      <strong>رقم الهاتف:</strong> {selectedPayment.studentId?.phoneNumber || 'غير محدد'}
                    </p>
                  </div>
                </div>
                
                {/* Course Info */}
                <div>
                  <h3 style={{
                    color: colors.text,
                    margin: 0,
                    marginBottom: spacing.md,
                    fontSize: typography.fontSize.lg
                  }}>
                    معلومات الدورة
                  </h3>
                  <div style={{
                    padding: spacing.md,
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border}`
                  }}>
                    <p style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
                      <strong>عنوان الدورة:</strong> {selectedPayment.courseId?.title || 'غير محدد'}
                    </p>
                    <p style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
                      <strong>المادة:</strong> {selectedPayment.courseId?.subject || 'غير محدد'}
                    </p>
                    <p style={{ color: colors.text, margin: 0 }}>
                      <strong>الصف:</strong> {selectedPayment.courseId?.grade || 'غير محدد'}
                    </p>
                  </div>
                </div>
                
                {/* Payment Info */}
                <div>
                  <h3 style={{
                    color: colors.text,
                    margin: 0,
                    marginBottom: spacing.md,
                    fontSize: typography.fontSize.lg
                  }}>
                    معلومات الدفع
                  </h3>
                  <div style={{
                    padding: spacing.md,
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border}`
                  }}>
                    <p style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
                      <strong>المبلغ:</strong> {formatCurrency(selectedPayment.amount)}
                    </p>
                    <p style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
                      <strong>الحالة:</strong> 
                      <span style={{
                        marginLeft: spacing.xs,
                        padding: `${spacing.xs} ${spacing.sm}`,
                        borderRadius: borderRadius.sm,
                        fontSize: typography.fontSize.xs,
                        backgroundColor: getStatusColor(selectedPayment.status) + '20',
                        color: getStatusColor(selectedPayment.status)
                      }}>
                        {getStatusText(selectedPayment.status)}
                      </span>
                    </p>
                    <p style={{ color: colors.text, margin: 0, marginBottom: spacing.xs }}>
                      <strong>تاريخ الطلب:</strong> {formatDate(selectedPayment.createdAt)}
                    </p>
                    {selectedPayment.approvedAt && (
                      <p style={{ color: colors.text, margin: 0 }}>
                        <strong>تاريخ الاعتماد:</strong> {formatDate(selectedPayment.approvedAt)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Payment Proof */}
                {selectedPayment.screenshot && (
                  <div>
                    <h3 style={{
                      color: colors.text,
                      margin: 0,
                      marginBottom: spacing.md,
                      fontSize: typography.fontSize.lg
                    }}>
                      إثبات الدفع
                    </h3>
                    <div style={{
                      padding: spacing.md,
                      backgroundColor: colors.background,
                      borderRadius: borderRadius.lg,
                      border: `2px solid ${colors.border}60`,
                      boxShadow: `0 4px 15px ${colors.shadow}20`
                    }}>
                      <div className="relative group">
                      <img
                        src={getImageUrlSafe(selectedPayment.screenshot)}
                          alt="إثبات الدفع"
                          className="w-full max-h-80 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openImageModal(getImageUrlSafe(selectedPayment.screenshot))}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <LuxuryButton
                              variant="outline"
                              size="sm"
                              className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100"
                              onClick={() => openImageModal(getImageUrlSafe(selectedPayment.screenshot))}
                            >
                              <ZoomIn size={16} />
                            </LuxuryButton>
                            <LuxuryButton
                              variant="outline"
                              size="sm"
                              className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100"
                              onClick={() => downloadImage(getImageUrlSafe(selectedPayment.screenshot), `payment-proof-${selectedPayment._id}.jpg`)}
                            >
                              <DownloadIcon size={16} />
                            </LuxuryButton>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={() => openImageModal(getImageUrlSafe(selectedPayment.screenshot))}
                        >
                          <ZoomIn size={14} />
                          عرض بالحجم الكامل
                        </LuxuryButton>
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                          onClick={() => downloadImage(getImageUrlSafe(selectedPayment.screenshot), `payment-proof-${selectedPayment._id}.jpg`)}
                        >
                          <DownloadIcon size={14} />
                          تحميل الصورة
                        </LuxuryButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{
                display: 'flex',
                gap: spacing.md,
                marginTop: spacing.lg,
                justifyContent: 'flex-end'
              }}>
                <LuxuryButton
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                >
                  إغلاق
                </LuxuryButton>
                
                {selectedPayment.status === 'pending' && (
                  <>
                    <LuxuryButton
                      variant="outline"
                      onClick={() => {
                        handleRejectPayment(selectedPayment._id, 'مرفوض من قبل المدير');
                        setShowDetailsModal(false);
                      }}
                      style={{ color: colors.error, borderColor: colors.error }}
                    >
                      <X size={16} style={{ marginLeft: spacing.xs }} />
                      رفض
                    </LuxuryButton>
                    
                    <LuxuryButton
                      variant="primary"
                      onClick={() => {
                        handleApprovePayment(selectedPayment._id);
                        setShowDetailsModal(false);
                      }}
                    >
                      <Check size={16} style={{ marginLeft: spacing.xs }} />
                      اعتماد
                    </LuxuryButton>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentManagement;
