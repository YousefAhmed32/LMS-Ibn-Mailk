import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast'; // Direct toast import
import { deleteUser } from '../../store/slices/adminSlice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import Badge from '../ui/badge';
import Button from '../ui/button';
import {
  Eye,
  Edit,
  Trash2,
  Users,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Clipboard,
  Calendar,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';

const ModernUsersTable = ({ users = [], loading = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { isDarkMode } = theme;

  // State for table functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ensure users is always an array for safe operations
  const usersArray = Array.isArray(users) ? users : [];
  
  // Debug: Log users data
  console.log('ModernUsersTable - users data:', usersArray);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = usersArray.filter(user => {
      const matchesSearch = 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.secondName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneStudent?.includes(searchTerm) ||
        user.phoneNumber?.includes(searchTerm);
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' ? user.isActive !== false : user.isActive === false);
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'name') {
        aValue = `${a.firstName} ${a.secondName}`.toLowerCase();
        bValue = `${b.firstName} ${b.secondName}`.toLowerCase();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [usersArray, searchTerm, sortField, sortDirection, filterRole, filterStatus]);

  // Pagination calculations
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await dispatch(deleteUser(userToDelete._id)).unwrap();
      toast({
        title: 'تم حذف المستخدم',
        description: `تم حذف ${userToDelete.firstName} ${userToDelete.secondName} بنجاح`,
        variant: 'success',
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast({
        title: 'خطأ في حذف المستخدم',
        description: 'حدث خطأ أثناء حذف المستخدم. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  };


  // Copy Student ID function
  const copyStudentId = async (studentId) => {
    try {
      console.log('Copying Student ID:', studentId);
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(studentId);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = studentId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // Success notification
      toast({
        title: 'تم نسخ معرف الطالب',
        description: ` ${studentId}`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Failed to copy student ID:', error);
      toast({
        title: 'فشل في نسخ معرف الطالب',
        description: 'حدث خطأ أثناء نسخ معرف الطالب. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'student':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'parent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (isActive) => {
    return isActive !== false 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
        <span className="mr-3 text-gray-600 dark:text-gray-400">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-950" size={24} />
            <input
              type="text"
              placeholder="البحث في المستخدمين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
            >
              <option value="all">جميع الأدوار</option>
              <option value="student">طالب</option>
              <option value="parent">ولي أمر</option>
              <option value="admin">مدير</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-luxury-gold"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      المستخدم
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort('userEmail')}
                  >
                    <div className="flex items-center gap-2">
                      البريد الإلكتروني
                      {getSortIcon('userEmail')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-2">
                      الدور
                      {getSortIcon('role')}
                    </div>
                  </TableHead>
                  <TableHead>المعلومات الإضافية</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      تاريخ التسجيل
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {paginatedUsers.map((user, index) => {
                    console.log('User in ModernUsersTable:', user.role, user.studentId, user._id);
                    return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-luxury-gold rounded-full flex items-center justify-center text-white font-semibold">
                            {user.firstName?.[0]}{user.secondName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {user.firstName} {user.secondName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.thirdName} {user.fourthName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-sm">{user.userEmail || user.email || 'غير محدد'}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role === 'admin' ? 'مدير' : 
                           user.role === 'student' ? 'طالب' : 
                           user.role === 'parent' ? 'ولي أمر' :
                           user.role}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {user.phoneStudent && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone size={14} />
                              {user.phoneStudent}
                            </div>
                          )}
                          {user.governorate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin size={14} />
                              {user.governorate}
                            </div>
                          )}
                          {user.grade && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <BookOpen size={14} />
                              الصف {user.grade}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar size={14} />
                          {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusBadgeColor(user.isActive)}>
                          {user.isActive !== false ? (
                            <>
                              نشط
                            </>
                          ) : (
                            <>
                              غير نشط
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/admin/users/${user._id}`)}
                                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                              >
                                <Eye size={16} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            </TooltipContent>
                          </Tooltip>
                          
                          
                          {/* Copy Student ID Button - Only for students */}
                          {user.role === 'student' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyStudentId(user._id)}
                                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                                >
                                  <Clipboard size={16} className="sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          
                        </div>
                      </TableCell>
                    </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          <AnimatePresence>
            {paginatedUsers.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                {/* User Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-luxury-gold rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {user.firstName?.[0]}{user.secondName?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {user.firstName} {user.secondName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.thirdName} {user.fourthName}
                      </div>
                    </div>
                  </div>
                  
                  {/* Role Badge */}
                  <div>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role === 'admin' ? 'مدير' : 
                       user.role === 'student' ? 'طالب' : 
                       user.role === 'parent' ? 'ولي أمر' :
                       user.role}
                    </Badge>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-3 mb-4">
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{user.userEmail || user.email || 'غير محدد'}</span>
                  </div>

                  {/* Phone */}
                  {user.phoneStudent && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{user.phoneStudent}</span>
                    </div>
                  )}

                  {/* Governorate */}
                  {user.governorate && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{user.governorate}</span>
                    </div>
                  )}

                  {/* Grade */}
                  {user.grade && (
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">الصف {user.grade}</span>
                    </div>
                  )}

                  {/* Registration Date */}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadgeColor(user.isActive)}>
                      {user.isActive !== false ? (
                        <>
                          نشط
                        </>
                      ) : (
                        <>
                          غير نشط
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-lg transition-all duration-300"
                        >
                          <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>عرض التفاصيل</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <AlertDialog open={deleteDialogOpen && userToDelete?._id === user._id} onOpenChange={setDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserToDelete(user)}
                              className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-lg transition-all duration-300"
                            >
                              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>حذف</p>
                          </TooltipContent>
                        </Tooltip>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} />
                            تأكيد الحذف
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف المستخدم{' '}
                            <span className="font-semibold">
                              {user.firstName} {user.secondName}
                            </span>
                            ؟ هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                            إلغاء
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    {/* Copy Student ID Button - Only for students */}
                    {user.role === 'student' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyStudentId(user._id)}
                            className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 rounded-lg transition-all duration-300"
                          >
                            <Clipboard size={18} className="text-blue-600 dark:text-blue-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>نسخ معرف الطالب</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  <AlertDialog open={deleteDialogOpen && userToDelete?._id === user._id} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUserToDelete(user)}
                            className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-lg transition-all duration-300"
                          >
                            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>حذف</p>
                        </TooltipContent>
                      </Tooltip>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="text-red-500" size={20} />
                          تأكيد الحذف
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف المستخدم{' '}
                          <span className="font-semibold">
                            {user.firstName} {user.secondName}
                          </span>
                          ؟ هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                          إلغاء
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteUser}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {totalItems === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 lg:py-12"
          >
            <Users size={48} className="lg:w-16 lg:h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              لا يوجد مستخدمين
            </h3>
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 px-4">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'لم يتم العثور على مستخدمين يطابقون المعايير المحددة'
                : 'لم يتم العثور على أي مستخدمين في النظام'}
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">عرض:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">من أصل {totalItems}</span>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              عرض {startIndex + 1} إلى {Math.min(endIndex, totalItems)} من {totalItems} مستخدم
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                الأولى
              </button>
              
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                السابقة
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                        currentPage === pageNum
                          ? 'bg-luxury-gold text-white border-luxury-gold'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                التالية
              </button>
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                الأخيرة
              </button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ModernUsersTable;
