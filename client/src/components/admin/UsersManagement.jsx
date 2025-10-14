import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import Badge from '../ui/badge';
import Input from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Filter, Download, Eye, Edit, Trash2, Users, Plus, Clipboard } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateUserRole, deleteUser, exportUsers, createUser, updateUser } from '../../store/slices/adminSlice';
import { formatDate, getRoleColor } from '../../services/adminService';

const UsersManagement = ({ users }) => {
  const dispatch = useDispatch();
  
  // Debug: Log users data
  console.log('UsersManagement - users data:', users);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [governorateFilter, setGovernorateFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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
  });

  // Ensure users is always an array
  const usersArray = Array.isArray(users) ? users : [];
  const usersData = users?.data || usersArray;

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const copyStudentId = async (studentId) => {
    try {
      console.log('Copying Student ID:', studentId);
      console.log('Student ID type:', typeof studentId);
      
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
      console.log(`✅ تم نسخ معرف الطالب: ${studentId}`);
      // You could add a toast notification here
      alert(`✅ تم نسخ معرف الطالب: ${studentId}`);
    } catch (error) {
      console.error('Failed to copy student ID:', error);
      alert('❌ فشل في نسخ معرف الطالب');
    }
  };

  const handleExportUsers = async () => {
    try {
      const filters = {};
      if (roleFilter && roleFilter !== 'all') filters.role = roleFilter;
      if (gradeFilter && gradeFilter !== 'all') filters.grade = gradeFilter;
      if (governorateFilter && governorateFilter !== 'all') filters.governorate = governorateFilter;
      
      const response = await dispatch(exportUsers(filters)).unwrap();
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
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
    });
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName,
      secondName: user.secondName,
      thirdName: user.thirdName,
      fourthName: user.fourthName,
      userEmail: user.userEmail,
      phoneStudent: user.phoneStudent,
      role: user.role,
      grade: user.grade,
      governorate: user.governorate,
    });
    setShowAddModal(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!userForm.firstName.trim()) {
        alert('يرجى إدخال الاسم الأول');
        return;
      }
      if (!userForm.userEmail.trim()) {
        alert('يرجى إدخال البريد الإلكتروني');
        return;
      }
      if (!userForm.phoneStudent.trim()) {
        alert('يرجى إدخال رقم الهاتف');
        return;
      }

      if (editingUser) {
        // Update existing user
        await dispatch(updateUser({ userId: editingUser._id, userData: userForm })).unwrap();
      } else {
        // Create new user
        await dispatch(createUser(userForm)).unwrap();
      }

      // Reset form and close modal
      setShowAddModal(false);
      setEditingUser(null);
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
      });
      
      // Show success message
      alert(editingUser ? 'تم تحديث المستخدم بنجاح!' : 'تم إنشاء المستخدم بنجاح!');
      
    } catch (error) {
      console.error('Failed to submit user:', error);
      alert('حدث خطأ أثناء حفظ المستخدم. يرجى المحاولة مرة أخرى.');
    }
  };

  const filteredUsers = usersData.filter(user => {
    const matchesSearch = !searchTerm || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.secondName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesGrade = gradeFilter === 'all' || user.grade === gradeFilter;
    const matchesGovernorate = governorateFilter === 'all' || user.governorate === governorateFilter;
    
    return matchesSearch && matchesRole && matchesGrade && matchesGovernorate;
  });

  // Show loading state if users is not available
  if (!users) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              تصفية المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إدارة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no users
  if (filteredUsers.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>إدارة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مستخدمين</h3>
              <p className="text-gray-500">لم يتم العثور على أي مستخدمين في النظام</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add User Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
        <Button onClick={handleAddUser} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          إضافة مستخدم جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            تصفية المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="البحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الصلاحية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصلاحيات</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="student">طالب</SelectItem>
              </SelectContent>
            </Select>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الصف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصفوف</SelectItem>
                <SelectItem value="7">الصف السابع</SelectItem>
                <SelectItem value="8">الصف الثامن</SelectItem>
                <SelectItem value="9">الصف التاسع</SelectItem>
                <SelectItem value="10">الصف العاشر</SelectItem>
                <SelectItem value="11">الصف الحادي عشر</SelectItem>
                <SelectItem value="12">الصف الثاني عشر</SelectItem>
              </SelectContent>
            </Select>
            <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="المحافظة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المحافظات</SelectItem>
                <SelectItem value="cairo">القاهرة</SelectItem>
                <SelectItem value="alexandria">الإسكندرية</SelectItem>
                <SelectItem value="giza">الجيزة</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportUsers} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الصلاحية</TableHead>
                <TableHead>الصف</TableHead>
                <TableHead>المحافظة</TableHead>
                <TableHead>تاريخ التسجيل</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                console.log('User in table:', user.role, user.studentId, user._id);
                return (
                <TableRow key={user._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.secondName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.thirdName} {user.fourthName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.userEmail}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role === 'admin' ? 'مدير' : 'طالب'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.grade || '-'}</TableCell>
                  <TableCell>{user.governorate || '-'}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.role === 'student' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyStudentId(user.studentId || user._id)}
                          title={`نسخ معرف الطالب: ${user.studentId || user._id}`}
                          className="text-blue-600  hover:text-blue-700"
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      )} 
                      
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => handleRoleUpdate(user._id, newRole)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">مدير</SelectItem>
                          <SelectItem value="student">طالب</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الأول *
                  </label>
                  <Input
                    required
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    placeholder="أدخل الاسم الأول"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الثاني *
                  </label>
                  <Input
                    required
                    value={userForm.secondName}
                    onChange={(e) => setUserForm({...userForm, secondName: e.target.value})}
                    placeholder="أدخل الاسم الثاني"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الثالث
                  </label>
                  <Input
                    value={userForm.thirdName}
                    onChange={(e) => setUserForm({...userForm, thirdName: e.target.value})}
                    placeholder="أدخل الاسم الثالث"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الرابع
                  </label>
                  <Input
                    value={userForm.fourthName}
                    onChange={(e) => setUserForm({...userForm, fourthName: e.target.value})}
                    placeholder="أدخل الاسم الرابع"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <Input
                    required
                    type="email"
                    value={userForm.userEmail}
                    onChange={(e) => setUserForm({...userForm, userEmail: e.target.value})}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <Input
                    value={userForm.phoneStudent}
                    onChange={(e) => setUserForm({...userForm, phoneStudent: e.target.value})}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصلاحية *
                  </label>
                  <Select 
                    value={userForm.role} 
                    onValueChange={(value) => setUserForm({...userForm, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="student">طالب</SelectItem>
                      <SelectItem value="parent">ولي أمر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصف
                  </label>
                  <Select 
                    value={userForm.grade} 
                    onValueChange={(value) => setUserForm({...userForm, grade: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">الصف السابع</SelectItem>
                      <SelectItem value="8">الصف الثامن</SelectItem>
                      <SelectItem value="9">الصف التاسع</SelectItem>
                      <SelectItem value="10">الصف العاشر</SelectItem>
                      <SelectItem value="11">الصف الحادي عشر</SelectItem>
                      <SelectItem value="12">الصف الثاني عشر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المحافظة
                  </label>
                  <Select 
                    value={userForm.governorate} 
                    onValueChange={(value) => setUserForm({...userForm, governorate: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cairo">القاهرة</SelectItem>
                      <SelectItem value="alexandria">الإسكندرية</SelectItem>
                      <SelectItem value="giza">الجيزة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingUser ? 'تحديث المستخدم' : 'إضافة المستخدم'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
