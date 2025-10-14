import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { 
  fetchStudentPayments, 
  fetchStudentPaymentStats,
  fetchPaymentById 
} from '../../store/slices/paymentSlice';
import paymentService from '../../services/paymentService';
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
  Image as ImageIcon,
  Upload,
  Plus,
  History,
  BarChart3
} from 'lucide-react';

const StudentPaymentStatus = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  // Redux state
  const { 
    studentPayments, 
    paymentStats, 
    loading, 
    error 
  } = useSelector(state => state.payment);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    dispatch(fetchStudentPayments({ page: currentPage, status: filterStatus }));
    dispatch(fetchStudentPaymentStats());
  }, [dispatch, currentPage, filterStatus]);

  const handleViewPayment = async (paymentId) => {
    try {
      const result = await dispatch(fetchPaymentById(paymentId)).unwrap();
      setSelectedPayment(result);
      setShowPaymentModal(true);
    } catch (error) {
      toast({
        title: "❌ خطأ في جلب البيانات",
        description: "فشل في جلب تفاصيل الدفع",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    dispatch(fetchStudentPayments({ page: currentPage, status: filterStatus }));
    dispatch(fetchStudentPaymentStats());
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

  const filteredPayments = studentPayments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.senderPhone?.includes(searchTerm);
    
    return matchesSearch;
  });

  if (loading && studentPayments.length === 0) {
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
            حالة المدفوعات
          </h1>
          <p 
            className="text-lg"
            style={{ color: colors.textMuted }}
          >
            تتبع حالة مدفوعاتك وإثباتات الدفع
          </p>
        </div>
        
        <div className="flex gap-3">
          <LuxuryButton
            onClick={() => setShowStatsModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 size={18} />
            الإحصائيات
          </LuxuryButton>
          <LuxuryButton
            onClick={handleRefresh}
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
      {paymentStats && (
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
                  {paymentStats.totalPayments || 0}
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
                  {paymentStats.pendingPayments || 0}
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
                  {paymentStats.approvedPayments || 0}
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
                  {paymentStats.totalAmount?.toFixed(0) || 0} ج.م
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Refresh Button */}
          <LuxuryButton
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            تحديث
          </LuxuryButton>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredPayments.map((payment, index) => {
            const StatusIcon = getStatusIcon(payment.status);
            const MethodIcon = getPaymentMethodIcon(payment.paymentMethod);
            
            return (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl shadow-lg"
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Payment Info */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Course Info */}
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: colors.accent + '20',
                            border: `1px solid ${colors.accent}30`
                          }}
                        >
                          <BookOpen size={24} color={colors.accent} />
                        </div>
                        <div>
                          <p 
                            className="font-semibold"
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

                      {/* Amount & Method */}
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: colors.accent + '20',
                            border: `1px solid ${colors.accent}30`
                          }}
                        >
                          <MethodIcon size={24} color={colors.accent} />
                        </div>
                        <div>
                          <p 
                            className="font-bold text-lg"
                            style={{ color: colors.accent }}
                          >
                            {payment.amount} ج.م
                          </p>
                          <p 
                            className="text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            {payment.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' :
                             payment.paymentMethod === 'credit_card' ? 'Credit Card' :
                             payment.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                             payment.paymentMethod === 'paypal' ? 'PayPal' :
                             payment.paymentMethod === 'stripe' ? 'Stripe' :
                             payment.paymentMethod === 'cash' ? 'Cash' : payment.paymentMethod}
                          </p>
                        </div>
                      </div>

                      {/* Status & Date */}
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: colors.accent + '20',
                            border: `1px solid ${colors.accent}30`
                          }}
                        >
                          <StatusIcon size={24} color={colors.accent} />
                        </div>
                        <div>
                          <span 
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}
                          >
                            <StatusIcon size={14} />
                            {payment.status === 'pending' ? 'معلق' :
                             payment.status === 'approved' ? 'معتمد' :
                             payment.status === 'rejected' ? 'مرفوض' : payment.status}
                          </span>
                          <p 
                            className="text-sm mt-1"
                            style={{ color: colors.textMuted }}
                          >
                            {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <LuxuryButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPayment(payment._id)}
                      className="flex items-center gap-2"
                    >
                      <Eye size={16} />
                      تفاصيل
                    </LuxuryButton>
                    
                    {payment.proofImage && (
                      <LuxuryButton
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(payment.proofImage, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon size={16} />
                        الصورة
                      </LuxuryButton>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: colors.accent + '20',
              border: `2px solid ${colors.accent}30`
            }}
          >
            <History size={48} color={colors.accent} />
          </div>
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            لا توجد مدفوعات
          </h3>
          <p 
            className="text-lg"
            style={{ color: colors.textMuted }}
          >
            لم تقم بإرسال أي إثباتات دفع بعد
          </p>
        </motion.div>
      )}

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-2xl rounded-2xl shadow-2xl"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    تفاصيل الدفع
                  </h3>
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2"
                  >
                    <X size={20} />
                  </LuxuryButton>
                </div>

                <div className="space-y-6">
                  {/* Course Info */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <h4 
                      className="text-lg font-semibold mb-3 flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <BookOpen size={20} color={colors.accent} />
                      معلومات الدورة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: colors.textMuted }}
                        >
                          عنوان الدورة
                        </p>
                        <p 
                          className="text-lg"
                          style={{ color: colors.text }}
                        >
                          {selectedPayment.courseId?.title || 'غير محدد'}
                        </p>
                      </div>
                      <div>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: colors.textMuted }}
                        >
                          المبلغ
                        </p>
                        <p 
                          className="text-lg font-bold"
                          style={{ color: colors.accent }}
                        >
                          {selectedPayment.amount} ج.م
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <h4 
                      className="text-lg font-semibold mb-3 flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <CreditCard size={20} color={colors.accent} />
                      تفاصيل الدفع
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: colors.textMuted }}
                        >
                          طريقة الدفع
                        </p>
                        <p 
                          className="text-lg"
                          style={{ color: colors.text }}
                        >
                          {selectedPayment.paymentMethod === 'vodafone_cash' ? 'Vodafone Cash' :
                           selectedPayment.paymentMethod === 'credit_card' ? 'Credit Card' :
                           selectedPayment.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
                           selectedPayment.paymentMethod === 'paypal' ? 'PayPal' :
                           selectedPayment.paymentMethod === 'stripe' ? 'Stripe' :
                           selectedPayment.paymentMethod === 'cash' ? 'Cash' : selectedPayment.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: colors.textMuted }}
                        >
                          رقم المرسل
                        </p>
                        <p 
                          className="text-lg"
                          style={{ color: colors.text }}
                        >
                          {selectedPayment.senderPhone}
                        </p>
                      </div>
                      <div>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: colors.textMuted }}
                        >
                          وقت التحويل
                        </p>
                        <p 
                          className="text-lg"
                          style={{ color: colors.text }}
                        >
                          {new Date(selectedPayment.transferTime).toLocaleString('ar-EG')}
                        </p>
                      </div>
                      <div>
                        <p 
                          className="text-sm font-medium"
                          style={{ color: colors.textMuted }}
                        >
                          تاريخ الإرسال
                        </p>
                        <p 
                          className="text-lg"
                          style={{ color: colors.text }}
                        >
                          {new Date(selectedPayment.createdAt).toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div 
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <h4 
                      className="text-lg font-semibold mb-3 flex items-center gap-2"
                      style={{ color: colors.text }}
                    >
                      <CheckCircle size={20} color={colors.accent} />
                      حالة الدفع
                    </h4>
                    <div className="flex items-center gap-3">
                      <span 
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedPayment.status)}`}
                      >
                        <StatusIcon size={16} />
                        {selectedPayment.status === 'pending' ? 'في الانتظار' :
                         selectedPayment.status === 'approved' ? 'معتمد' :
                         selectedPayment.status === 'rejected' ? 'مرفوض' : selectedPayment.status}
                      </span>
                      
                      {selectedPayment.status === 'approved' && selectedPayment.approvedAt && (
                        <p 
                          className="text-sm"
                          style={{ color: colors.textMuted }}
                        >
                          تم الاعتماد في: {new Date(selectedPayment.approvedAt).toLocaleString('ar-EG')}
                        </p>
                      )}
                      
                      {selectedPayment.status === 'rejected' && selectedPayment.rejectedAt && (
                        <div>
                          <p 
                            className="text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            تم الرفض في: {new Date(selectedPayment.rejectedAt).toLocaleString('ar-EG')}
                          </p>
                          {selectedPayment.rejectionReason && (
                            <p 
                              className="text-sm mt-1"
                              style={{ color: colors.error }}
                            >
                              سبب الرفض: {selectedPayment.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proof Image */}
                  {selectedPayment.proofImage && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <h4 
                        className="text-lg font-semibold mb-3 flex items-center gap-2"
                        style={{ color: colors.text }}
                      >
                        <ImageIcon size={20} color={colors.accent} />
                        صورة إثبات الدفع
                      </h4>
                      <div className="flex justify-center">
                        <img
                          src={selectedPayment.proofImage}
                          alt="Payment proof"
                          className="max-w-full h-64 object-contain rounded-lg shadow-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStatsModal && paymentStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowStatsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-2xl rounded-2xl shadow-2xl"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    إحصائيات المدفوعات
                  </h3>
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStatsModal(false)}
                    className="p-2"
                  >
                    <X size={20} />
                  </LuxuryButton>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div 
                    className="p-4 rounded-xl text-center"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <p 
                      className="text-3xl font-bold"
                      style={{ color: colors.accent }}
                    >
                      {paymentStats.totalPayments || 0}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      إجمالي المدفوعات
                    </p>
                  </div>

                  <div 
                    className="p-4 rounded-xl text-center"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <p 
                      className="text-3xl font-bold"
                      style={{ color: colors.accent }}
                    >
                      {paymentStats.approvedPayments || 0}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      مدفوعات معتمدة
                    </p>
                  </div>

                  <div 
                    className="p-4 rounded-xl text-center"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <p 
                      className="text-3xl font-bold"
                      style={{ color: colors.warning }}
                    >
                      {paymentStats.pendingPayments || 0}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      مدفوعات معلقة
                    </p>
                  </div>

                  <div 
                    className="p-4 rounded-xl text-center"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <p 
                      className="text-3xl font-bold"
                      style={{ color: colors.accent }}
                    >
                      {paymentStats.totalAmount?.toFixed(0) || 0}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      إجمالي المبلغ (ج.م)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentPaymentStatus;
