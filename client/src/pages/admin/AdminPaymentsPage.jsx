import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../../hooks/use-toast';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  DollarSign,
  User,
  Phone,
  Calendar,
  FileImage,
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3,
  ExternalLink,
  CheckCircle2,
  X,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Mail,
  MapPin,
  GraduationCap,
  Shield,
  Activity,
  Award,
  Star,
  Target,
  Zap,
  Sparkles,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';

const AdminPaymentsPage = () => {
  const theme = useTheme();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;

  // State management
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    acceptedAmount: 0,
    pendingAmount: 0,
    rejectedAmount: 0,
    pendingCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    averageAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Pagination
  const itemsPerPage = 10;

  useEffect(() => {
    // Only fetch data if user is authenticated and is admin
    if (isAuthenticated && isAdmin) {
      fetchPayments();
      fetchStats();
    } else if (isAuthenticated && !isAdmin) {
      console.warn('❌ Non-admin user attempted to access admin payments page');
      toast({
        title: "❌ Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, isAdmin, currentPage, statusFilter, searchTerm, sortBy, sortOrder, dateFilter]);

  const fetchPayments = async () => {
    // Validate authentication and admin role before making request
    if (!isAuthenticated || !isAdmin) {
      console.warn('❌ Unauthorized access attempt to payments data');
      return;
    }

    try {
      setLoading(true);
      console.log('📋 Fetching payments for admin:', user?.email);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate, endDate;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
        }
        
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());
      }

      const response = await axiosInstance.get(`/api/admin/payments?${params}`);
      console.log('✅ Payments API response:', response.data);
      console.log('🔍 Response structure:', {
        success: response.data.success,
        hasData: !!response.data.data,
        dataKeys: response.data.data ? Object.keys(response.data.data) : [],
        paymentsLength: response.data.data?.payments?.length || 0
      });
      
      if (response.data.success) {
        const { payments: paymentsData, pagination, statistics } = response.data.data;
        console.log('📋 Payments data received:', paymentsData);
        console.log('📋 Pagination:', pagination);
        console.log('📋 Statistics:', statistics);
        setPayments(paymentsData || []);
        setTotalPages(pagination?.totalPages || 1);
        setTotalItems(pagination?.totalItems || 0);
        
        if (statistics) {
          setStats(statistics);
        }

        toast({
          title: "✅ Payments Loaded",
          description: `Successfully loaded ${paymentsData?.length || 0} payments`,
          variant: "default"
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        url: error.config?.url
      });
      
      // Show user-friendly error message
      let errorMessage = 'Failed to load payments data';
      if (error.status === 401) {
        errorMessage = 'Please login first';
      } else if (error.status === 403) {
        errorMessage = 'You don\'t have permission to access this data';
      } else if (error.status >= 500) {
        errorMessage = 'Server error, please try again later';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      }
      
      toast({
        title: "❌ Error Loading Payments",
        description: errorMessage,
        variant: "destructive"
      });
      
      setPayments([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Validate authentication and admin role before making request
    if (!isAuthenticated || !isAdmin) {
      console.warn('❌ Unauthorized access attempt to payment statistics');
      toast({
        title: "❌ Access Denied",
        description: "You must be logged in as an admin to view payment statistics",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📊 Fetching payment stats for admin:', user?.email);
      
      // Validate query parameters before sending request
      const queryParams = new URLSearchParams();
      
      // Add period parameter if valid
      const validPeriods = ['all', 'today', 'week', 'month', 'year'];
      const period = 'all'; // Default period
      if (validPeriods.includes(period)) {
        queryParams.append('period', period);
      }

      const response = await axiosInstance.get(`/api/admin/payments/statistics?${queryParams}`);
      console.log('✅ Stats API response:', response.data);
      
      if (response.data.success) {
        const statsData = response.data.data || {};
        console.log('📈 Stats data received:', statsData);
        
        setStats({
          totalPayments: statsData.totalPayments || 0,
          totalAmount: statsData.totalAmount || 0,
          acceptedAmount: statsData.acceptedAmount || 0,
          pendingAmount: statsData.pendingAmount || 0,
          rejectedAmount: statsData.rejectedAmount || 0,
          pendingCount: statsData.pendingCount || 0,
          acceptedCount: statsData.acceptedCount || 0,
          rejectedCount: statsData.rejectedCount || 0,
          averageAmount: statsData.averageAmount || 0
        });

        toast({
          title: "✅ Statistics Updated",
          description: "Payment statistics have been successfully loaded",
          variant: "default"
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        url: error.config?.url
      });
      
      // Show user-friendly error message
      const errorMessage = error.data?.message || error.message || 'Failed to fetch payment statistics';
      
      toast({
        title: "❌ Error Loading Statistics",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Set default stats if API fails
      setStats({
        totalPayments: 0,
        totalAmount: 0,
        acceptedAmount: 0,
        pendingAmount: 0,
        rejectedAmount: 0,
        pendingCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        averageAmount: 0
      });
    }
  };

  const handleAcceptPayment = async (paymentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [paymentId]: 'accepting' }));
      
      const response = await axiosInstance.put(`/api/admin/payments/${paymentId}/status`, {
        status: 'accepted'
      });
      
      if (response.data.success) {
        // Update local state immediately for instant UI feedback
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment._id === paymentId 
              ? { ...payment, status: 'accepted', acceptedAt: new Date() }
              : payment
          )
        );
        
        // Update stats immediately
        setStats(prevStats => ({
          ...prevStats,
          acceptedCount: prevStats.acceptedCount + 1,
          pendingCount: Math.max(0, prevStats.pendingCount - 1),
          acceptedAmount: prevStats.acceptedAmount + (response.data.data?.amount || 0),
          pendingAmount: Math.max(0, prevStats.pendingAmount - (response.data.data?.amount || 0))
        }));
        
        toast({
          title: 'تم قبول الدفع بنجاح',
          description: 'تم قبول الدفع وتسجيل الطالب في الدورة',
          variant: 'success',
          duration: 5000
        });
        
        // Refresh data in background to ensure consistency
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error accepting payment:', error);
      
      // Handle specific error cases
      if (error.response?.data?.code === 'PAYMENT_ALREADY_PROCESSED') {
        toast({
          title: 'الدفعة مقبولة بالفعل',
          description: 'هذه الدفعة تم قبولها مسبقاً. يرجى تحديث الصفحة.',
          variant: 'info',
          duration: 5000,
          action: (
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              تحديث الصفحة
            </button>
          )
        });
        // Refresh the data to show current status
        fetchPayments();
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء قبول الدفع';
        toast({
          title: 'خطأ في قبول الدفع',
          description: errorMessage,
          variant: 'destructive',
          duration: 5000
        });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [paymentId]: null }));
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('يرجى إدخال سبب الرفض (اختياري):');
    if (reason === null) return; // User cancelled

    try {
      setActionLoading(prev => ({ ...prev, [paymentId]: 'rejecting' }));
      
      const response = await axiosInstance.put(`/api/admin/payments/${paymentId}/status`, {
        status: 'rejected',
        reason: reason || 'تم رفض الدفع من قبل الإدارة'
      });
      
      if (response.data.success) {
        // Update local state immediately for instant UI feedback
        setPayments(prevPayments => 
          prevPayments.map(payment => 
            payment._id === paymentId 
              ? { ...payment, status: 'rejected', rejectedAt: new Date(), rejectionReason: reason }
              : payment
          )
        );
        
        // Update stats immediately
        setStats(prevStats => ({
          ...prevStats,
          rejectedCount: prevStats.rejectedCount + 1,
          pendingCount: Math.max(0, prevStats.pendingCount - 1),
          rejectedAmount: prevStats.rejectedAmount + (response.data.data?.amount || 0),
          pendingAmount: Math.max(0, prevStats.pendingAmount - (response.data.data?.amount || 0))
        }));
        
        toast({
          title: 'تم رفض الدفع',
          description: 'تم رفض الدفع وإشعار الطالب',
          variant: 'success',
          duration: 5000
        });
        
        // Refresh data in background to ensure consistency
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      const errorMessage = error.response?.data?.error || 'حدث خطأ أثناء رفض الدفع';
      toast({
        title: 'خطأ في رفض الدفع',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [paymentId]: null }));
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      setActionLoading(prev => ({ ...prev, [paymentId]: 'deleting' }));
      
      const response = await axiosInstance.delete(`/api/admin/payments/${paymentId}`);
      
      if (response.data.success) {
        // Remove payment from local state immediately
        setPayments(prevPayments => 
          prevPayments.filter(payment => payment._id !== paymentId)
        );
        
        // Update stats immediately
        const deletedPayment = payments.find(p => p._id === paymentId);
        if (deletedPayment) {
          setStats(prevStats => ({
            ...prevStats,
            totalPayments: Math.max(0, prevStats.totalPayments - 1),
            totalAmount: Math.max(0, prevStats.totalAmount - deletedPayment.amount),
            pendingCount: Math.max(0, prevStats.pendingCount - 1),
            pendingAmount: Math.max(0, prevStats.pendingAmount - deletedPayment.amount)
          }));
        }
        
        toast({
          title: 'تم حذف طلب الدفع',
          description: 'تم حذف طلب الدفع بنجاح وإشعار الطالب',
          variant: 'success',
          duration: 5000
        });
        
        // Close delete modal
        setShowDeleteModal(false);
        setPaymentToDelete(null);
        
        // Refresh data in background to ensure consistency
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      
      // Handle specific error cases
      if (error.response?.data?.code === 'PAYMENT_ALREADY_PROCESSED') {
        toast({
          title: 'لا يمكن حذف الدفع',
          description: 'هذا الدفع تم معالجته مسبقاً ولا يمكن حذفه',
          variant: 'destructive',
          duration: 5000
        });
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء حذف طلب الدفع';
        toast({
          title: 'خطأ في حذف طلب الدفع',
          description: errorMessage,
          variant: 'destructive',
          duration: 5000
        });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [paymentId]: null }));
    }
  };

  const confirmDeletePayment = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const handleViewImage = (payment) => {
    setSelectedPayment(payment);
    setShowImageModal(true);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // New utility functions for enhanced features
  const handleBulkAction = async () => {
    if (selectedPayments.length === 0) {
      toast({
        title: 'لم يتم اختيار أي مدفوعات',
        description: 'يرجى اختيار مدفوعات للمعالجة',
        variant: 'destructive',
        duration: 4000
      });
      return;
    }

    if (!bulkAction) {
      toast({
        title: 'لم يتم اختيار إجراء',
        description: 'يرجى اختيار إجراء للمعالجة',
        variant: 'destructive',
        duration: 4000
      });
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, bulk: true }));
      
      const response = await axiosInstance.put('/api/admin/payments/bulk-status', {
        paymentIds: selectedPayments,
        status: bulkAction,
        reason: bulkAction === 'rejected' ? rejectionReason : undefined
      });

      if (response.data.success) {
        toast({
          title: 'تم معالجة المدفوعات بنجاح',
          description: `تم ${bulkAction === 'accepted' ? 'قبول' : 'رفض'} ${response.data.data.updatedCount} مدفوعات`,
          variant: 'success',
          duration: 5000
        });
        
        setSelectedPayments([]);
        setBulkAction('');
        setRejectionReason('');
        setShowBulkActionModal(false);
        fetchPayments();
        fetchStats();
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast({
        title: 'خطأ في معالجة المدفوعات',
        description: error.response?.data?.error || 'حدث خطأ أثناء معالجة المدفوعات',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setActionLoading(prev => ({ ...prev, bulk: false }));
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(payment => payment._id));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const params = new URLSearchParams({
        format,
        status: statusFilter,
        search: searchTerm
      });

      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate, endDate;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
        }
        
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());
      }

      const response = await axiosInstance.get(`/api/admin/payments/export?${params}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        // Download CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Download JSON file
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `payments_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: 'تم تصدير البيانات بنجاح',
        description: `تم تصدير ${response.data.totalRecords || payments.length} سجل`,
        variant: 'success',
        duration: 4000
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'خطأ في تصدير البيانات',
        description: 'حدث خطأ أثناء تصدير البيانات',
        variant: 'destructive',
        duration: 4000
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: colors.warning,
        bgColor: colors.warning + '20',
        borderColor: colors.warning + '30',
        icon: Clock,
        text: 'في الانتظار'
      },
      accepted: {
        color: colors.success,
        bgColor: colors.success + '20',
        borderColor: colors.success + '30',
        icon: CheckCircle,
        text: 'مقبول'
      },
      rejected: {
        color: colors.error,
        bgColor: colors.error + '20',
        borderColor: colors.error + '30',
        icon: XCircle,
        text: 'مرفوض'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`
      }}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentPhone?.includes(searchTerm) ||
      payment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CreditCard size={48} color={colors.accent} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing.lg} ${spacing.md} ${spacing['2xl']} ${spacing.md}`
      }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{
            background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 rounded-2xl" style={{
                background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                border: `1px solid ${colors.accent}30`
              }}>
                <CreditCard size={24} className="lg:w-8 lg:h-8" color={colors.accent} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2" style={{ color: colors.text }}>
                  إدارة المدفوعات
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  عرض وإدارة جميع المدفوعات والتحويلات المالية
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
              <LuxuryButton
                variant="outline"
                onClick={fetchPayments}
                className="flex items-center gap-3 px-6 py-3 h-12 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                disabled={loading}
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                <span className="font-medium">تحديث البيانات</span>
              </LuxuryButton>
              {/* <LuxuryButton
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={18} />
                تصدير
              </LuxuryButton> */}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <LuxuryCard className="h-full" style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.md
            }}>
              <div className="p-4 lg:p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl mb-3 lg:mb-4" style={{
                  background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                  border: `2px solid ${colors.accent}30`
                }}>
                  <CreditCard size={24} className="lg:w-8 lg:h-8" color={colors.accent} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: colors.text }}>
                  {stats.totalPayments}
                </h3>
                <p className="text-xs lg:text-sm font-medium" style={{ color: colors.textMuted }}>
                  إجمالي المعاملات
                </p>
              </div>
            </LuxuryCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <LuxuryCard className="h-full" style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.md
            }}>
              <div className="p-4 lg:p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl mb-3 lg:mb-4" style={{
                  background: `linear-gradient(135deg, ${colors.success}20, ${colors.success}10)`,
                  border: `2px solid ${colors.success}30`
                }}>
                  <CheckCircle size={24} className="lg:w-8 lg:h-8" color={colors.success} />
                </div>
                <h3 className="text-xl lg:text-3xl font-bold mb-2" style={{ color: colors.text }}>
                  {formatCurrency(stats.acceptedAmount)}
                </h3>
                <p className="text-xs lg:text-sm font-medium" style={{ color: colors.textMuted }}>
                  المبالغ المقبولة
                </p>
              </div>
            </LuxuryCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <LuxuryCard className="h-full" style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.md
            }}>
              <div className="p-4 lg:p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl mb-3 lg:mb-4" style={{
                  background: `linear-gradient(135deg, ${colors.warning}20, ${colors.warning}10)`,
                  border: `2px solid ${colors.warning}30`
                }}>
                  <Clock size={24} className="lg:w-8 lg:h-8" color={colors.warning} />
                </div>
                <h3 className="text-xl lg:text-3xl font-bold mb-2" style={{ color: colors.text }}>
                  {formatCurrency(stats.pendingAmount)}
                </h3>
                <p className="text-xs lg:text-sm font-medium" style={{ color: colors.textMuted }}>
                  المبالغ المعلقة
                </p>
              </div>
            </LuxuryCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <LuxuryCard className="h-full" style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.md
            }}>
              <div className="p-4 lg:p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl mb-3 lg:mb-4" style={{
                  background: `linear-gradient(135deg, ${colors.error}20, ${colors.error}10)`,
                  border: `2px solid ${colors.error}30`
                }}>
                  <XCircle size={24} className="lg:w-8 lg:h-8" color={colors.error} />
                </div>
                <h3 className="text-xl lg:text-3xl font-bold mb-2" style={{ color: colors.text }}>
                  {formatCurrency(stats.rejectedAmount)}
                </h3>
                <p className="text-xs lg:text-sm font-medium" style={{ color: colors.textMuted }}>
                  المبالغ المرفوضة
                </p>
              </div>
            </LuxuryCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <LuxuryCard className="h-full" style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
              border: `1px solid ${colors.border}`,
              boxShadow: shadows.md
            }}>
              <div className="p-4 lg:p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl mb-3 lg:mb-4" style={{
                  background: `linear-gradient(135deg, ${colors.info}20, ${colors.info}10)`,
                  border: `2px solid ${colors.info}30`
                }}>
                  <DollarSign size={24} className="lg:w-8 lg:h-8" color={colors.info} />
                </div>
                <h3 className="text-lg lg:text-2xl font-bold mb-2" style={{ color: colors.accent }}>
                  {formatCurrency(stats.totalAmount)}
                </h3>
                <p className="text-xs lg:text-sm font-medium" style={{ color: colors.textMuted }}>
                  إجمالي الإيرادات
                </p>
              </div>
            </LuxuryCard>
          </motion.div>
        </div>

        {/* Filters */}
        <LuxuryCard className="overflow-hidden mb-8" style={{
          background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.lg
        }}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{
                background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                border: `1px solid ${colors.accent}30`
              }}>
                <Filter size={20} color={colors.accent} />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: colors.text }}>
                البحث والتصفية المتقدمة
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  البحث السريع
                </label>
                <div className="relative">
                  <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم، الهاتف، أو اسم الدورة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text,
                      fontSize: typography.fontSize.sm,
                      '--tw-ring-color': colors.accent + '30'
                    }}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  تصفية حسب الحالة
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                >
                  <option value="all">جميع المعاملات</option>
                  <option value="pending">في الانتظار</option>
                  <option value="accepted">مقبولة</option>
                  <option value="rejected">مرفوضة</option>
                </select>
              </div>
              
              {/* Quick Actions */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  أدوات التحكم
                </label>
                <div className="flex gap-2">
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-4 py-2 h-10 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-900/30 dark:hover:to-slate-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    <X size={16} />
                    <span className="font-medium">مسح الفلاتر</span>
                  </LuxuryButton>
                </div>
              </div>
            </div>
          </div>
        </LuxuryCard>

        {/* Desktop Table View */}
        <LuxuryCard className="hidden lg:block overflow-hidden" style={{
          background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.lg
        }}>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold" style={{ color: colors.text }}>
                    بيانات الطالب
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold" style={{ color: colors.text }}>
                    تفاصيل الدورة
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold" style={{ color: colors.text }}>
                    قيمة الدفع
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold" style={{ color: colors.text }}>
                    رقم المعاملة
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold" style={{ color: colors.text }}>
                    حالة المعاملة
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold" style={{ color: colors.text }}>
                    تاريخ الإرسال
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold" style={{ color: colors.text }}>
                    إجراءات التحكم
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <motion.tr
                    key={payment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                    className="hover:bg-opacity-50 transition-colors duration-200"
                  >
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div>
                        <p className="font-medium text-sm lg:text-base" style={{ color: colors.text }}>
                          {payment.studentName}
                        </p>
                        <p className="text-xs lg:text-sm flex items-center gap-1" style={{ color: colors.textMuted }}>
                          <Phone size={10} className="lg:w-3 lg:h-3" />
                          {payment.studentPhone}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div>
                        <p className="font-medium text-sm lg:text-base" style={{ color: colors.text }}>
                          {payment.courseId?.title}
                        </p>
                        <p className="text-xs lg:text-sm" style={{ color: colors.textMuted }}>
                          {payment.courseId?.subject} • الصف {payment.courseId?.grade}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="lg:w-4 lg:h-4" color={colors.accent} />
                        <span className="font-bold text-sm lg:text-base" style={{ color: colors.accent }}>
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <p className="text-xs lg:text-sm font-mono" style={{ color: colors.textMuted }}>
                        {payment.transactionId || 'غير محدد'}
                      </p>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center gap-1 text-xs lg:text-sm" style={{ color: colors.textMuted }}>
                        <Calendar size={10} className="lg:w-3 lg:h-3" />
                        {formatDate(payment.createdAt)}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewImage(payment)}
                          className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                        </LuxuryButton>
                        
                        {payment.status === 'pending' ? (
                          <>
                            <LuxuryButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleAcceptPayment(payment._id)}
                              disabled={actionLoading[payment._id]}
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                              style={{
                                borderColor: colors.success + '30',
                                color: colors.success
                              }}
                            >
                              {actionLoading[payment._id] === 'accepting' ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <RefreshCw size={18} />
                                </motion.div>
                              ) : (
                                <CheckCircle size={18} />
                              )}
                            </LuxuryButton>
                            
                            <LuxuryButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectPayment(payment._id)}
                              disabled={actionLoading[payment._id]}
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                              style={{
                                borderColor: colors.error + '30',
                                color: colors.error
                              }}
                            >
                              {actionLoading[payment._id] === 'rejecting' ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <RefreshCw size={18} />
                                </motion.div>
                              ) : (
                                <XCircle size={18} />
                              )}
                            </LuxuryButton>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                            {payment.status === 'accepted' && (
                              <>
                                <CheckCircle size={16} color={colors.success} />
                                <span style={{ color: colors.success }}>تم القبول</span>
                              </>
                            )}
                            {payment.status === 'rejected' && (
                              <>
                                <XCircle size={16} color={colors.error} />
                                <span style={{ color: colors.error }}>تم الرفض</span>
                              </>
                            )}
                          </div>
                        )}

                        {/* Delete button - always visible */}
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          onClick={() => confirmDeletePayment(payment)}
                          disabled={actionLoading[payment._id]}
                          className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          style={{
                            borderColor: colors.warning + '30',
                            color: colors.warning
                          }}
                        >
                          {actionLoading[payment._id] === 'deleting' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw size={18} />
                            </motion.div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </LuxuryButton>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredPayments.length === 0 && (
            <div className="text-center py-16">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 rounded-full opacity-20" style={{
                  background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
                }}></div>
                <div className="relative p-8 rounded-full" style={{
                  background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                  border: `2px solid ${colors.accent}30`
                }}>
                  <CreditCard size={80} color={colors.accent} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
                لا توجد معاملات
              </h3>
              
              <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: colors.textMuted }}>
                لم يتم العثور على أي معاملات مالية تطابق معايير البحث المحددة.
              </p>
            </div>
          )}
        </LuxuryCard>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-3 lg:space-y-4">
          {filteredPayments.map((payment, index) => (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LuxuryCard className="overflow-hidden" style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.lg
              }}>
                <div className="p-3 lg:p-4">
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
                          {payment.studentName}
                        </p>
                        <p className="text-xs flex items-center gap-1" style={{ color: colors.textMuted }}>
                          <Phone size={12} />
                          {payment.studentPhone}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status */}
                    {getStatusBadge(payment.status)}
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-3 mb-4">
                    {/* Course */}
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} color={colors.info} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.text }}>
                          {payment.courseId?.title}
                        </p>
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {payment.courseId?.subject} • الصف {payment.courseId?.grade}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} color={colors.accent} />
                      <span className="text-sm font-bold" style={{ color: colors.accent }}>
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>

                    {/* Transaction ID */}
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} color={colors.textMuted} />
                      <span className="text-sm font-mono" style={{ color: colors.textMuted }}>
                        {payment.transactionId || 'غير محدد'}
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
                      {/* View Image */}
                      <LuxuryButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewImage(payment)}
                        className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                      </LuxuryButton>
                    </div>

                    {/* Status Actions */}
                    {payment.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcceptPayment(payment._id)}
                          disabled={actionLoading[payment._id]}
                          className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          style={{
                            borderColor: colors.success + '30',
                            color: colors.success
                          }}
                        >
                          {actionLoading[payment._id] === 'accepting' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw size={18} />
                            </motion.div>
                          ) : (
                            <CheckCircle size={18} />
                          )}
                        </LuxuryButton>
                        
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectPayment(payment._id)}
                          disabled={actionLoading[payment._id]}
                          className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                          style={{
                            borderColor: colors.error + '30',
                            color: colors.error
                          }}
                        >
                          {actionLoading[payment._id] === 'rejecting' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw size={18} />
                            </motion.div>
                          ) : (
                            <XCircle size={18} />
                          )}
                        </LuxuryButton>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                        {payment.status === 'accepted' && (
                          <>
                            <CheckCircle size={16} color={colors.success} />
                            <span style={{ color: colors.success }}>تم القبول</span>
                          </>
                        )}
                        {payment.status === 'rejected' && (
                          <>
                            <XCircle size={16} color={colors.error} />
                            <span style={{ color: colors.error }}>تم الرفض</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Delete button - always visible */}
                    <LuxuryButton
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDeletePayment(payment)}
                      disabled={actionLoading[payment._id]}
                      className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{
                        borderColor: colors.warning + '30',
                        color: colors.warning
                      }}
                    >
                      {actionLoading[payment._id] === 'deleting' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw size={18} />
                        </motion.div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </LuxuryButton>
                  </div>
                </div>
              </LuxuryCard>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <LuxuryButton
                  key={page}
                  variant={page === currentPage ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                    page === currentPage 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" 
                      : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-900/30 dark:hover:to-slate-900/30"
                  }`}
                >
                  {page}
                </LuxuryButton>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl mx-4"
            >
              <LuxuryCard style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.xl
              }}>
                <div className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                      إثبات الدفع المالي
                    </h3>
                    <LuxuryButton
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImageModal(false)}
                      className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <XCircle size={20} className="text-red-600 dark:text-red-400" />
                    </LuxuryButton>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-lg font-medium mb-2" style={{ color: colors.text }}>
                      {selectedPayment.studentName}
                    </p>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      {selectedPayment.courseId?.title} • {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <img
                      src={selectedPayment.screenshot}
                      alt="Payment proof"
                      className="w-full h-auto rounded-xl"
                      style={{ maxHeight: '70vh' }}
                    />
                  </div>
                </div>
              </LuxuryCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && paymentToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md mx-4"
            >
              <LuxuryCard style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.xl
              }}>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full" style={{
                      backgroundColor: colors.error + '20',
                      border: `2px solid ${colors.error}30`
                    }}>
                      <AlertTriangle size={24} color={colors.error} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                        تأكيد حذف طلب الدفع
                      </h3>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        هذا الإجراء لا يمكن التراجع عنه
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6 p-4 rounded-xl" style={{
                    backgroundColor: colors.warning + '10',
                    border: `1px solid ${colors.warning}30`
                  }}>
                    <div className="flex items-center gap-3 mb-3">
                      <User size={20} color={colors.text} />
                      <span className="font-medium" style={{ color: colors.text }}>
                        {paymentToDelete.studentName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen size={20} color={colors.textMuted} />
                      <span className="text-sm" style={{ color: colors.textMuted }}>
                        {paymentToDelete.courseId?.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign size={20} color={colors.accent} />
                      <span className="font-bold" style={{ color: colors.accent }}>
                        {formatCurrency(paymentToDelete.amount)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <LuxuryButton
                      variant="outline"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setPaymentToDelete(null);
                      }}
                      className="flex-1 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-900/30 dark:hover:to-slate-900/30 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      إلغاء
                    </LuxuryButton>
                    <LuxuryButton
                      variant="primary"
                      onClick={() => handleDeletePayment(paymentToDelete._id)}
                      disabled={actionLoading[paymentToDelete._id]}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {actionLoading[paymentToDelete._id] === 'deleting' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw size={18} />
                          <span>جاري الحذف...</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Trash2 size={18} />
                          <span>حذف طلب الدفع</span>
                        </div>
                      )}
                    </LuxuryButton>
                  </div>
                </div>
              </LuxuryCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPaymentsPage;
