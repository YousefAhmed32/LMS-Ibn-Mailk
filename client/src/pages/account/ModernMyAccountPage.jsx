import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Edit3,
  Key,
  LogOut,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  Settings,
  Smartphone
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

const ModernMyAccountPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data for editing profile
  const [editForm, setEditForm] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    fourthName: '',
    phoneStudent: '',
    phoneNumber: '',
    governorate: '',
    grade: ''
  });
  
  // Form data for changing password
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        secondName: user.secondName || '',
        thirdName: user.thirdName || '',
        fourthName: user.fourthName || '',
        phoneStudent: user.phoneStudent || '',
        phoneNumber: user.phoneNumber || '',
        governorate: user.governorate || '',
        grade: user.grade || ''
      });
    }
  }, [user]);

  // Copy ID functionality
  const handleCopyId = async () => {
    if (!user?._id) return;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(user._id);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = user._id;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Student ID copied to clipboard",
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy ID:', error);
      toast({
        title: "Error",
        description: "Failed to copy ID",
        variant: "destructive",
      });
    }
  };

  // Handle profile edit
  const handleEditProfile = async () => {
    try {
      setLoading(true);
      
      const response = await axiosInstance.put('/api/auth/update', editForm);
      
      if (response.data.success) {
        updateUser(response.data.user);
        setEditModalOpen(false);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      } else {
        throw new Error(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || 'Failed to update profile',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await axiosInstance.put('/api/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.data.success) {
        setPasswordModalOpen(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
      } else {
        throw new Error(response.data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || 'Failed to change password',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const secondName = user.secondName || '';
    return (firstName.charAt(0) + secondName.charAt(0)).toUpperCase();
  };

  // Get full name
  const getFullName = () => {
    if (!user) return 'User';
    const names = [user.firstName, user.secondName, user.thirdName, user.fourthName].filter(Boolean);
    return names.join(' ') || 'User';
  };

  // Get phone number based on role
  const getPhoneNumber = () => {
    if (!user) return '';
    if (user.role === 'student') return user.phoneStudent || '';
    return user.phoneNumber || '';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const governorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
    'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
    'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
    'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
    'قنا', 'شمال سيناء', 'سوهاج'
  ];

  const grades = [
    { value: '7', label: 'أولى إعدادي' },
    { value: '8', label: 'ثانية إعدادي' },
    { value: '9', label: 'ثالثة إعدادي' },
    { value: '10', label: 'أولى ثانوي' },
    { value: '11', label: 'ثانية ثانوي' },
    { value: '12', label: 'ثالثة ثانوي' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your profile and account settings
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            <CardContent className="relative -mt-16 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-700 shadow-xl">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                    {getFullName()}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {user.userEmail}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300">
                    <Shield className="w-4 h-4" />
                    {user.role === 'student' ? 'Student' : user.role === 'parent' ? 'Parent' : 'Admin'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Copy ID Button - Only for students */}
                  {user.role === 'student' && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleCopyId}
                        variant="outline"
                        size="sm"
                        className="rounded-2xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20 transition-all duration-300"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="ml-2">{copied ? 'Copied!' : 'Copy ID'}</span>
                      </Button>
                    </motion.div>
                  )}

                  {/* Edit Profile Button */}
                  <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20 transition-all duration-300"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="ml-2">Edit Profile</span>
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your profile information below.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={editForm.firstName}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secondName">Second Name</Label>
                          <Input
                            id="secondName"
                            value={editForm.secondName}
                            onChange={(e) => setEditForm({ ...editForm, secondName: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thirdName">Third Name</Label>
                          <Input
                            id="thirdName"
                            value={editForm.thirdName}
                            onChange={(e) => setEditForm({ ...editForm, thirdName: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fourthName">Fourth Name</Label>
                          <Input
                            id="fourthName"
                            value={editForm.fourthName}
                            onChange={(e) => setEditForm({ ...editForm, fourthName: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={user.role === 'student' ? editForm.phoneStudent : editForm.phoneNumber}
                            onChange={(e) => {
                              if (user.role === 'student') {
                                setEditForm({ ...editForm, phoneStudent: e.target.value });
                              } else {
                                setEditForm({ ...editForm, phoneNumber: e.target.value });
                              }
                            }}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="governorate">Governorate</Label>
                          <Select
                            value={editForm.governorate}
                            onValueChange={(value) => setEditForm({ ...editForm, governorate: value })}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select governorate" />
                            </SelectTrigger>
                            <SelectContent>
                              {governorates.map((gov) => (
                                <SelectItem key={gov} value={gov}>
                                  {gov}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {user.role === 'student' && (
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="grade">Grade</Label>
                            <Select
                              value={editForm.grade}
                              onValueChange={(value) => setEditForm({ ...editForm, grade: value })}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {grades.map((grade) => (
                                  <SelectItem key={grade.value} value={grade.value}>
                                    {grade.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setEditModalOpen(false)}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleEditProfile}
                          disabled={loading}
                          className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Change Password Button */}
                  <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-2xl border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:border-amber-600 dark:hover:bg-amber-900/20 transition-all duration-300"
                        >
                          <Key className="w-4 h-4" />
                          <span className="ml-2">Change Password</span>
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="oldPassword">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="oldPassword"
                              type={showOldPassword ? "text" : "password"}
                              value={passwordForm.oldPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                              className="rounded-xl pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                              {showOldPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="rounded-xl pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="rounded-xl pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setPasswordModalOpen(false)}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleChangePassword}
                          disabled={loading}
                          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Logout Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="rounded-2xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:border-red-600 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="ml-2">Logout</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white">
                  <User className="w-5 h-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Full Name</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{getFullName()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{user.userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Phone Number</p>
                    <p className="font-semibold text-slate-800 dark:text-white">{getPhoneNumber() || 'Not provided'}</p>
                  </div>
                </div>

                {user.role === 'student' && user._id && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900/30 dark:to-purple-800/30 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Student ID</p>
                      <p className="font-mono text-sm text-slate-800 dark:text-white">{user._id}</p>
                    </div>
                    <Button
                      onClick={handleCopyId}
                      variant="ghost"
                      size="sm"
                      className="rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-600" />
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Academic Information (for students) or Location Info */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white">
                  {user.role === 'student' ? (
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  )}
                  {user.role === 'student' ? 'Academic Information' : 'Location Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.role === 'student' && user.grade && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Grade</p>
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {grades.find(g => g.value === user.grade)?.label || `Grade ${user.grade}`}
                      </p>
                    </div>
                  </div>
                )}

                {user.governorate && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Governorate</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{user.governorate}</p>
                    </div>
                  </div>
                )}

                {user.role === 'parent' && user.relation && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Relation</p>
                      <p className="font-semibold text-slate-800 dark:text-white">{user.relation}</p>
                    </div>
                  </div>
                )}

                {(!user.grade && !user.governorate && (!user.relation || user.role !== 'parent')) && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                      <Settings className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">No additional information available</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                      Click "Edit Profile" to add more details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernMyAccountPage;
