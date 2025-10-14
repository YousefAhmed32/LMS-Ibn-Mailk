import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import adminService from '../../services/adminService';
import LuxuryButton from '../ui/LuxuryButton';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  AlertCircle,
  RefreshCw,
  User,
  BookOpen,
  DollarSign,
  Calendar,
  Phone,
  FileText,
  Filter,
  Search,
  CreditCard,
  Smartphone,
  Banknote,
  TrendingUp,
  Users,
  CheckSquare,
  XSquare,
  MoreHorizontal,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';

const EnhancedPaymentApprovalDashboard = () => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  // State management
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [currentPage, filterStatus, filterMethod, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: 20,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterMethod !== 'all' && { paymentMethod: filterMethod })
      };
      
      const response = await adminService.getAllPayments(filters);
      if (response.data.success) {
        setPayments(response.data.data || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "❌ خطأ في جلب البيانات",
        description: "فشل في جلب بيانات المدفوعات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getPaymentStatistics();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (payment) => {
    try {
      setProcessing(true);
      const response = await adminService.approvePaymentProof(payment._id);
      
      if (response.data.success) {
        toast({
          title: "✅ تم الموافقة على الدفع",
          description: `تم تفعيل الدورة "${payment.courseId?.title || 'غير محدد'}" للطالب ${payment.studentId?.name || 'غير محدد'} بنجاح`,
        });
        
        // Update payment status in local state
        setPayments(prev => prev.map(p => 
          p._id === payment._id ? { ...p, status: 'approved' } : p
        ));
        
        // Refresh stats
        fetchStats();
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "❌ خطأ في الموافقة",
        description: error.response?.data?.error || "فشل في الموافقة على الدفع",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast({
        title: "❌ خطأ في البيانات",
        description: "يرجى إدخال سبب الرفض",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await adminService.rejectPaymentProof(selectedPayment._id, rejectionReason);
      
      if (response.data.success) {
        toast({
          title: "✅ تم رفض الدفع",
          description: "تم رفض الدفع وإرسال الإشعار للطالب",
        });
        
        // Update payment status in local state
        setPayments(prev => prev.map(p => 
          p._id === selectedPayment._id ? { ...p, status: 'rejected' } : p
        ));
        
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedPayment(null);
        
        // Refresh stats
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "❌ خطأ في الرفض",
        description: error.response?.data?.error || "فشل في رفض الدفع",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      approved: 'text-green-600 bg-green-100 border-green-200',
      rejected: 'text-red-600 bg-red-100 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    };
    return icons[status] || Clock;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      vodafone_cash: Smartphone,
      paypal: CreditCard,
      stripe: CreditCard,
      credit_card: CreditCard,
      bank_transfer: Banknote,
      cash: Banknote
    };
    return icons[method] || CreditCard;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.senderPhone?.includes(searchTerm);
    
    return matchesSearch;
  });

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={32} color={colors.accent} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 
            className="text-3xl font-bold"
            style={{ color: colors.text }}
          >
            إدارة المدفوعات
          </h1>
          <p 
            className="text-lg"
            style={{ color: colors.textMuted }}
          >
            مراجعة وموافقة على إثباتات الدفع
          </p>
        </div>
        
        <div className="flex gap-3">
          <LuxuryButton
            onClick={fetchPayments}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            تحديث
          </LuxuryButton>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl shadow-lg"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  إجمالي المدفوعات
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.overall?.totalPayments || 0}
                </p>
              </div>
              <div 
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: colors.accent + '20',
                  border: `1px solid ${colors.accent}30`
                }}
              >
                <TrendingUp size={24} color={colors.accent} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl shadow-lg"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  المدفوعات المعلقة
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.overall?.pendingPayments || 0}
                </p>
              </div>
              <div 
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: colors.warning + '20',
                  border: `1px solid ${colors.warning}30`
                }}
              >
                <Clock size={24} color={colors.warning} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl shadow-lg"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  المدفوعات المعتمدة
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.overall?.approvedPayments || 0}
                </p>
              </div>
              <div 
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: colors.success + '20',
                  border: `1px solid ${colors.success}30`
                }}
              >
                <CheckCircle size={24} color={colors.success} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl shadow-lg"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  إجمالي المبلغ
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {stats.overall?.totalAmount?.toFixed(0) || 0} ج.م
                </p>
              </div>
              <div 
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: colors.accent + '20',
                  border: `1px solid ${colors.accent}30`
                }}
              >
                <DollarSign size={24} color={colors.accent} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div 
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
              style={{ color: colors.textMuted }}
            />
            <input
              type="text"
              placeholder="البحث في المدفوعات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text,
                '--tw-ring-color': colors.accent + '30'
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text,
              '--tw-ring-color': colors.accent + '30'
            }}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">معلق</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text,
              '--tw-ring-color': colors.accent + '30'
            }}
          >
            <option value="all">جميع الطرق</option>
            <option value="vodafone_cash">Vodafone Cash</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>

          {/* Refresh Button */}
          <LuxuryButton
            onClick={fetchPayments}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            تحديث
          </LuxuryButton>
        </div>
      </div>

      {/* Desktop Table View */}
      <div 
        className="hidden lg:block rounded-2xl shadow-lg overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr 
                className="border-b"
                style={{ borderColor: colors.border }}
              >
                <th 
                  className="px-6 py-4 text-right text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  الطالب
                </th>
                <th 
                  className="px-6 py-4 text-right text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  الدورة
                </th>
                <th 
                  className="px-6 py-4 text-right text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  المبلغ
                </th>
                <th 
                  className="px-6 py-4 text-right text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  طريقة الدفع
                </th>
                <th 
                  className="px-6 py-4 text-right text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  الحالة
                </th>
                <th 
                  className="px-6 py-4 text-right text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  التاريخ
                </th>
                <th 
                  className="px-6 py-4 text-right text-sm font-medium"
                  style={{ color: colors.textMuted }}
                >
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredPayments.map((payment, index) => {
                  const StatusIcon = getStatusIcon(payment.status);
                  const MethodIcon = getPaymentMethodIcon(payment.paymentMethod);
                  
                  return (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-opacity-50 transition-colors"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: index % 2 === 0 ? colors.background + '30' : 'transparent'
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: colors.accent + '20',
                              border: `1px solid ${colors.accent}30`
                            }}
                          >
                            <User size={20} color={colors.accent} />
                          </div>
                          <div>
                            <p 
                              className="font-medium"
                              style={{ color: colors.text }}
                            >
                              {payment.studentId?.name || 'غير محدد'}
                            </p>
                            <p 
                              className="text-sm"
                              style={{ color: colors.textMuted }}
                            >
                              {payment.studentPhone}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: colors.accent + '20',
                              border: `1px solid ${colors.accent}30`
                            }}
                          >
                            <BookOpen size={20} color={colors.accent} />
                          </div>
                          <div>
                            <p 
                              className="font-medium"
                              style={{ color: colors.text }}
                            >
                              {payment.courseId?.title || 'غير محدد'}
                            </p>
                            <p 
                              className="text-sm"
                              style={{ color: colors.textMuted }}
                            >
                              {payment.courseId?.price} ج.م
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <p 
                          className="font-bold text-lg"
                          style={{ color: colors.accent }}
                        >
                          {payment.amount} ج.م
                        </p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MethodIcon size={18} color={colors.textMuted} />
                          <span 
                            className="text-sm"
                            style={{ color: colors.text }}
                          >
                            {payment.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' :
                             payment.paymentMethod === 'credit_card' ? 'Credit Card' :
                             payment.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                             payment.paymentMethod === 'paypal' ? 'PayPal' :
                             payment.paymentMethod === 'stripe' ? 'Stripe' :
                             payment.paymentMethod === 'cash' ? 'Cash' : payment.paymentMethod}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span 
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}
                        >
                          <StatusIcon size={14} />
                          {payment.status === 'pending' ? 'معلق' :
                           payment.status === 'approved' ? 'معتمد' :
                           payment.status === 'rejected' ? 'مرفوض' : payment.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <p 
                          className="text-sm"
                          style={{ color: colors.text }}
                        >
                          {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          {new Date(payment.createdAt).toLocaleTimeString('ar-EG')}
                        </p>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* View Image */}
                          <LuxuryButton
                            variant="outline"
                            size="sm"
                            onClick={() => openImageModal(payment.proofImage)}
                            className="p-2"
                            title="عرض الصورة"
                          >
                            <ImageIcon size={16} />
                          </LuxuryButton>
                          
                          {/* Approve */}
                          {payment.status === 'pending' && (
                            <LuxuryButton
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(payment)}
                              disabled={processing}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="موافقة"
                            >
                              <CheckSquare size={16} />
                            </LuxuryButton>
                          )}
                          
                          {/* Reject */}
                          {payment.status === 'pending' && (
                            <LuxuryButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowRejectModal(true);
                              }}
                              disabled={processing}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="رفض"
                            >
                              <XSquare size={16} />
                            </LuxuryButton>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {filteredPayments.map((payment, index) => {
          const StatusIcon = getStatusIcon(payment.status);
          const MethodIcon = getPaymentMethodIcon(payment.paymentMethod);
          
          return (
            <motion.div
              key={payment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div 
                className="rounded-2xl shadow-lg overflow-hidden"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="p-4">
                  {/* Payment Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: colors.accent + '20',
                          border: `1px solid ${colors.accent}30`
                        }}
                      >
                        <User size={20} color={colors.accent} />
                      </div>
                      <div>
                        <p 
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          {payment.studentId?.firstName} {payment.studentId?.secondName}
                        </p>
                        <p 
                          className="text-sm flex items-center gap-1"
                          style={{ color: colors.textMuted }}
                        >
                          <Phone size={12} />
                          {payment.studentId?.phoneNumber || 'غير محدد'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <StatusIcon size={16} color={getStatusColor(payment.status)} />
                      <span 
                        className="text-sm font-medium"
                        style={{ color: getStatusColor(payment.status) }}
                      >
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-3 mb-4">
                    {/* Course */}
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} color={colors.info} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.text }}>
                          {payment.courseId?.title || 'غير محدد'}
                        </p>
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {payment.courseId?.subject || 'غير محدد'}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} color={colors.accent} />
                      <span className="text-sm font-bold" style={{ color: colors.accent }}>
                        {payment.amount} جنيه
                      </span>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center gap-2">
                      <MethodIcon size={16} color={colors.textMuted} />
                      <span className="text-sm" style={{ color: colors.textMuted }}>
                        {getPaymentMethodText(payment.paymentMethod)}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar size={16} color={colors.textMuted} />
                      <span className="text-sm" style={{ color: colors.textMuted }}>
                        {new Date(payment.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: colors.border }}>
                    <div className="flex items-center gap-2">
                      {/* View Details */}
                      <LuxuryButton
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                        className="p-2"
                      >
                        <Eye size={16} />
                      </LuxuryButton>
                    </div>

                    {/* Status Actions */}
                    {payment.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprovePayment(payment._id)}
                          disabled={processing}
                          className="p-2"
                          style={{
                            borderColor: colors.success + '30',
                            color: colors.success
                          }}
                        >
                          <CheckCircle size={16} />
                        </LuxuryButton>
                        
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRejectModal(true);
                          }}
                          disabled={processing}
                          className="p-2"
                          style={{
                            borderColor: colors.error + '30',
                            color: colors.error
                          }}
                        >
                          <XCircle size={16} />
                        </LuxuryButton>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <LuxuryButton
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="px-4 py-2"
              >
                {page}
              </LuxuryButton>
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedPayment(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-md rounded-2xl shadow-2xl"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="p-6">
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.text }}
                >
                  رفض الدفع
                </h3>
                
                <p 
                  className="text-sm mb-4"
                  style={{ color: colors.textMuted }}
                >
                  يرجى إدخال سبب رفض الدفع للطالب: {selectedPayment?.studentId?.name}
                </p>
                
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="أدخل سبب الرفض..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                />
                
                <div className="flex gap-3 justify-end mt-6">
                  <LuxuryButton
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                      setSelectedPayment(null);
                    }}
                    disabled={processing}
                  >
                    إلغاء
                  </LuxuryButton>
                  <LuxuryButton
                    onClick={handleReject}
                    disabled={processing || !rejectionReason.trim()}
                    className="flex items-center gap-2"
                    style={{
                      backgroundColor: colors.error,
                      color: 'white'
                    }}
                  >
                    {processing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <XCircle size={18} />
                        </motion.div>
                        جاري الرفض...
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        رفض الدفع
                      </>
                    )}
                  </LuxuryButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Payment proof"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedPaymentApprovalDashboard;
