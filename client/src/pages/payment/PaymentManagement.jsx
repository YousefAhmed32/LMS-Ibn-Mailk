import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import EnhancedPaymentProofUpload from '../../components/payment/EnhancedPaymentProofUpload';
import PaymentGatewayIntegration from '../../components/payment/PaymentGatewayIntegration';
import StudentPaymentStatus from '../../components/payment/StudentPaymentStatus';
import LuxuryButton from '../../components/ui/LuxuryButton';
import { 
  CreditCard,
  Upload,
  History,
  BarChart3,
  X,
  Plus
} from 'lucide-react';

const PaymentManagement = () => {
  const theme = useTheme();
  const { colors } = theme;
  
  const [activeTab, setActiveTab] = useState('status');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const tabs = [
    { id: 'status', label: 'حالة المدفوعات', icon: History },
    { id: 'upload', label: 'رفع إثبات الدفع', icon: Upload },
    { id: 'gateway', label: 'الدفع المباشر', icon: CreditCard }
  ];

  const handleUploadSuccess = (result) => {
    setShowUploadModal(false);
    setSelectedCourse(null);
    // Refresh payment status
  };

  const handleGatewaySuccess = (result) => {
    setShowGatewayModal(false);
    setSelectedCourse(null);
    // Handle gateway payment success
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ color: colors.text }}
            >
              إدارة المدفوعات
            </h1>
            <p 
              className="text-xl"
              style={{ color: colors.textMuted }}
            >
              تتبع مدفوعاتك وإدارة إثباتات الدفع
            </p>
          </div>
          
          <div className="flex gap-3">
            <LuxuryButton
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`
              }}
            >
              <Plus size={18} />
              رفع إثبات دفع
            </LuxuryButton>
            
            <LuxuryButton
              onClick={() => setShowGatewayModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CreditCard size={18} />
              دفع مباشر
            </LuxuryButton>
          </div>
        </div>

        {/* Tabs */}
        <div 
          className="flex flex-wrap gap-2 mb-8 p-2 rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}
        >
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id ? 'shadow-lg' : ''
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? colors.accent : 'transparent',
                  color: activeTab === tab.id ? 'white' : colors.text,
                  border: `1px solid ${activeTab === tab.id ? colors.accent : 'transparent'}`
                }}
              >
                <TabIcon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'status' && <StudentPaymentStatus />}
            {activeTab === 'upload' && (
              <div className="text-center py-12">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: colors.accent + '20',
                    border: `2px solid ${colors.accent}30`
                  }}
                >
                  <Upload size={48} color={colors.accent} />
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  رفع إثبات الدفع
                </h3>
                <p 
                  className="text-lg mb-6"
                  style={{ color: colors.textMuted }}
                >
                  انقر على الزر أعلاه لرفع إثبات دفع جديد
                </p>
                <LuxuryButton
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`
                  }}
                >
                  <Plus size={18} />
                  رفع إثبات دفع
                </LuxuryButton>
              </div>
            )}
            {activeTab === 'gateway' && (
              <div className="text-center py-12">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: colors.accent + '20',
                    border: `2px solid ${colors.accent}30`
                  }}
                >
                  <CreditCard size={48} color={colors.accent} />
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  الدفع المباشر
                </h3>
                <p 
                  className="text-lg mb-6"
                  style={{ color: colors.textMuted }}
                >
                  انقر على الزر أعلاه للدفع المباشر عبر البطاقات الائتمانية
                </p>
                <LuxuryButton
                  onClick={() => setShowGatewayModal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CreditCard size={18} />
                  دفع مباشر
                </LuxuryButton>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUploadModal(false);
                setSelectedCourse(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <EnhancedPaymentProofUpload
                courseId={selectedCourse?.id}
                courseTitle={selectedCourse?.title || 'دورة جديدة'}
                coursePrice={selectedCourse?.price || 0}
                onSuccess={handleUploadSuccess}
                onCancel={() => {
                  setShowUploadModal(false);
                  setSelectedCourse(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gateway Modal */}
      <AnimatePresence>
        {showGatewayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowGatewayModal(false);
                setSelectedCourse(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <PaymentGatewayIntegration
                courseId={selectedCourse?.id}
                courseTitle={selectedCourse?.title || 'دورة جديدة'}
                coursePrice={selectedCourse?.price || 0}
                onSuccess={handleGatewaySuccess}
                onCancel={() => {
                  setShowGatewayModal(false);
                  setSelectedCourse(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentManagement;
