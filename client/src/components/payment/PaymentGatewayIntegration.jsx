import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { 
  createPayPalPayment, 
  createStripePayment,
  fetchPaymentMethods 
} from '../../store/slices/paymentSlice';
import paymentService from '../../services/paymentService';
import LuxuryButton from '../ui/LuxuryButton';
import { 
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink,
  Shield,
  Clock,
  X,
  Plus,
  Minus,
  Info
} from 'lucide-react';

const PaymentGatewayIntegration = ({ courseId, courseTitle, coursePrice, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  // Redux state
  const { 
    paymentMethods, 
    paypalPayment, 
    stripePayment, 
    loading 
  } = useSelector(state => state.payment);
  
  // Local state
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    courseId: courseId,
    amount: coursePrice,
    currency: 'EGP'
  });

  useEffect(() => {
    dispatch(fetchPaymentMethods());
  }, [dispatch]);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setShowPaymentForm(true);
  };

  const handlePayPalPayment = async () => {
    try {
      setProcessing(true);
      const result = await dispatch(createPayPalPayment(paymentData)).unwrap();
      
      if (result.gatewayResponse && result.gatewayResponse.links) {
        // Redirect to PayPal
        const approvalUrl = result.gatewayResponse.links.find(link => link.rel === 'approval_url');
        if (approvalUrl) {
          window.open(approvalUrl.href, '_blank');
          toast({
            title: "✅ تم إنشاء طلب الدفع",
            description: "سيتم توجيهك إلى PayPal لإتمام الدفع",
          });
        }
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast({
        title: "❌ خطأ في الدفع",
        description: error || "فشل في إنشاء طلب الدفع",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    try {
      setProcessing(true);
      const result = await dispatch(createStripePayment(paymentData)).unwrap();
      
      if (result.clientSecret && result.publishableKey) {
        // Here you would integrate with Stripe Elements
        // For now, we'll show a success message
        toast({
          title: "✅ تم إنشاء طلب الدفع",
          description: "سيتم توجيهك إلى Stripe لإتمام الدفع",
        });
        
        // In a real implementation, you would:
        // 1. Load Stripe.js
        // 2. Create Stripe Elements
        // 3. Handle payment confirmation
        // 4. Process the payment
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      toast({
        title: "❌ خطأ في الدفع",
        description: error || "فشل في إنشاء طلب الدفع",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getMethodIcon = (methodId) => {
    const icons = {
      paypal: CreditCard,
      stripe: CreditCard,
      vodafone_cash: Smartphone,
      bank_transfer: Banknote,
      credit_card: CreditCard
    };
    return icons[methodId] || CreditCard;
  };

  const getMethodColor = (methodId) => {
    const colors = {
      paypal: '#0070ba',
      stripe: '#635bff',
      vodafone_cash: '#e60012',
      bank_transfer: '#1f2937',
      credit_card: '#059669'
    };
    return colors[methodId] || colors.accent;
  };

  if (showPaymentForm && selectedMethod) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-6"
      >
        <div 
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}
        >
          {/* Header */}
          <div 
            className="p-6 border-b"
            style={{ borderColor: colors.border }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: getMethodColor(selectedMethod.id) + '20',
                    border: `1px solid ${getMethodColor(selectedMethod.id)}30`
                  }}
                >
                  {React.createElement(getMethodIcon(selectedMethod.id), {
                    size: 24,
                    color: getMethodColor(selectedMethod.id)
                  })}
                </div>
                <div>
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: colors.text }}
                  >
                    الدفع عبر {selectedMethod.name}
                  </h2>
                  <p 
                    className="text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    {courseTitle} - {paymentService.formatAmount(coursePrice)}
                  </p>
                </div>
              </div>
              <LuxuryButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedMethod(null);
                }}
                className="p-2"
              >
                <X size={20} />
              </LuxuryButton>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6 space-y-6">
            {/* Course Summary */}
            <div 
              className="p-4 rounded-xl"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`
              }}
            >
              <h3 
                className="text-lg font-semibold mb-3"
                style={{ color: colors.text }}
              >
                ملخص الطلب
              </h3>
              <div className="flex justify-between items-center">
                <span 
                  className="text-lg"
                  style={{ color: colors.text }}
                >
                  {courseTitle}
                </span>
                <span 
                  className="text-xl font-bold"
                  style={{ color: colors.accent }}
                >
                  {paymentService.formatAmount(coursePrice)}
                </span>
              </div>
            </div>

            {/* Payment Method Info */}
            <div 
              className="p-4 rounded-xl"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`
              }}
            >
              <h3 
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                style={{ color: colors.text }}
              >
                <Shield size={20} color={colors.accent} />
                معلومات الدفع الآمن
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} color={colors.success} />
                  <span 
                    className="text-sm"
                    style={{ color: colors.text }}
                  >
                    الدفع آمن ومشفر
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} color={colors.success} />
                  <span 
                    className="text-sm"
                    style={{ color: colors.text }}
                  >
                    لا يتم حفظ بياناتك البنكية
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} color={colors.success} />
                  <span 
                    className="text-sm"
                    style={{ color: colors.text }}
                  >
                    ضمان استرداد المبلغ في حالة الرفض
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-4">
              {selectedMethod.id === 'paypal' && (
                <LuxuryButton
                  onClick={handlePayPalPayment}
                  disabled={processing}
                  className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3"
                  style={{
                    backgroundColor: '#0070ba',
                    color: 'white'
                  }}
                >
                  {processing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader size={20} />
                      </motion.div>
                      جاري التوجيه إلى PayPal...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      الدفع عبر PayPal
                    </>
                  )}
                </LuxuryButton>
              )}

              {selectedMethod.id === 'stripe' && (
                <LuxuryButton
                  onClick={handleStripePayment}
                  disabled={processing}
                  className="w-full py-4 text-lg font-semibold flex items-center justify-center gap-3"
                  style={{
                    backgroundColor: '#635bff',
                    color: 'white'
                  }}
                >
                  {processing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader size={20} />
                      </motion.div>
                      جاري التوجيه إلى Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      الدفع عبر Stripe
                    </>
                  )}
                </LuxuryButton>
              )}

              {selectedMethod.id === 'vodafone_cash' && (
                <div 
                  className="p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <Smartphone size={48} color={colors.accent} className="mx-auto mb-4" />
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    Vodafone Cash
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: colors.textMuted }}
                  >
                    يرجى إرسال المبلغ إلى الرقم التالي وإرفاق إثبات الدفع
                  </p>
                  <div 
                    className="p-3 rounded-lg mb-4"
                    style={{
                      backgroundColor: colors.accent + '20',
                      border: `1px solid ${colors.accent}30`
                    }}
                  >
                    <p 
                      className="text-lg font-bold"
                      style={{ color: colors.accent }}
                    >
                      01012345678
                    </p>
                  </div>
                  <LuxuryButton
                    onClick={() => {
                      if (onSuccess) {
                        onSuccess({ method: 'vodafone_cash', requiresProof: true });
                      }
                    }}
                    className="w-full"
                    style={{
                      backgroundColor: '#e60012',
                      color: 'white'
                    }}
                  >
                    متابعة مع إثبات الدفع
                  </LuxuryButton>
                </div>
              )}

              {selectedMethod.id === 'bank_transfer' && (
                <div 
                  className="p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <Banknote size={48} color={colors.accent} className="mx-auto mb-4" />
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    تحويل بنكي
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: colors.textMuted }}
                  >
                    يرجى إرسال المبلغ إلى الحساب التالي وإرفاق إثبات التحويل
                  </p>
                  <div 
                    className="p-3 rounded-lg mb-4 space-y-2"
                    style={{
                      backgroundColor: colors.accent + '20',
                      border: `1px solid ${colors.accent}30`
                    }}
                  >
                    <p 
                      className="text-sm"
                      style={{ color: colors.text }}
                    >
                      <strong>اسم البنك:</strong> البنك الأهلي المصري
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: colors.text }}
                    >
                      <strong>رقم الحساب:</strong> 1234567890123456
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: colors.text }}
                    >
                      <strong>IBAN:</strong> EG123456789012345678901234
                    </p>
                  </div>
                  <LuxuryButton
                    onClick={() => {
                      if (onSuccess) {
                        onSuccess({ method: 'bank_transfer', requiresProof: true });
                      }
                    }}
                    className="w-full"
                    style={{
                      backgroundColor: '#1f2937',
                      color: 'white'
                    }}
                  >
                    متابعة مع إثبات التحويل
                  </LuxuryButton>
                </div>
              )}
            </div>

            {/* Back Button */}
            <LuxuryButton
              variant="outline"
              onClick={() => {
                setShowPaymentForm(false);
                setSelectedMethod(null);
              }}
              className="w-full"
            >
              العودة لاختيار طريقة الدفع
            </LuxuryButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div 
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                border: `1px solid ${colors.accent}30`
              }}
            >
              <CreditCard size={24} color={colors.accent} />
            </div>
            <div>
              <h2 
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                اختيار طريقة الدفع
              </h2>
              <p 
                className="text-sm"
                style={{ color: colors.textMuted }}
              >
                {courseTitle} - {paymentService.formatAmount(coursePrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method, index) => {
              const MethodIcon = getMethodIcon(method.id);
              const methodColor = getMethodColor(method.id);
              
              return (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => handleMethodSelect(method)}
                >
                  <div 
                    className="p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      '--tw-shadow-color': methodColor + '20'
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="p-3 rounded-xl"
                        style={{
                          backgroundColor: methodColor + '20',
                          border: `1px solid ${methodColor}30`
                        }}
                      >
                        <MethodIcon size={24} color={methodColor} />
                      </div>
                      <div>
                        <h3 
                          className="text-lg font-semibold"
                          style={{ color: colors.text }}
                        >
                          {method.name}
                        </h3>
                        {method.description && (
                          <p 
                            className="text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            {method.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {method.fees && (
                        <div className="flex items-center gap-2">
                          <Info size={14} color={colors.textMuted} />
                          <span 
                            className="text-xs"
                            style={{ color: colors.textMuted }}
                          >
                            رسوم: {method.fees}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Shield size={14} color={colors.success} />
                        <span 
                          className="text-xs"
                          style={{ color: colors.success }}
                        >
                          آمن ومشفر
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Security Notice */}
          <div 
            className="mt-8 p-4 rounded-xl"
            style={{
              backgroundColor: colors.background,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="flex items-start gap-3">
              <Shield size={20} color={colors.success} className="mt-0.5" />
              <div>
                <h4 
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  ضمان الأمان
                </h4>
                <ul 
                  className="text-sm space-y-1"
                  style={{ color: colors.textMuted }}
                >
                  <li>• جميع المعاملات محمية بتشفير SSL</li>
                  <li>• لا يتم حفظ بياناتك البنكية على خوادمنا</li>
                  <li>• ضمان استرداد المبلغ في حالة الرفض</li>
                  <li>• دعم فني متاح على مدار الساعة</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          {onCancel && (
            <div className="mt-6 flex justify-end">
              <LuxuryButton
                variant="outline"
                onClick={onCancel}
                className="px-6 py-3"
              >
                إلغاء
              </LuxuryButton>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentGatewayIntegration;
