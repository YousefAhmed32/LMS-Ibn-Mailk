import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import Input from '../ui/input';
import Label from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Upload,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  DollarSign,
  Smartphone,
  Globe,
  Lock,
  Key
} from 'lucide-react';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    fourthName: '',
    userEmail: '',
    phoneStudent: '',
    phoneFather: '',
    phoneMother: '',
    governorate: '',
    grade: '',
    avatar: null
  });
  
  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    vodafoneCashNumber: '01022880651',
    bankAccount: '',
    paypalEmail: '',
    stripeKey: '',
    currency: 'EGP'
  });
  
  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      paymentAlerts: true,
      newUserAlerts: true,
      courseUpdates: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        secondName: user.secondName || '',
        thirdName: user.thirdName || '',
        fourthName: user.fourthName || '',
        userEmail: user.userEmail || '',
        phoneStudent: user.phoneStudent || '',
        phoneFather: user.phoneFather || '',
        phoneMother: user.phoneMother || '',
        governorate: user.governorate || '',
        grade: user.grade || '',
        avatar: null
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateUser(profileData);
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would typically save to backend
      toast({
        title: "تم تحديث إعدادات الدفع",
        description: "تم حفظ إعدادات الدفع بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث إعدادات الدفع",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would typically save to backend
      toast({
        title: "تم تحديث إعدادات النظام",
        description: "تم حفظ إعدادات النظام بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث إعدادات النظام",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const settingsTabs = [
    {
      id: 'profile',
      name: 'الملف الشخصي',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'payment',
      name: 'إعدادات الدفع',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'notifications',
      name: 'الإشعارات',
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 'security',
      name: 'الأمان',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      id: 'appearance',
      name: 'المظهر',
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const renderProfileSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            المعلومات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">الاسم الأول</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  placeholder="أدخل الاسم الأول"
                />
              </div>
              <div>
                <Label htmlFor="secondName">الاسم الثاني</Label>
                <Input
                  id="secondName"
                  value={profileData.secondName}
                  onChange={(e) => setProfileData({...profileData, secondName: e.target.value})}
                  placeholder="أدخل الاسم الثاني"
                />
              </div>
              <div>
                <Label htmlFor="thirdName">الاسم الثالث</Label>
                <Input
                  id="thirdName"
                  value={profileData.thirdName}
                  onChange={(e) => setProfileData({...profileData, thirdName: e.target.value})}
                  placeholder="أدخل الاسم الثالث"
                />
              </div>
              <div>
                <Label htmlFor="fourthName">الاسم الرابع</Label>
                <Input
                  id="fourthName"
                  value={profileData.fourthName}
                  onChange={(e) => setProfileData({...profileData, fourthName: e.target.value})}
                  placeholder="أدخل الاسم الرابع"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userEmail">البريد الإلكتروني</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={profileData.userEmail}
                  onChange={(e) => setProfileData({...profileData, userEmail: e.target.value})}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div>
                <Label htmlFor="phoneStudent">رقم هاتف الطالب</Label>
                <Input
                  id="phoneStudent"
                  value={profileData.phoneStudent}
                  onChange={(e) => setProfileData({...profileData, phoneStudent: e.target.value})}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phoneFather">رقم هاتف الأب</Label>
                <Input
                  id="phoneFather"
                  value={profileData.phoneFather}
                  onChange={(e) => setProfileData({...profileData, phoneFather: e.target.value})}
                  placeholder="أدخل رقم هاتف الأب"
                />
              </div>
              <div>
                <Label htmlFor="phoneMother">رقم هاتف الأم</Label>
                <Input
                  id="phoneMother"
                  value={profileData.phoneMother}
                  onChange={(e) => setProfileData({...profileData, phoneMother: e.target.value})}
                  placeholder="أدخل رقم هاتف الأم"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="governorate">المحافظة</Label>
                <Select 
                  value={profileData.governorate} 
                  onValueChange={(value) => setProfileData({...profileData, governorate: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cairo">القاهرة</SelectItem>
                    <SelectItem value="giza">الجيزة</SelectItem>
                    <SelectItem value="alexandria">الإسكندرية</SelectItem>
                    <SelectItem value="sharqia">الشرقية</SelectItem>
                    <SelectItem value="dakahlia">الدقهلية</SelectItem>
                    <SelectItem value="gharbia">الغربية</SelectItem>
                    <SelectItem value="monufia">المنوفية</SelectItem>
                    <SelectItem value="qalyubia">القليوبية</SelectItem>
                    <SelectItem value="kafr_el_sheikh">كفر الشيخ</SelectItem>
                    <SelectItem value="beheira">البحيرة</SelectItem>
                    <SelectItem value="fayoum">الفيوم</SelectItem>
                    <SelectItem value="beni_suef">بني سويف</SelectItem>
                    <SelectItem value="minya">المنيا</SelectItem>
                    <SelectItem value="assiut">أسيوط</SelectItem>
                    <SelectItem value="sohag">سوهاج</SelectItem>
                    <SelectItem value="qena">قنا</SelectItem>
                    <SelectItem value="luxor">الأقصر</SelectItem>
                    <SelectItem value="aswan">أسوان</SelectItem>
                    <SelectItem value="red_sea">البحر الأحمر</SelectItem>
                    <SelectItem value="new_valley">الوادي الجديد</SelectItem>
                    <SelectItem value="matrouh">مطروح</SelectItem>
                    <SelectItem value="north_sinai">شمال سيناء</SelectItem>
                    <SelectItem value="south_sinai">جنوب سيناء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="grade">الصف الدراسي</Label>
                <Select 
                  value={profileData.grade} 
                  onValueChange={(value) => setProfileData({...profileData, grade: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">أولي إعدادي</SelectItem>
                    <SelectItem value="8">ثاني إعدادي</SelectItem>
                    <SelectItem value="9">ثالث إعدادي</SelectItem>
                    <SelectItem value="10">أولي ثانوي</SelectItem>
                    <SelectItem value="11">ثاني ثانوي</SelectItem>
                    <SelectItem value="12">ثالث ثانوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPaymentSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            إعدادات الدفع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePaymentUpdate} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-2">
                <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Vodafone Cash</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                رقم Vodafone Cash المستخدم لاستقبال المدفوعات من الطلاب
              </p>
              <div>
                <Label htmlFor="vodafoneCash">رقم Vodafone Cash</Label>
                <Input
                  id="vodafoneCash"
                  value={paymentSettings.vodafoneCashNumber}
                  onChange={(e) => setPaymentSettings({...paymentSettings, vodafoneCashNumber: e.target.value})}
                  placeholder="+201022880651"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bankAccount">رقم الحساب البنكي</Label>
                <Input
                  id="bankAccount"
                  value={paymentSettings.bankAccount}
                  onChange={(e) => setPaymentSettings({...paymentSettings, bankAccount: e.target.value})}
                  placeholder="أدخل رقم الحساب البنكي"
                />
              </div>
              <div>
                <Label htmlFor="paypalEmail">بريد PayPal الإلكتروني</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={paymentSettings.paypalEmail}
                  onChange={(e) => setPaymentSettings({...paymentSettings, paypalEmail: e.target.value})}
                  placeholder="أدخل بريد PayPal"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currency">العملة الافتراضية</Label>
              <Select 
                value={paymentSettings.currency} 
                onValueChange={(value) => setPaymentSettings({...paymentSettings, currency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="EUR">يورو (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ إعدادات الدفع'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderNotificationSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSystemUpdate} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                  <p className="text-sm text-gray-500">تلقي الإشعارات عبر البريد الإلكتروني</p>
                </div>
                <Switch
                  checked={systemSettings.notifications.email}
                  onCheckedChange={(checked) => 
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {...systemSettings.notifications, email: checked}
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">إشعارات SMS</h3>
                  <p className="text-sm text-gray-500">تلقي الإشعارات عبر الرسائل النصية</p>
                </div>
                <Switch
                  checked={systemSettings.notifications.sms}
                  onCheckedChange={(checked) => 
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {...systemSettings.notifications, sms: checked}
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">إشعارات الدفع</h3>
                  <p className="text-sm text-gray-500">تلقي إشعارات عند تأكيد أو رفض المدفوعات</p>
                </div>
                <Switch
                  checked={systemSettings.notifications.paymentAlerts}
                  onCheckedChange={(checked) => 
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {...systemSettings.notifications, paymentAlerts: checked}
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">إشعارات المستخدمين الجدد</h3>
                  <p className="text-sm text-gray-500">تلقي إشعارات عند تسجيل مستخدمين جدد</p>
                </div>
                <Switch
                  checked={systemSettings.notifications.newUserAlerts}
                  onCheckedChange={(checked) => 
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {...systemSettings.notifications, newUserAlerts: checked}
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">تحديثات الدورات</h3>
                  <p className="text-sm text-gray-500">تلقي إشعارات عند إضافة أو تحديث الدورات</p>
                </div>
                <Switch
                  checked={systemSettings.notifications.courseUpdates}
                  onCheckedChange={(checked) => 
                    setSystemSettings({
                      ...systemSettings,
                      notifications: {...systemSettings.notifications, courseUpdates: checked}
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ إعدادات الإشعارات'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSecuritySettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            إعدادات الأمان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSystemUpdate} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">المصادقة الثنائية</h3>
                  <p className="text-sm text-gray-500">تفعيل المصادقة الثنائية لزيادة الأمان</p>
                </div>
                <Switch
                  checked={systemSettings.security.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    setSystemSettings({
                      ...systemSettings,
                      security: {...systemSettings.security, twoFactorAuth: checked}
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">تنبيهات تسجيل الدخول</h3>
                  <p className="text-sm text-gray-500">تلقي إشعارات عند تسجيل الدخول من أجهزة جديدة</p>
                </div>
                <Switch
                  checked={systemSettings.security.loginAlerts}
                  onCheckedChange={(checked) => 
                    setSystemSettings({
                      ...systemSettings,
                      security: {...systemSettings.security, loginAlerts: checked}
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">مهلة انتهاء الجلسة (دقيقة)</Label>
                <Select 
                  value={systemSettings.security.sessionTimeout.toString()} 
                  onValueChange={(value) => 
                    setSystemSettings({
                      ...systemSettings,
                      security: {...systemSettings.security, sessionTimeout: parseInt(value)}
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 دقيقة</SelectItem>
                    <SelectItem value="30">30 دقيقة</SelectItem>
                    <SelectItem value="60">ساعة واحدة</SelectItem>
                    <SelectItem value="120">ساعتان</SelectItem>
                    <SelectItem value="480">8 ساعات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ إعدادات الأمان'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAppearanceSettings = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            إعدادات المظهر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">الوضع المظلم</h3>
                <p className="text-sm text-gray-500">تفعيل الوضع المظلم للوحة التحكم</p>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
                <h4 className="font-medium text-center">الأزرق والبنفسجي</h4>
              </div>
              <div className="p-4 border rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                <div className="w-full h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded mb-2"></div>
                <h4 className="font-medium text-center">الأخضر والأزرق</h4>
              </div>
              <div className="p-4 border rounded-lg cursor-pointer hover:border-orange-300 transition-colors">
                <div className="w-full h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded mb-2"></div>
                <h4 className="font-medium text-center">البرتقالي والأحمر</h4>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الإعدادات</h2>
          <p className="text-gray-500 dark:text-gray-400">إدارة إعدادات النظام والملف الشخصي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <nav className="space-y-1">
              {settingsTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      isActive
                        ? `${tab.bgColor} ${tab.color} border-r-4 border-blue-500`
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } w-full flex items-center px-4 py-3 text-sm font-medium transition-all duration-200`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </motion.button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
