import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/button';
import Badge from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import Label from '../ui/label';
import { toast } from '../../hooks/use-toast';
import { useTheme } from '../../contexts/ThemeContext';
import adminService from '../../services/adminService';
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
  Search
} from 'lucide-react';

const PaymentProofManagement = () => {
  const { isDark } = useTheme();
  const [pendingProofs, setPendingProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPendingProofs();
  }, []);

  const fetchPendingProofs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingPaymentProofs();
      console.log('Payment proofs response:', response);
      
      // Handle different response structures
      const proofs = response.data?.pendingProofs || 
                    response.data?.data?.pendingProofs || 
                    response.pendingProofs || 
                    [];
      
      setPendingProofs(proofs);
      
      if (proofs.length === 0) {
        console.log('No pending payment proofs found');
      }
    } catch (error) {
      console.error('Error fetching pending proofs:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      toast({
        title: "خطأ في التحميل",
        description: error.response?.data?.error || "فشل في تحميل طلبات الدفع المعلقة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter proofs based on search and status
  const getFilteredProofs = () => {
    return pendingProofs.filter(proof => {
      const matchesSearch = searchTerm === '' || 
        proof.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proof.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proof.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'pending' && proof.paymentStatus === 'pending');
      
      return matchesSearch && matchesStatus;
    });
  };

  const handleApprove = async (proof) => {
    try {
      setProcessing(true);
      console.log('Approving payment:', proof._id);
      
      const response = await adminService.approvePaymentProof(proof._id);
      console.log('Approval response:', response.data);
      
      // Handle different response scenarios
      if (response.data.success) {
        if (response.data.alreadyApproved) {
          toast({
            title: "✅ تم الموافقة مسبقاً",
            description: "هذا الدفع تمت الموافقة عليه مسبقاً",
          });
        } else {
          toast({
            title: "✅ تم الموافقة على الدفع",
            description: `تم تفعيل الدورة "${response.data.course?.title || 'غير محدد'}" للطالب ${response.data.student?.name || 'غير محدد'} بنجاح`,
          });
        }

        // Remove from pending list
        setPendingProofs(prev => prev.filter(p => p._id !== proof._id));
        
        // Refresh the list to get updated data
        await fetchPendingProofs();
      } else {
        throw new Error(response.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      
      let errorMessage = "فشل في الموافقة على طلب الدفع";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ خطأ في الموافقة",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProof || !rejectionReason.trim()) {
      toast({
        title: "❌ سبب مطلوب",
        description: "يرجى كتابة سبب رفض الدفع",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      console.log('Rejecting payment:', selectedProof._id, 'Reason:', rejectionReason.trim());
      
      const response = await adminService.rejectPaymentProof(
        selectedProof._id, 
        rejectionReason.trim()
      );
      console.log('Rejection response:', response.data);

      // Handle different response scenarios
      if (response.data.success) {
        if (response.data.alreadyRejected) {
          toast({
            title: "✅ تم الرفض مسبقاً",
            description: "هذا الدفع تم رفضه مسبقاً",
          });
        } else {
          toast({
            title: "✅ تم رفض الدفع",
            description: `تم رفض دفع الطالب ${response.data.student?.name || 'غير محدد'} لدورة "${response.data.course?.title || 'غير محدد'}" وإشعاره بالسبب`,
          });
        }

        // Remove from pending list
        setPendingProofs(prev => prev.filter(p => p._id !== selectedProof._id));
        
        // Refresh the list to get updated data
        await fetchPendingProofs();
        
        // Close modal and reset
        setShowRejectModal(false);
        setSelectedProof(null);
        setRejectionReason('');
      } else {
        throw new Error(response.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      
      let errorMessage = "فشل في رفض طلب الدفع";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ خطأ في الرفض",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (proof) => {
    setSelectedProof(proof);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedProof(null);
    setRejectionReason('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
            جاري تحميل طلبات الدفع...
          </h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            يرجى الانتظار بينما نقوم بجمع البيانات
          </p>
        </motion.div>
      </div>
    );
  }

  const filteredProofs = getFilteredProofs();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              إدارة طلبات الدفع
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              مراجعة وموافقة/رفض طلبات الدفع من الطلاب
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge 
              variant="secondary" 
              className={`text-sm px-4 py-2 ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {pendingProofs.length} طلب معلق
            </Badge>
            
            <Button
              onClick={fetchPendingProofs}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="البحث عن الطالب أو الدورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                الكل ({pendingProofs.length})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                معلق ({pendingProofs.filter(p => p.paymentStatus === 'pending').length})
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {filteredProofs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <CardContent className="p-12 text-center">
                <AlertCircle className={`w-20 h-20 mx-auto mb-6 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  لا توجد طلبات دفع معلقة
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  جميع طلبات الدفع تم مراجعتها أو لا توجد طلبات جديدة
                </p>
                <Button onClick={fetchPendingProofs} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  تحديث القائمة
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid gap-6"
          >
            <AnimatePresence>
              {filteredProofs.map((proof, index) => (
                <motion.div
                  key={proof.enrollmentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-shadow`}>
                    <CardHeader className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {proof.courseTitle}
                          </CardTitle>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                            {proof.courseSubject} • الصف {proof.courseGrade} • {proof.courseTerm}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-yellow-600 border-yellow-300 bg-yellow-50"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          في انتظار المراجعة
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Student Information */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              بيانات الطالب
                            </h4>
                          </div>
                          <div className={`space-y-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">الاسم:</span>
                              <span>{proof.userName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">البريد:</span>
                              <span className="truncate">{proof.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(proof.enrolledAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Course Information */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              تفاصيل الدورة
                            </h4>
                          </div>
                          <div className={`space-y-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-medium">السعر:</span>
                              <span className="font-bold text-green-600">{proof.coursePrice} ج.م</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">المادة:</span>
                              <span>{proof.courseSubject}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">الصف:</span>
                              <span>{proof.courseGrade}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Proof */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <FileText className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <h4 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                              إثبات الدفع
                            </h4>
                          </div>
                          {proof.proofImage && (
                            <div className="space-y-3">
                              <div className="relative group">
                                <img 
                                  src={proof.proofImage} 
                                  alt="إثبات الدفع" 
                                  className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(proof.proofImage, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(proof.proofImage, '_blank')}
                                className="w-full"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                عرض بالحجم الكامل
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          onClick={() => handleApprove(proof)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700 flex-1 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          موافقة على الدفع
                        </Button>
                        
                        <Button 
                          onClick={() => openRejectModal(proof)}
                          disabled={processing}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          رفض الدفع
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Reject Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className={`sm:max-w-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <DialogHeader>
              <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>
                رفض طلب الدفع
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejectionReason" className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                  سبب الرفض
                </Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="يرجى كتابة سبب رفض الدفع..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className={`mt-1 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  rows={4}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  سيتم إرسال هذا السبب للطالب
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeRejectModal}
                  className="flex-1"
                  disabled={processing}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الرفض...
                    </>
                  ) : (
                    'رفض الدفع'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PaymentProofManagement;
