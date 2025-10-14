import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';
import Label from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import Switch from '../../components/ui/switch';
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe,
  Palette,
  Eye,
  EyeOff,
  Save,
  X
} from 'lucide-react';

const SettingsPage = () => {
  // Mock settings data - in real app this would come from context or API
  const settings = {
    notifications: {
      email: true,
      push: false,
      sms: true,
      courseUpdates: true,
      paymentReminders: true,
      newContent: false
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      allowMessages: true,
      shareAchievements: false
    },
    appearance: {
      theme: 'auto',
      language: 'ar',
      fontSize: 'medium',
      compactMode: false
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30
    }
  };

  return (
    <PageWrapper>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              الإعدادات
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              تخصيص تجربتك التعليمية وإدارة تفضيلاتك
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Navigation */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    فئات الإعدادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      الإشعارات
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      الخصوصية والأمان
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Palette className="h-4 w-4 mr-2" />
                      المظهر
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      اللغة والمنطقة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    إعدادات الإشعارات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">إشعارات البريد الإلكتروني</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          استلام إشعارات عبر البريد الإلكتروني
                        </p>
                      </div>
                      <Switch checked={settings.notifications.email} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">الإشعارات الفورية</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          إشعارات فورية في المتصفح
                        </p>
                      </div>
                      <Switch checked={settings.notifications.push} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">إشعارات الرسائل النصية</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          إشعارات عبر الرسائل النصية
                        </p>
                      </div>
                      <Switch checked={settings.notifications.sms} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">تحديثات الدورات</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          إشعارات عند إضافة محتوى جديد
                        </p>
                      </div>
                      <Switch checked={settings.notifications.courseUpdates} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    الخصوصية والأمان
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>رؤية الملف الشخصي</Label>
                      <Select value={settings.privacy.profileVisibility}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">عام</SelectItem>
                          <SelectItem value="friends">الأصدقاء فقط</SelectItem>
                          <SelectItem value="private">خاص</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">إظهار التقدم</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          السماح للآخرين برؤية تقدمك
                        </p>
                      </div>
                      <Switch checked={settings.privacy.showProgress} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">المصادقة الثنائية</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          طبقة أمان إضافية لحسابك
                        </p>
                      </div>
                      <Switch checked={settings.security.twoFactorAuth} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>مهلة الجلسة (دقيقة)</Label>
                      <Select value={settings.security.sessionTimeout.toString()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 دقيقة</SelectItem>
                          <SelectItem value="30">30 دقيقة</SelectItem>
                          <SelectItem value="60">ساعة واحدة</SelectItem>
                          <SelectItem value="1440">يوم واحد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    إعدادات المظهر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>المظهر</Label>
                      <Select value={settings.appearance.theme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">فاتح</SelectItem>
                          <SelectItem value="dark">داكن</SelectItem>
                          <SelectItem value="auto">تلقائي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>اللغة</Label>
                      <Select value={settings.appearance.language}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>حجم الخط</Label>
                      <Select value={settings.appearance.fontSize}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">صغير</SelectItem>
                          <SelectItem value="medium">متوسط</SelectItem>
                          <SelectItem value="large">كبير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">الوضع المضغوط</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          تقليل المسافات بين العناصر
                        </p>
                      </div>
                      <Switch checked={settings.appearance.compactMode} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>الإجراءات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      حفظ الإعدادات
                    </Button>
                    <Button variant="outline" className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      إعادة تعيين
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
    </PageWrapper>
  );
};

export default SettingsPage;
