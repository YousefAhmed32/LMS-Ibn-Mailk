import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Label from '../../components/ui/label';
import Badge from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  Edit,
  Save,
  X
} from 'lucide-react';

const ProfilePage = () => {
  // Mock user data - in real app this would come from auth context
  const user = {
    firstName: 'أحمد',
    secondName: 'محمد',
    email: 'ahmed@example.com',
    phone: '+20 109 038 5390',
    governorate: 'القاهرة',
    grade: '10',
    role: 'student',
    joinDate: '2024-01-15',
    totalCourses: 5,
    completedCourses: 3,
    totalHours: 24
  };

  return (
    <PageWrapper>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              الملف الشخصي
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة معلوماتك الشخصية والإعدادات
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    المعلومات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">الاسم الأول</Label>
                      <Input
                        id="firstName"
                        value={user.firstName}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondName">الاسم الثاني</Label>
                      <Input
                        id="secondName"
                        value={user.secondName}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        value={user.email}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={user.phone}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="governorate">المحافظة</Label>
                      <Input
                        id="governorate"
                        value={user.governorate}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="grade">الصف الدراسي</Label>
                      <Input
                        id="grade"
                        value={`الصف ${user.grade}`}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" className="flex items-center">
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل المعلومات
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      حفظ التغييرات
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>إعدادات الحساب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">تغيير كلمة المرور</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          قم بتحديث كلمة المرور الخاصة بك
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        تغيير
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">إعدادات الإشعارات</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          إدارة تفضيلات الإشعارات
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        إعدادات
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">خصوصية الحساب</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          إدارة إعدادات الخصوصية
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        إعدادات
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>ملخص الحساب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-3xl font-bold">
                        {user.firstName.charAt(0)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.firstName} {user.secondName}
                    </h3>
                    <Badge variant="secondary" className="mt-2">
                      {user.role === 'admin' ? 'مدير' : 'طالب'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">تاريخ الانضمام</span>
                      <span className="font-medium">{new Date(user.joinDate).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">الدورات المسجلة</span>
                      <span className="font-medium">{user.totalCourses}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">الدورات المكتملة</span>
                      <span className="font-medium">{user.completedCourses}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">إجمالي ساعات التعلم</span>
                      <span className="font-medium">{user.totalHours} ساعة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات سريعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          معدل التقدم
                        </span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {Math.round((user.completedCourses / user.totalCourses) * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center">
                        <GraduationCap className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                          الدورات المكتملة
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {user.completedCourses}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>إجراءات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      تغيير البريد الإلكتروني
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      تغيير رقم الهاتف
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <X className="h-4 w-4 mr-2" />
                      حذف الحساب
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
    </PageWrapper>
  );
};

export default ProfilePage;
