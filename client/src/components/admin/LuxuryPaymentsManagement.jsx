import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../contexts/AuthContext';
import LuxuryCard from '../ui/LuxuryCard';
import LuxuryButton from '../ui/LuxuryButton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  DollarSign,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

const LuxuryPaymentsManagement = ({ payments, onRefresh }) => {
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  const { showSuccess, showError, showInfo } = useNotification();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const paymentsData = payments?.data || payments || [];

  // Filter and search payments
  const filteredPayments = paymentsData.filter(payment => {
    const matchesSearch = 
      payment.studentId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId?.secondName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleApprovePayment = async (paymentId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/orders/${paymentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(
          "✅ تم تفعيل الكورس بنجاح",
          "تم تأكيد الدفع وتفعيل الدورة للطالب. يمكن للطالب الآن الوصول لجميع محتويات الدورة."
        );
        
        // Refresh payments list
        if (onRefresh) {
          onRefresh();
        }
        
        setShowApprovalModal(false);
        setSelectedPayment(null);
      } else {
        throw new Error(data.error || 'Failed to approve payment');
      }
    } catch (error) {
      console.error('Failed to approve payment:', error);
      showError(
        "❌ خطأ في تأكيد الدفع",
        error.message || "حدث خطأ أثناء تأكيد الدفع"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/payment-proofs/${paymentId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(
          "تم رفض الدفع",
          "تم رفض الدفع وإشعار الطالب بالسبب"
        );
        
        if (onRefresh) {
          onRefresh();
        }
        
        setShowRejectionModal(false);
        setSelectedPayment(null);
        setRejectionReason('');
      } else {
        throw new Error(data.error || 'Failed to reject payment');
      }
    } catch (error) {
      console.error('Failed to reject payment:', error);
      showError(
        "خطأ في رفض الدفع",
        error.message || "حدث خطأ أثناء رفض الدفع"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const PaymentCard = ({ payment }) => (
    <LuxuryCard 
      variant="elevated" 
      className="payment-card"
      style={{ marginBottom: spacing.lg }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <div style={{
              background: getStatusColor(payment.status),
              color: colors.background,
              padding: spacing.xs,
              borderRadius: borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getStatusIcon(payment.status)}
            </div>
            <span style={{
              color: getStatusColor(payment.status),
              fontWeight: typography.fontWeight.semibold,
              textTransform: 'uppercase',
              fontSize: typography.fontSize.sm
            }}>
              {payment.status === 'approved' ? 'موافق عليه' : 
               payment.status === 'rejected' ? 'مرفوض' : 'في الانتظار'}
            </span>
          </div>
          
          <h3 style={{
            color: colors.text,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.bold,
            margin: 0,
            marginBottom: spacing.sm
          }}>
            {payment.courseId?.title || 'دورة غير محددة'}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <User size={16} color={colors.textSecondary} />
            <span style={{ color: colors.textSecondary }}>
              {payment.studentId?.firstName} {payment.studentId?.secondName}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
            <DollarSign size={16} color={colors.textSecondary} />
            <span style={{ color: colors.textSecondary }}>
              {payment.amount} جنيه
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <Clock size={16} color={colors.textSecondary} />
            <span style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
              {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
            </span>
          </div>
        </div>
        
        {payment.proofImage && (
          <div style={{ marginLeft: spacing.lg }}>
            <img 
              src={payment.proofImage} 
              alt="Payment Proof"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: borderRadius.md,
                border: `2px solid ${colors.border}`
              }}
            />
          </div>
        )}
      </div>
      
      {payment.status === 'pending' && (
        <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
          <LuxuryButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedPayment(payment);
              setShowRejectionModal(true);
            }}
            disabled={loading}
          >
            <XCircle size={16} />
            رفض
          </LuxuryButton>
          
          <LuxuryButton
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedPayment(payment);
              setShowApprovalModal(true);
            }}
            disabled={loading}
          >
            <CheckCircle size={16} />
            موافقة
          </LuxuryButton>
        </div>
      )}
    </LuxuryCard>
  );

  return (
    <div style={{ padding: spacing.xl }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['2xl'] }}>
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
          إدارة المدفوعات
        </h1>
        <p style={{
          color: colors.textSecondary,
          fontSize: typography.fontSize.lg,
          margin: 0
        }}>
          مراجعة وموافقة على طلبات الدفع للدورات
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: spacing.lg,
        marginBottom: spacing['2xl']
      }}>
        <LuxuryCard variant="accent">
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div style={{
              background: colors.accent,
              color: colors.background,
              padding: spacing.md,
              borderRadius: borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: colors.text, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>
                {paymentsData.filter(p => p.status === 'pending').length}
              </h3>
              <p style={{ margin: 0, color: colors.textSecondary }}>في الانتظار</p>
            </div>
          </div>
        </LuxuryCard>

        <LuxuryCard variant="default">
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div style={{
              background: colors.success,
              color: colors.background,
              padding: spacing.md,
              borderRadius: borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: colors.text, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>
                {paymentsData.filter(p => p.status === 'approved').length}
              </h3>
              <p style={{ margin: 0, color: colors.textSecondary }}>موافق عليها</p>
            </div>
          </div>
        </LuxuryCard>

        <LuxuryCard variant="default">
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div style={{
              background: colors.error,
              color: colors.background,
              padding: spacing.md,
              borderRadius: borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <XCircle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: colors.text, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>
                {paymentsData.filter(p => p.status === 'rejected').length}
              </h3>
              <p style={{ margin: 0, color: colors.textSecondary }}>مرفوضة</p>
            </div>
          </div>
        </LuxuryCard>
      </div>

      {/* Filters and Search */}
      <LuxuryCard style={{ marginBottom: spacing.lg }}>
        <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: spacing.md, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: colors.textMuted
              }} 
            />
            <input
              type="text"
              placeholder="البحث في المدفوعات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing.md} ${spacing.md} ${spacing.md} ${spacing['2xl']}`,
                border: `2px solid ${colors.border}`,
                borderRadius: borderRadius.lg,
                background: colors.surface,
                color: colors.text,
                fontSize: typography.fontSize.base,
                outline: 'none',
                transition: `border-color ${animations.duration.fast} ${animations.easing.easeInOut}`
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: spacing.md,
              border: `2px solid ${colors.border}`,
              borderRadius: borderRadius.lg,
              background: colors.surface,
              color: colors.text,
              fontSize: typography.fontSize.base,
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="approved">موافق عليها</option>
            <option value="rejected">مرفوضة</option>
          </select>
          
          <LuxuryButton
            variant="ghost"
            size="md"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} />
            تحديث
          </LuxuryButton>
        </div>
      </LuxuryCard>

      {/* Payments List */}
      <AnimatePresence>
        {filteredPayments.map((payment) => (
          <motion.div
            key={payment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PaymentCard payment={payment} />
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredPayments.length === 0 && (
        <LuxuryCard variant="glass" style={{ textAlign: 'center', padding: spacing['2xl'] }}>
          <BookOpen size={48} color={colors.textMuted} style={{ marginBottom: spacing.lg }} />
          <h3 style={{ color: colors.textMuted, margin: 0, marginBottom: spacing.sm }}>
            لا توجد مدفوعات
          </h3>
          <p style={{ color: colors.textMuted, margin: 0 }}>
            {searchTerm || filterStatus !== 'all' 
              ? 'لا توجد نتائج تطابق البحث أو الفلتر المحدد'
              : 'لم يتم العثور على أي مدفوعات حتى الآن'
            }
          </p>
        </LuxuryCard>
      )}

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && selectedPayment && (
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
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: spacing.lg
            }}
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: colors.surface,
                borderRadius: borderRadius.xl,
                padding: spacing['2xl'],
                maxWidth: '500px',
                width: '100%',
                boxShadow: shadows['2xl']
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                color: colors.text,
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                margin: 0,
                marginBottom: spacing.lg,
                textAlign: 'center'
              }}>
                تأكيد الموافقة على الدفع
              </h2>
              
              <p style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.base,
                margin: 0,
                marginBottom: spacing['2xl'],
                textAlign: 'center',
                lineHeight: 1.6
              }}>
                هل أنت متأكد من الموافقة على دفع الطالب <strong>{selectedPayment.studentId?.firstName} {selectedPayment.studentId?.secondName}</strong> 
                {' '}لدورة <strong>{selectedPayment.courseId?.title}</strong>؟
              </p>
              
              <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}>
                <LuxuryButton
                  variant="secondary"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={loading}
                >
                  إلغاء
                </LuxuryButton>
                
                <LuxuryButton
                  variant="primary"
                  onClick={() => handleApprovePayment(selectedPayment._id)}
                  loading={loading}
                >
                  <CheckCircle size={16} />
                  تأكيد الموافقة
                </LuxuryButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectionModal && selectedPayment && (
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
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: spacing.lg
            }}
            onClick={() => setShowRejectionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: colors.surface,
                borderRadius: borderRadius.xl,
                padding: spacing['2xl'],
                maxWidth: '500px',
                width: '100%',
                boxShadow: shadows['2xl']
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{
                color: colors.text,
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                margin: 0,
                marginBottom: spacing.lg,
                textAlign: 'center'
              }}>
                رفض الدفع
              </h2>
              
              <p style={{
                color: colors.textSecondary,
                fontSize: typography.fontSize.base,
                margin: 0,
                marginBottom: spacing.lg,
                textAlign: 'center'
              }}>
                يرجى إدخال سبب رفض الدفع:
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="أدخل سبب رفض الدفع..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: spacing.md,
                  border: `2px solid ${colors.border}`,
                  borderRadius: borderRadius.lg,
                  background: colors.background,
                  color: colors.text,
                  fontSize: typography.fontSize.base,
                  outline: 'none',
                  resize: 'vertical',
                  marginBottom: spacing.lg,
                  fontFamily: typography.fontFamily.body
                }}
                onFocus={(e) => e.target.style.borderColor = colors.accent}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
              
              <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}>
                <LuxuryButton
                  variant="secondary"
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                  }}
                  disabled={loading}
                >
                  إلغاء
                </LuxuryButton>
                
                <LuxuryButton
                  variant="danger"
                  onClick={() => handleRejectPayment(selectedPayment._id, rejectionReason)}
                  loading={loading}
                  disabled={!rejectionReason.trim()}
                >
                  <XCircle size={16} />
                  رفض الدفع
                </LuxuryButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuxuryPaymentsManagement;
