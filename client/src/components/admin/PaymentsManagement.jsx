import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/button';
import Badge from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Input from '../ui/input';
import Label from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { useDispatch } from 'react-redux';
import { confirmPayment, rejectPayment } from '../../store/slices/adminSlice';
import { formatCurrency, formatDate, getStatusColor } from '../../services/adminService';
import adminService from '../../services/adminService';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Clock,
  Smartphone,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  X,
  Image,
  FileText,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BookOpen
} from 'lucide-react';

const PaymentsManagement = ({ payments }) => {
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Ensure payments is always an array
  const paymentsArray = Array.isArray(payments) ? payments : [];
  const paymentsData = payments?.data || paymentsArray;
  
  console.log('PaymentsManagement - payments prop:', payments);
  console.log('PaymentsManagement - paymentsData:', paymentsData);

  const handleConfirmPayment = async (paymentId) => {
    try {
      setLoading(true);
      
      // Use the new order approval endpoint with transaction support
      const response = await fetch(`/api/admin/orders/${paymentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "✅ تم تفعيل الكورس بنجاح",
          description: "تم تأكيد الدفع وتفعيل الدورة للطالب. يمكن للطالب الآن الوصول لجميع محتويات الدورة."
        });
        
        // Update the payment status in the UI immediately
        const updatedPayments = paymentsData.map(payment => 
          payment._id === paymentId 
            ? { ...payment, status: 'approved' }
            : payment
        );
        
        // Refresh payments list after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to approve payment');
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      toast({
        title: "❌ خطأ في تأكيد الدفع",
        description: error.message || "حدث خطأ أثناء تأكيد الدفع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId, reason) => {
    try {
      setLoading(true);
      const response = await adminService.rejectPaymentProof(paymentId, reason);
      if (response.data.success) {
        toast({
          title: "❌ تم رفض الدفع",
          description: "تم رفض الدفع وإشعار الطالب بالسبب"
        });
        setShowRejectModal(false);
        setRejectReason('');
        // Refresh payments list
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to reject payment:', error);
      toast({
        title: "❌ خطأ في رفض الدفع",
        description: error.response?.data?.error || error.message || "حدث خطأ أثناء رفض الدفع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = (payment) => {
    console.log('Selected payment data:', payment);
    console.log('Phone numbers:', {
      userPhone: payment.userPhone,
      senderPhone: payment.senderPhone,
      studentPhone: payment.studentPhone
    });
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleRejectClick = (payment) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
  };

  const handleExportPayments = async () => {
    try {
      setLoading(true);
      // Implementation for exporting payments
      toast({
        title: "تم تصدير البيانات",
        description: "تم تصدير بيانات المدفوعات بنجاح"
      });
    } catch (error) {
      console.error('Failed to export payments:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate payment statistics
  const paymentStats = {
    total: paymentsData.length,
    pending: paymentsData.filter(p => p.status === 'pending').length,
    confirmed: paymentsData.filter(p => p.status === 'confirmed').length,
    rejected: paymentsData.filter(p => p.status === 'rejected').length,
    totalRevenue: paymentsData
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  const filteredPayments = paymentsData.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId?.secondName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.courseId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || payment.courseId?._id === courseFilter;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي المدفوعات</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{paymentStats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">مؤكدة</p>
                  <p className="text-2xl font-bold text-green-600">{paymentStats.confirmed}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">مرفوضة</p>
                  <p className="text-2xl font-bold text-red-600">{paymentStats.rejected}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(paymentStats.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Vodafone Cash Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="backdrop-blur-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Vodafone Cash</h3>
                  <p className="text-blue-700 dark:text-blue-300">رقم Vodafone Cash المستخدم لاستقبال المدفوعات</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 font-mono">01022880651</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">رقم الهاتف</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              تصفية المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو البريد الإلكتروني..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكدة</SelectItem>
                  <SelectItem value="rejected">مرفوضة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الدورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الدورات</SelectItem>
                  {/* You could populate this with actual course options */}
                </SelectContent>
              </Select>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleExportPayments} 
                  className="w-full"
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'جاري التصدير...' : 'تصدير البيانات'}
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>إدارة المدفوعات</span>
              <Badge variant="outline" className="text-sm">
                {filteredPayments.length} من {paymentStats.total}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الطالب</TableHead>
                    <TableHead>الدورة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>أرقام الهواتف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredPayments.map((payment, index) => (
                      <motion.tr
                        key={payment._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {payment.userName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {payment.userName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {payment.userEmail}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.courseTitle}</div>
                            <div className="text-sm text-gray-500">
                              {payment.courseSubject} - {payment.courseGrade}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-blue-500" />
                              <span className="text-gray-600 dark:text-gray-400">طالب:</span>
                              <span className="font-medium mr-2">{payment.studentPhone || payment.userPhone}</span>
                            </div>
                            <div className="text-sm flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-green-500" />
                              <span className="text-gray-600 dark:text-gray-400">مرسل:</span>
                              <span className="font-medium mr-2">{payment.senderPhone}</span>
                            </div>
                            <div className="text-sm flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-purple-500" />
                              <span className="text-gray-600 dark:text-gray-400">ولي أمر:</span>
                              <span className="font-medium mr-2">{payment.parentPhone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(payment.status)}
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status === 'pending' && 'في الانتظار'}
                              {payment.status === 'confirmed' && 'مؤكدة'}
                              {payment.status === 'rejected' && 'مرفوضة'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(payment.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewPayment(payment)}
                                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            {payment.status === 'pending' && (
                              <>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleConfirmPayment(payment._id)}
                                    disabled={loading}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectClick(payment)}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Details Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              تفاصيل الدفع
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      معلومات الطالب
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {selectedPayment.userName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedPayment.userEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>هاتف الطالب: {selectedPayment.userPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>هاتف المرسل: {selectedPayment.senderPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedPayment.userGovernorate}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      معلومات الدورة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="font-medium">{selectedPayment.courseTitle}</div>
                    <div className="text-sm text-gray-500">
                      {selectedPayment.courseSubject} - {selectedPayment.courseGrade}
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {formatCurrency(selectedPayment.amount)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        وقت التحويل: {formatDate(selectedPayment.transferTime)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        تاريخ التقديم: {formatDate(selectedPayment.submittedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Proof */}
              {selectedPayment.proofImage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Image className="h-5 w-5 mr-2" />
                      إثبات الدفع
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Phone Numbers Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">رقم هاتف الطالب:</span>
                        <span className="font-bold text-blue-800 dark:text-blue-200">{selectedPayment.studentPhone || selectedPayment.userPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">رقم المرسل:</span>
                        <span className="font-bold text-green-800 dark:text-green-200">{selectedPayment.senderPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">رقم ولي الأمر:</span>
                        <span className="font-bold text-purple-800 dark:text-purple-200">{selectedPayment.parentPhone}</span>
                      </div>
                    </div>
                    
                    {/* Payment Image */}
                    <div className="flex justify-center">
                      <img 
                        src={selectedPayment.proofImage} 
                        alt="Payment Proof"
                        className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    حالة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedPayment.status)}
                      <Badge className={getStatusColor(selectedPayment.status)}>
                        {selectedPayment.status === 'pending' && 'في الانتظار'}
                        {selectedPayment.status === 'confirmed' && 'مؤكدة'}
                        {selectedPayment.status === 'rejected' && 'مرفوضة'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(selectedPayment.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Payment Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              رفض الدفع
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              هل أنت متأكد من رفض هذا الدفع؟ يرجى إدخال سبب الرفض.
            </p>
            <div>
              <Label htmlFor="rejectReason">سبب الرفض</Label>
              <Input
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="أدخل سبب رفض الدفع..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRejectPayment(selectedPayment?._id, rejectReason)}
                disabled={!rejectReason.trim() || loading}
              >
                {loading ? 'جاري الرفض...' : 'رفض الدفع'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsManagement;

