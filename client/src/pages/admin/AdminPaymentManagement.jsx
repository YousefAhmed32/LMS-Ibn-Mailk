import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import EnhancedPaymentApprovalDashboard from '../../components/admin/EnhancedPaymentApprovalDashboard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import { toast } from '../../hooks/use-toast';
import { 
  CreditCard,
  BarChart3,
  Users,
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

const AdminPaymentManagement = () => {
  const theme = useTheme();
  const { colors } = theme;
  
  const [activeTab, setActiveTab] = useState('approvals');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const tabs = [
    { id: 'approvals', label: 'موافقات المدفوعات', icon: CheckCircle },
    { id: 'statistics', label: 'الإحصائيات', icon: BarChart3 },
    { id: 'reports', label: 'التقارير', icon: TrendingUp }
  ];

  // بيانات المدفوعات للتصدير
  const paymentData = [
    { id: 1, studentName: 'أحمد محمد علي', amount: 500, status: 'معتمد', date: '2024-01-15', method: 'فودافون كاش' },
    { id: 2, studentName: 'فاطمة أحمد حسن', amount: 750, status: 'معلق', date: '2024-01-16', method: 'بنك' },
    { id: 3, studentName: 'محمد علي إبراهيم', amount: 600, status: 'معتمد', date: '2024-01-17', method: 'فودافون كاش' },
    { id: 4, studentName: 'نور الدين محمد', amount: 800, status: 'مرفوض', date: '2024-01-18', method: 'بنك' },
    { id: 5, studentName: 'سارة أحمد محمود', amount: 450, status: 'معتمد', date: '2024-01-19', method: 'فودافون كاش' },
    { id: 6, studentName: 'يوسف محمد علي', amount: 700, status: 'معلق', date: '2024-01-20', method: 'بنك' },
    { id: 7, studentName: 'مريم أحمد حسن', amount: 550, status: 'معتمد', date: '2024-01-21', method: 'فودافون كاش' },
    { id: 8, studentName: 'عبدالله محمد إبراهيم', amount: 900, status: 'مرفوض', date: '2024-01-22', method: 'بنك' },
    { id: 9, studentName: 'زينب أحمد محمود', amount: 650, status: 'معتمد', date: '2024-01-23', method: 'فودافون كاش' },
    { id: 10, studentName: 'خالد محمد علي', amount: 750, status: 'معلق', date: '2024-01-24', method: 'بنك' }
  ];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // دالة تصدير البيانات بصيغة CSV
  const exportToCSV = () => {
    setIsExporting(true);
    
    const headers = ['رقم الطالب', 'اسم الطالب', 'المبلغ', 'الحالة', 'التاريخ', 'طريقة الدفع'];
    const csvContent = [
      headers.join(','),
      ...paymentData.map(row => [
        row.id,
        `"${row.studentName}"`,
        row.amount,
        `"${row.status}"`,
        row.date,
        `"${row.method}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `مدفوعات_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "تم التصدير بنجاح! 🎉",
      description: "تم تحميل ملف CSV بنجاح",
    });
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  // دالة تصدير التقرير الشامل
  const exportComprehensiveReport = () => {
    setIsExporting(true);
    
    const reportData = {
      title: 'تقرير شامل لإدارة المدفوعات',
      date: new Date().toLocaleDateString('ar-SA'),
      summary: {
        totalPayments: paymentData.length,
        approvedPayments: paymentData.filter(p => p.status === 'معتمد').length,
        pendingPayments: paymentData.filter(p => p.status === 'معلق').length,
        rejectedPayments: paymentData.filter(p => p.status === 'مرفوض').length,
        totalAmount: paymentData.reduce((sum, p) => sum + p.amount, 0)
      },
      payments: paymentData,
      statistics: {
        averageAmount: Math.round(paymentData.reduce((sum, p) => sum + p.amount, 0) / paymentData.length),
        approvalRate: Math.round((paymentData.filter(p => p.status === 'معتمد').length / paymentData.length) * 100),
        vodafoneCashPayments: paymentData.filter(p => p.method === 'فودافون كاش').length,
        bankPayments: paymentData.filter(p => p.method === 'بنك').length
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_مدفوعات_شامل_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "تم التصدير بنجاح! 📈",
      description: "تم تحميل التقرير الشامل بنجاح",
    });
    
    setTimeout(() => setIsExporting(false), 1000);
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
              مراجعة وموافقة على إثباتات الدفع
            </p>
          </div>
          
          <div className="flex gap-3">
            <LuxuryButton
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={18} />
              تحديث
            </LuxuryButton>
            
            {/* قائمة التصدير البسيطة */}
            <div className="relative group">
              <LuxuryButton
                variant="outline"
                className="flex items-center gap-2"
                disabled={isExporting}
              >
                <Download size={18} />
                {isExporting ? 'جاري التصدير...' : 'تصدير'}
              </LuxuryButton>
              
              {/* القائمة المنسدلة */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-2">
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <FileSpreadsheet size={18} className="text-green-600" />
                    <span className="font-medium text-gray-900 dark:text-white">تصدير CSV</span>
                  </button>
                  
                  <button
                    onClick={exportComprehensiveReport}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <FileText size={18} className="text-purple-600" />
                    <span className="font-medium text-gray-900 dark:text-white">تقرير شامل</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  المدفوعات المعلقة
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: colors.warning }}
                >
                  12
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
                  المدفوعات المعتمدة
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: colors.success }}
                >
                  156
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
                  المدفوعات المرفوضة
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: colors.error }}
                >
                  8
                </p>
              </div>
              <div 
                className="p-3 rounded-xl"
                style={{
                  backgroundColor: colors.error + '20',
                  border: `1px solid ${colors.error}30`
                }}
              >
                <XCircle size={24} color={colors.error} />
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
                  إجمالي الإيرادات
                </p>
                <p 
                  className="text-3xl font-bold"
                  style={{ color: colors.accent }}
                >
                  45,230 ج.م
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
            key={`${activeTab}-${refreshKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'approvals' && <EnhancedPaymentApprovalDashboard />}
            {activeTab === 'statistics' && (
              <div className="text-center py-12">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: colors.accent + '20',
                    border: `2px solid ${colors.accent}30`
                  }}
                >
                  <BarChart3 size={48} color={colors.accent} />
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  إحصائيات المدفوعات
                </h3>
                <p 
                  className="text-lg"
                  style={{ color: colors.textMuted }}
                >
                  سيتم إضافة المزيد من الإحصائيات التفصيلية قريباً
                </p>
              </div>
            )}
            {activeTab === 'reports' && (
              <div className="text-center py-12">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: colors.accent + '20',
                    border: `2px solid ${colors.accent}30`
                  }}
                >
                  <TrendingUp size={48} color={colors.accent} />
                </div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  تقارير المدفوعات
                </h3>
                <p 
                  className="text-lg"
                  style={{ color: colors.textMuted }}
                >
                  سيتم إضافة المزيد من التقارير التفصيلية قريباً
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPaymentManagement;
