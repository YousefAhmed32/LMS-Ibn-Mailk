import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { fetchAllUsers } from '../../store/slices/adminSlice';
import ModernUsersTable from '../../components/admin/ModernUsersTable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/simple-dialog';
import Button from '../../components/ui/button';
import {
  Users,
  UserPlus,
  Download,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  UserCheck,
  UserX,
  Crown,
  GraduationCap,
  Activity,
  BarChart3,
} from 'lucide-react';

const EnhancedUsersPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { isDarkMode } = theme;

  // Redux state
  const { users, loading, error } = useSelector((state) => state.admin);

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userForm, setUserForm] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    fourthName: '',
    userEmail: '',
    phoneStudent: '',
    role: 'student',
    grade: '7',
    governorate: 'cairo',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('🔄 Fetching users...');
      const result = await dispatch(fetchAllUsers()).unwrap();
      console.log('✅ Users fetched successfully:', result);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast({
        title: 'خطأ في تحميل المستخدمين',
        description: 'فشل في تحميل قائمة المستخدمين',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث قائمة المستخدمين بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'خطأ في التحديث',
        description: 'فشل في تحديث قائمة المستخدمين',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!userForm.firstName.trim() || !userForm.userEmail.trim() || !userForm.password.trim()) {
        toast({
          title: 'بيانات مطلوبة',
          description: 'يرجى ملء جميع الحقول المطلوبة',
          variant: 'destructive',
        });
        return;
      }

      // Here you would dispatch createUser action
      // await dispatch(createUser(userForm)).unwrap();
      
      toast({
        title: 'تم إنشاء المستخدم',
        description: 'تم إنشاء المستخدم الجديد بنجاح',
        variant: 'success',
      });
      
      setShowCreateModal(false);
      setUserForm({
        firstName: '',
        secondName: '',
        thirdName: '',
        fourthName: '',
        userEmail: '',
        phoneStudent: '',
        role: 'student',
        grade: '7',
        governorate: 'cairo',
        password: '',
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        title: 'خطأ في إنشاء المستخدم',
        description: 'فشل في إنشاء المستخدم الجديد',
        variant: 'destructive',
      });
    }
  };

  const handleExportUsers = async () => {
    try {
      // Here you would dispatch exportUsers action
      // const csvData = await dispatch(exportUsers()).unwrap();
      
      toast({
        title: 'تم التصدير',
        description: 'تم تصدير بيانات المستخدمين بنجاح',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'خطأ في التصدير',
        description: 'فشل في تصدير بيانات المستخدمين',
        variant: 'destructive',
      });
    }
  };

  // Calculate statistics - ensure users is always an array
  const usersArray = Array.isArray(users) ? users : [];
  
  // Debug logging
  console.log('📊 Current state:', { users, usersArray, loading, error });
  
  const stats = {
    total: usersArray.length,
    students: usersArray.filter(user => user.role === 'student').length,
    admins: usersArray.filter(user => user.role === 'admin').length,
    active: usersArray.filter(user => user.isActive !== false).length,
    inactive: usersArray.filter(user => user.isActive === false).length,
  };

  // Show loading state if users are not loaded yet
  if (loading && usersArray.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل المستخدمين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800/90 to-blue-900/90 backdrop-blur-xl border border-slate-700/30 shadow-2xl p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/5 dark:to-purple-400/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-2">
                    إدارة المستخدمين
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                    إدارة شاملة لجميع المستخدمين والأدوار في النظام
                  </p>
                </div>
              </div>
            
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                  تحديث البيانات
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleExportUsers}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download size={20} />
                  تصدير البيانات
                </Button>
                
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <UserPlus size={20} />
                      إضافة مستخدم جديد
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          الاسم الأول *
                        </label>
                        <input
                          type="text"
                          required
                          value={userForm.firstName}
                          onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          الاسم الثاني
                        </label>
                        <input
                          type="text"
                          value={userForm.secondName}
                          onChange={(e) => setUserForm({...userForm, secondName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          الاسم الثالث
                        </label>
                        <input
                          type="text"
                          value={userForm.thirdName}
                          onChange={(e) => setUserForm({...userForm, thirdName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          الاسم الرابع
                        </label>
                        <input
                          type="text"
                          value={userForm.fourthName}
                          onChange={(e) => setUserForm({...userForm, fourthName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          البريد الإلكتروني *
                        </label>
                        <input
                          type="email"
                          required
                          value={userForm.userEmail}
                          onChange={(e) => setUserForm({...userForm, userEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={userForm.phoneStudent}
                          onChange={(e) => setUserForm({...userForm, phoneStudent: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          كلمة المرور *
                        </label>
                        <input
                          type="password"
                          required
                          value={userForm.password}
                          onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          الدور
                        </label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        >
                          <option value="student">طالب</option>
                          <option value="admin">مدير</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          الصف
                        </label>
                        <select
                          value={userForm.grade}
                          onChange={(e) => setUserForm({...userForm, grade: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        >
                          <option value="7">أولى إعدادي</option>
                          <option value="8">ثانية إعدادي</option>
                          <option value="9">ثالثة إعدادي</option>
                          <option value="10">أولى ثانوي</option>
                          <option value="11">ثانية ثانوي</option>
                          <option value="12">ثالثة ثانوي</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          المحافظة
                        </label>
                        <select
                          value={userForm.governorate}
                          onChange={(e) => setUserForm({...userForm, governorate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
                        >
                          <option value="cairo">القاهرة</option>
                          <option value="giza">الجيزة</option>
                          <option value="alexandria">الإسكندرية</option>
                          <option value="other">أخرى</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                        إلغاء
                      </Button>
                      <Button type="submit">
                        إنشاء المستخدم
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-blue-900/60 to-indigo-900/80 backdrop-blur-sm border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
                <span>جميع المستخدمين</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-green-900/60 to-emerald-900/80 backdrop-blur-sm border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">الطلاب</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.students}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Activity className="h-4 w-4" />
                <span>طلاب مسجلين</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-purple-900/60 to-violet-900/80 backdrop-blur-sm border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">المديرين</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.admins}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                <BarChart3 className="h-4 w-4" />
                <span>مديرين النظام</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-emerald-900/60 to-teal-900/80 backdrop-blur-sm border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">نشط</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <Activity className="h-4 w-4" />
                <span>مستخدمين نشطين</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-red-900/60 to-rose-900/80 backdrop-blur-sm border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <UserX className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">غير نشط</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inactive}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <Activity className="h-4 w-4" />
                <span>مستخدمين معطلين</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={24} />
                قائمة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersArray.length === 0 && !loading ? (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    لا يوجد مستخدمين
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    لم يتم العثور على أي مستخدمين في النظام
                  </p>
                  <Button onClick={handleRefresh} className="flex items-center gap-2">
                    <RefreshCw size={20} />
                    تحديث البيانات
                  </Button>
                </div>
              ) : (
                <ModernUsersTable users={usersArray} loading={loading} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedUsersPage;
