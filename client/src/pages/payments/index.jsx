import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Badge from '../../components/ui/badge';
import Input from '../../components/ui/input';
import Label from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { CreditCard, Phone, User, BookOpen } from 'lucide-react';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [paymentData, setPaymentData] = useState({
    courseId: '',
    amount: '',
    phoneStudent: user?.phoneStudent || '',
    phoneParent: user?.phoneFather || '',
    vodafoneNumberFrom: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  // Mock courses data - in real app, this would come from API
  const availableCourses = [
    { id: '1', title: 'Mathematics Grade 7 - First Term', price: 150 },
    { id: '2', title: 'Physics Grade 10 - Second Term', price: 200 },
    { id: '3', title: 'English Literature Grade 12', price: 180 }
  ];

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-fill amount when course is selected
    if (field === 'courseId') {
      const selectedCourse = availableCourses.find(course => course.id === value);
      if (selectedCourse) {
        setPaymentData(prev => ({
          ...prev,
          courseId: value,
          amount: selectedCourse.price.toString()
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!paymentData.courseId || !paymentData.amount || !paymentData.vodafoneNumberFrom) {
        throw new Error('يرجى ملء جميع الحقول المطلوبة');
      }

      // Mock API call - in real app, this would be a real API request
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "تم إرسال طلب الدفع",
        description: "سيتم مراجعة طلبك من قبل الإدارة قريباً",
      });

      // Reset form
      setPaymentData({
        courseId: '',
        amount: '',
        phoneStudent: user?.phoneStudent || '',
        phoneParent: user?.phoneFather || '',
        vodafoneNumberFrom: '',
        notes: ''
      });

    } catch (error) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال طلب الدفع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الدفع</h1>
            <p className="text-gray-600">إرسال طلب دفع للدورات التعليمية</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    طلب دفع جديد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Course Selection */}
                    <div>
                      <Label htmlFor="courseId">اختر الدورة</Label>
                      <Select 
                        value={paymentData.courseId} 
                        onValueChange={(value) => handleInputChange('courseId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدورة التي تريد الاشتراك فيها" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              <div className="flex justify-between items-center w-full">
                                <span>{course.title}</span>
                                <span className="text-sm text-gray-500">{course.price} ج.م</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount */}
                    <div>
                      <Label htmlFor="amount">المبلغ (ج.م)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={paymentData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder="0"
                        readOnly
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500 mt-1">سيتم ملء هذا الحقل تلقائياً عند اختيار الدورة</p>
                    </div>

                    {/* Phone Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phoneStudent">رقم هاتف الطالب</Label>
                        <Input
                          id="phoneStudent"
                          value={paymentData.phoneStudent}
                          onChange={(e) => handleInputChange('phoneStudent', e.target.value)}
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneParent">رقم هاتف ولي الأمر</Label>
                        <Input
                          id="phoneParent"
                          value={paymentData.phoneParent}
                          onChange={(e) => handleInputChange('phoneParent', e.target.value)}
                          placeholder="01xxxxxxxxx"
                        />
                      </div>
                    </div>

                    {/* Vodafone Number */}
                    <div>
                      <Label htmlFor="vodafoneNumberFrom">رقم فودافون كاش المرسل منه</Label>
                      <Input
                        id="vodafoneNumberFrom"
                        value={paymentData.vodafoneNumberFrom}
                        onChange={(e) => handleInputChange('vodafoneNumberFrom', e.target.value)}
                        placeholder="01xxxxxxxxx"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">رقم الهاتف الذي تم منه إرسال المبلغ</p>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                      <Textarea
                        id="notes"
                        value={paymentData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="أي ملاحظات إضافية تريد إضافتها..."
                        rows={3}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          إرسال طلب الدفع
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Payment Info */}
            <div className="space-y-6">
              {/* Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    معلومات الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">طريقة الدفع</h4>
                    <p className="text-sm text-blue-600">
                      نستخدم فودافون كاش كطريقة دفع آمنة وسريعة
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>آمن ومشفر</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>معالجة سريعة</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>تأكيد فوري</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>خطوات الدفع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">اختر الدورة</p>
                      <p className="text-sm text-gray-500">حدد الدورة التي تريد الاشتراك فيها</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">أرسل المبلغ</p>
                      <p className="text-sm text-gray-500">أرسل المبلغ عبر فودافون كاش</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">أكمل الطلب</p>
                      <p className="text-sm text-gray-500">أكمل نموذج الطلب وانتظر التأكيد</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="font-medium">احصل على الدورة</p>
                      <p className="text-sm text-gray-500">بعد التأكيد، ستتمكن من الوصول للدورة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </PageWrapper>
  );
};

export default PaymentsPage;
