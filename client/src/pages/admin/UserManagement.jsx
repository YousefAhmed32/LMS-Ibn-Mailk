import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  X,
  Check,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Shield,
  Crown,
  Mail,
  Phone,
  Calendar,
  MapPin,
  BookOpen,
  CreditCard,
  Activity,
  MoreVertical,
  Ban,
  CheckCircle,
  Clock,
  Star,
  Copy,
  UserPlus,
  Clipboard
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import { toast } from '../../hooks/use-toast';

const UserManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form states
  const [userForm, setUserForm] = useState({
    firstName: '',
    secondName: '',
    userEmail: '',
    password: '',
    phoneNumber: '',
    governorate: '',
    grade: '',
    role: 'student',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/users');
      if (response.data.success) {
        console.log('Users data from server:', response.data.data); // Debug log
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/admin/users', userForm);
      if (response.data.success) {
        setShowCreateModal(false);
        setUserForm({
          firstName: '',
          secondName: '',
          userEmail: '',
          password: '',
          phoneNumber: '',
          governorate: '',
          grade: '',
          role: 'student',
          isActive: true
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/api/admin/users/${selectedUser._id}`, userForm);
      if (response.data.success) {
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
        if (response.data.success) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/users/${userId}/status`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/users/${userId}/role`, {
        role: newRole
      });
      if (response.data.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error changing user role:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.secondName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isActive) ||
                         (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown size={16} color={colors.warning} />;
      case 'teacher':
        return <Shield size={16} color={colors.info} />;
      case 'student':
        return <Users size={16} color={colors.accent} />;
      case 'parent':
        return <Users size={16} color={colors.success} />;
      default:
        return <Users size={16} color={colors.textMuted} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return colors.warning;
      case 'teacher':
        return colors.info;
      case 'student':
        return colors.accent;
      case 'parent':
        return colors.success;
      default:
        return colors.textMuted;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'teacher':
        return 'معلم';
      case 'student':
        return 'طالب';
      case 'parent':
        return 'ولي أمر';
      default:
        return 'غير محدد';
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const copyStudentId = async (studentId) => {
    try {
      console.log('Copying Student ID:', studentId); // Debug log
      console.log('Student ID type:', typeof studentId); // Debug log
      
      // Visual feedback - change button temporarily
      const button = event?.target?.closest('button');
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
        }, 150);
      }
      
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(studentId);
      } else {
        // Fallback for older browsers or non-secure contexts
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
      
      toast({
        title: "✅ Student ID copied to clipboard!",
        description: `تم نسخ ${studentId} إلى الحافظة بنجاح`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy student ID:', error);
      toast({
        title: "❌ فشل في النسخ",
        description: "فشل في نسخ معرف الطالب إلى الحافظة",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const addStudentToGroup = (student) => {
    // Navigate to groups management with student pre-selected
    navigate('/admin/groups', { 
      state: { 
        addStudent: student,
        showAddStudentModal: true 
      } 
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Users size={32} color={colors.accent} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      padding: spacing.lg
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing['2xl']
      }}>
        <div>
          <h1 style={{
            color: colors.text,
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            إدارة المستخدمين
          </h1>
          <p style={{
            color: colors.textMuted,
            fontSize: typography.fontSize.lg,
            margin: 0
          }}>
            إدارة جميع المستخدمين والأدوار
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: spacing.md }}>
          <LuxuryButton
            variant="outline"
            onClick={() => {
              // Export users functionality
            }}
          >
            <Download size={16} style={{ marginLeft: spacing.xs }} />
            تصدير
          </LuxuryButton>
          
          <LuxuryButton
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} style={{ marginLeft: spacing.sm }} />
            إضافة مستخدم
          </LuxuryButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.lg,
        marginBottom: spacing['2xl']
      }}>
        <LuxuryCard>
          <div style={{ padding: spacing.lg, textAlign: 'center' }}>
            <Users size={32} color={colors.accent} style={{ marginBottom: spacing.md }} />
            <h3 style={{ color: colors.text, margin: 0, fontSize: typography.fontSize['2xl'] }}>
              {users.filter(u => u.role === 'student').length}
            </h3>
            <p style={{ color: colors.textMuted, margin: 0 }}>طالب</p>
          </div>
        </LuxuryCard>
        
        <LuxuryCard>
          <div style={{ padding: spacing.lg, textAlign: 'center' }}>
            <Shield size={32} color={colors.info} style={{ marginBottom: spacing.md }} />
            <h3 style={{ color: colors.text, margin: 0, fontSize: typography.fontSize['2xl'] }}>
              {users.filter(u => u.role === 'teacher').length}
            </h3>
            <p style={{ color: colors.textMuted, margin: 0 }}>معلم</p>
          </div>
        </LuxuryCard>
        
        <LuxuryCard>
          <div style={{ padding: spacing.lg, textAlign: 'center' }}>
            <Crown size={32} color={colors.warning} style={{ marginBottom: spacing.md }} />
            <h3 style={{ color: colors.text, margin: 0, fontSize: typography.fontSize['2xl'] }}>
              {users.filter(u => u.role === 'admin').length}
            </h3>
            <p style={{ color: colors.textMuted, margin: 0 }}>مدير</p>
          </div>
        </LuxuryCard>
        
        <LuxuryCard>
          <div style={{ padding: spacing.lg, textAlign: 'center' }}>
            <Users size={32} color={colors.success} style={{ marginBottom: spacing.md }} />
            <h3 style={{ color: colors.text, margin: 0, fontSize: typography.fontSize['2xl'] }}>
              {users.filter(u => u.role === 'parent').length}
            </h3>
            <p style={{ color: colors.textMuted, margin: 0 }}>ولي أمر</p>
          </div>
        </LuxuryCard>
        
        <LuxuryCard>
          <div style={{ padding: spacing.lg, textAlign: 'center' }}>
            <Activity size={32} color={colors.success} style={{ marginBottom: spacing.md }} />
            <h3 style={{ color: colors.text, margin: 0, fontSize: typography.fontSize['2xl'] }}>
              {users.filter(u => u.isActive).length}
            </h3>
            <p style={{ color: colors.textMuted, margin: 0 }}>نشط</p>
          </div>
        </LuxuryCard>
      </div>

      {/* Filters */}
      <LuxuryCard style={{ marginBottom: spacing.lg }}>
        <div style={{ padding: spacing.lg }}>
          <div style={{
            display: 'flex',
            gap: spacing.md,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={20} style={{
                position: 'absolute',
                right: spacing.md,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textMuted
              }} />
              <input
                type="text"
                placeholder="البحث في المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  paddingRight: spacing['2xl'],
                  border: `1px solid ${colors.border}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontSize: typography.fontSize.sm
                }}
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius.md,
                backgroundColor: colors.surface,
                color: colors.text,
                fontSize: typography.fontSize.sm
              }}
            >
              <option value="all">جميع الأدوار</option>
              <option value="student">طالب</option>
              <option value="teacher">معلم</option>
              <option value="admin">مدير</option>
              <option value="parent">ولي أمر</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius.md,
                backgroundColor: colors.surface,
                color: colors.text,
                fontSize: typography.fontSize.sm
              }}
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>
      </LuxuryCard>

      {/* Users Table */}
      <LuxuryCard>
        <div style={{ padding: spacing.lg }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  borderBottom: `2px solid ${colors.border}`
                }}>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'right',
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold
                  }}>
                    المستخدم
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'right',
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold
                  }}>
                    الدور
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'right',
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold
                  }}>
                    الحالة
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'right',
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold
                  }}>
                    تاريخ التسجيل
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold
                  }}>
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} style={{
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'background-color 0.2s ease'
                  }}>
                    <td style={{ padding: spacing.md }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: borderRadius.full,
                          backgroundColor: colors.accent + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Users size={20} color={colors.accent} />
                        </div>
                        <div>
                          <p style={{
                            color: colors.text,
                            margin: 0,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium
                          }}>
                            {user.firstName} {user.secondName}
                          </p>
                          <p style={{
                            color: colors.textMuted,
                            margin: 0,
                            fontSize: typography.fontSize.xs
                          }}>
                            {user.userEmail || user.email || 'غير محدد'}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: spacing.md }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs
                      }}>
                        {getRoleIcon(user.role)}
                        <span style={{
                          color: getRoleColor(user.role),
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium
                        }}>
                          {getRoleText(user.role)}
                        </span>
                      </div>
                    </td>
                    
                    <td style={{ padding: spacing.md }}>
                      <span style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        borderRadius: borderRadius.sm,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.medium,
                        backgroundColor: user.isActive ? colors.success + '20' : colors.error + '20',
                        color: user.isActive ? colors.success : colors.error
                      }}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    
                    <td style={{ padding: spacing.md }}>
                      <span style={{
                        color: colors.textMuted,
                        fontSize: typography.fontSize.sm
                      }}>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    
                    <td style={{ padding: spacing.md }}>
                      <div style={{
                        display: 'flex',
                        gap: spacing.xs,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsModal(true);
                          }}
                          title="عرض التفاصيل"
                          className="hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        >
                          <Eye size={16} className="text-green-600" />
                        </LuxuryButton>
                        
                        
                        <LuxuryButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserForm(user);
                            setShowEditModal(true);
                          }}
                          title="تعديل المستخدم"
                          className="hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
                        >
                          <Edit size={16} className="text-orange-600" />
                        </LuxuryButton>
                        
                        {user.role === 'student' && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <LuxuryButton
                              variant="outline"
                              size="sm"
                              onClick={() => copyStudentId(user.studentId || user._id)}
                              title={`نسخ معرف الطالب: ${user.studentId || user._id}`}
                              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                            >
                              <Clipboard size={16} className="text-blue-600 group-hover:text-blue-700" />
                            </LuxuryButton>
                          </motion.div>
                        )}
                        
                        {user.role === 'student' && (
                          <LuxuryButton
                            variant="outline"
                            size="sm"
                            onClick={() => addStudentToGroup(user)}
                            title="إضافة للمجموعة"
                            className="hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                          >
                            <UserPlus size={16} className="text-purple-600" />
                          </LuxuryButton>
                        )}
                        
                        {/* Ban/Unban Button */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LuxuryButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                            title={user.isActive ? "حظر المستخدم" : "إلغاء حظر المستخدم"}
                            className={`transition-all duration-200 ${
                              user.isActive 
                                ? "hover:bg-red-50 hover:border-red-300" 
                                : "hover:bg-green-50 hover:border-green-300"
                            }`}
                          >
                            {user.isActive ? (
                              <Ban size={16} className="text-red-600" />
                            ) : (
                              <CheckCircle size={16} className="text-green-600" />
                            )}
                          </LuxuryButton>
                        </motion.div>
                        
                        {/* Delete Button */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LuxuryButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            title="حذف المستخدم نهائياً من قاعدة البيانات"
                            className="hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </LuxuryButton>
                        </motion.div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
              <Users size={48} color={colors.textMuted} style={{ marginBottom: spacing.md }} />
              <p style={{ color: colors.textMuted, margin: 0 }}>
                لا توجد نتائج مطابقة للبحث
              </p>
            </div>
          )}
        </div>
      </LuxuryCard>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing['2xl'],
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.lg
              }}>
                <h2 style={{ color: colors.text, margin: 0, fontSize: typography.fontSize.xl }}>
                  إضافة مستخدم جديد
                </h2>
                <LuxuryButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X size={16} />
                </LuxuryButton>
              </div>
              
              <form onSubmit={handleCreateUser}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                    <div>
                      <label style={{
                        display: 'block',
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing.xs
                      }}>
                        الاسم الأول
                      </label>
                      <input
                        type="text"
                        required
                        value={userForm.firstName}
                        onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          border: `1px solid ${colors.border}`,
                          borderRadius: borderRadius.md,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: typography.fontSize.sm
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing.xs
                      }}>
                        الاسم الثاني
                      </label>
                      <input
                        type="text"
                        required
                        value={userForm.secondName}
                        onChange={(e) => setUserForm({ ...userForm, secondName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          border: `1px solid ${colors.border}`,
                          borderRadius: borderRadius.md,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: typography.fontSize.sm
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      color: colors.text,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      marginBottom: spacing.xs
                    }}>
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={userForm.userEmail}
                      onChange={(e) => setUserForm({ ...userForm, userEmail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        border: `1px solid ${colors.border}`,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.background,
                        color: colors.text,
                        fontSize: typography.fontSize.sm
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      color: colors.text,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      marginBottom: spacing.xs
                    }}>
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      required
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        border: `1px solid ${colors.border}`,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.background,
                        color: colors.text,
                        fontSize: typography.fontSize.sm
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                    <div>
                      <label style={{
                        display: 'block',
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing.xs
                      }}>
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        value={userForm.phoneNumber}
                        onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          border: `1px solid ${colors.border}`,
                          borderRadius: borderRadius.md,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: typography.fontSize.sm
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing.xs
                      }}>
                        المحافظة
                      </label>
                      <select
                        value={userForm.governorate}
                        onChange={(e) => setUserForm({ ...userForm, governorate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          border: `1px solid ${colors.border}`,
                          borderRadius: borderRadius.md,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: typography.fontSize.sm
                        }}
                      >
                        <option value="">اختر المحافظة</option>
                        <option value="cairo">القاهرة</option>
                        <option value="giza">الجيزة</option>
                        <option value="alexandria">الإسكندرية</option>
                        <option value="sharqia">الشرقية</option>
                        <option value="dakahlia">الدقهلية</option>
                        <option value="gharbia">الغربية</option>
                        <option value="qalyubia">القليوبية</option>
                        <option value="monufia">المنوفية</option>
                        <option value="beheira">البحيرة</option>
                        <option value="kafr_el_sheikh">كفر الشيخ</option>
                        <option value="damietta">دمياط</option>
                        <option value="port_said">بورسعيد</option>
                        <option value="ismailia">الإسماعيلية</option>
                        <option value="suez">السويس</option>
                        <option value="north_sinai">شمال سيناء</option>
                        <option value="south_sinai">جنوب سيناء</option>
                        <option value="red_sea">البحر الأحمر</option>
                        <option value="new_valley">الوادي الجديد</option>
                        <option value="matrouh">مطروح</option>
                        <option value="luxor">الأقصر</option>
                        <option value="aswan">أسوان</option>
                        <option value="qena">قنا</option>
                        <option value="sohag">سوهاج</option>
                        <option value="assiut">أسيوط</option>
                        <option value="minya">المنيا</option>
                        <option value="beni_suef">بني سويف</option>
                        <option value="fayyum">الفيوم</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                    <div>
                      <label style={{
                        display: 'block',
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing.xs
                      }}>
                        الصف
                      </label>
                      <select
                        value={userForm.grade}
                        onChange={(e) => setUserForm({ ...userForm, grade: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          border: `1px solid ${colors.border}`,
                          borderRadius: borderRadius.md,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: typography.fontSize.sm
                        }}
                      >
                        <option value="">اختر الصف</option>
                        <option value="grade1">الصف الأول</option>
                        <option value="grade2">الصف الثاني</option>
                        <option value="grade3">الصف الثالث</option>
                        <option value="grade4">الصف الرابع</option>
                        <option value="grade5">الصف الخامس</option>
                        <option value="grade6">الصف السادس</option>
                        <option value="7">أولى إعدادي</option>
                        <option value="8">ثانية إعدادي</option>
                        <option value="9">ثالثة إعدادي</option>
                        <option value="10">أولى ثانوي</option>
                        <option value="11">ثانية ثانوي</option>
                        <option value="12">ثالثة ثانوي</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        color: colors.text,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing.xs
                      }}>
                        الدور
                      </label>
                      <select
                        required
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          border: `1px solid ${colors.border}`,
                          borderRadius: borderRadius.md,
                          backgroundColor: colors.background,
                          color: colors.text,
                          fontSize: typography.fontSize.sm
                        }}
                      >
                        <option value="student">طالب</option>
                        <option value="teacher">معلم</option>
                        <option value="admin">مدير</option>
                        <option value="parent">ولي أمر</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm
                  }}>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={userForm.isActive}
                      onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" style={{
                      color: colors.text,
                      fontSize: typography.fontSize.sm,
                      margin: 0
                    }}>
                      مستخدم نشط
                    </label>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: spacing.md,
                  marginTop: spacing.lg,
                  justifyContent: 'flex-end'
                }}>
                  <LuxuryButton
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    إلغاء
                  </LuxuryButton>
                  <LuxuryButton type="submit" variant="primary">
                    <Save size={16} style={{ marginLeft: spacing.xs }} />
                    حفظ المستخدم
                  </LuxuryButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* User Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing['2xl'],
                  width: '90%',
                  maxWidth: '600px',
                  maxHeight: '90vh',
                  overflow: 'auto'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.lg
                }}>
                  <h2 style={{ color: colors.text, margin: 0, fontSize: typography.fontSize.xl }}>
                    تفاصيل المستخدم
                  </h2>
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <X size={16} />
                  </LuxuryButton>
                </div>
                
                <div className="space-y-6">
                  {/* User Info Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.lg,
                    padding: spacing.lg,
                    backgroundColor: colors.background,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border}`
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: borderRadius.full,
                      backgroundColor: colors.accent + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={24} style={{ color: colors.accent }} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 style={{
                        color: colors.text,
                        margin: 0,
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.bold
                      }}>
                        {selectedUser.firstName} {selectedUser.secondName}
                      </h3>
                      <p style={{
                        color: colors.textMuted,
                        margin: 0,
                        fontSize: typography.fontSize.sm
                      }}>
                        {selectedUser.userEmail || selectedUser.email || 'غير محدد'}
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.xs
                    }}>
                      {getRoleIcon(selectedUser.role)}
                      <span style={{
                        color: getRoleColor(selectedUser.role),
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium
                      }}>
                        {getRoleText(selectedUser.role)}
                      </span>
                    </div>
                  </div>

                  {/* Student ID Section */}
                  {selectedUser.role === 'student' && (
                    <div style={{
                      padding: spacing.lg,
                      backgroundColor: colors.background,
                      borderRadius: borderRadius.md,
                      border: `1px solid ${colors.border}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: spacing.sm
                      }}>
                        <h4 style={{
                          color: colors.text,
                          margin: 0,
                          fontSize: typography.fontSize.md,
                          fontWeight: typography.fontWeight.semibold
                        }}>
                          معرف الطالب
                        </h4>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LuxuryButton
                            variant="outline"
                            size="sm"
                            onClick={() => copyStudentId(selectedUser.studentId || selectedUser._id)}
                            title={`نسخ معرف الطالب: ${selectedUser.studentId || selectedUser._id}`}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                          >
                            <Clipboard size={16} className="text-blue-600 group-hover:text-blue-700" />
                            <span style={{ marginLeft: spacing.xs }}>نسخ</span>
                          </LuxuryButton>
                        </motion.div>
                      </div>
                      
                      <div style={{
                        padding: spacing.md,
                        backgroundColor: colors.surface,
                        borderRadius: borderRadius.sm,
                        border: `1px solid ${colors.border}`
                      }}>
                        <code style={{
                          color: colors.text,
                          fontSize: typography.fontSize.sm,
                          fontFamily: 'monospace',
                          fontWeight: typography.fontWeight.medium
                        }}>
                          {selectedUser.studentId || selectedUser._id}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* User Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: spacing.lg
                  }}>
                    <div>
                      <h4 style={{
                        color: colors.text,
                        margin: 0,
                        marginBottom: spacing.sm,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold
                      }}>
                        معلومات الاتصال
                      </h4>
                      <div className="space-y-2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <Mail size={16} style={{ color: colors.textMuted }} />
                          <span style={{ color: colors.text, fontSize: typography.fontSize.sm }}>
                            {selectedUser.userEmail || selectedUser.email || 'غير محدد'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <Phone size={16} style={{ color: colors.textMuted }} />
                          <span style={{ color: colors.text, fontSize: typography.fontSize.sm }}>
                            {selectedUser.phoneStudent || 'غير محدد'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <MapPin size={16} style={{ color: colors.textMuted }} />
                          <span style={{ color: colors.text, fontSize: typography.fontSize.sm }}>
                            {selectedUser.governorate || 'غير محدد'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{
                        color: colors.text,
                        margin: 0,
                        marginBottom: spacing.sm,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold
                      }}>
                        معلومات إضافية
                      </h4>
                      <div className="space-y-2">
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <Calendar size={16} style={{ color: colors.textMuted }} />
                          <span style={{ color: colors.text, fontSize: typography.fontSize.sm }}>
                            تاريخ التسجيل: {formatDate(selectedUser.createdAt)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                          <Activity size={16} style={{ color: colors.textMuted }} />
                          <span style={{
                            color: selectedUser.isActive ? colors.success : colors.error,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.medium
                          }}>
                            {selectedUser.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                        {selectedUser.grade && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                            <BookOpen size={16} style={{ color: colors.textMuted }} />
                            <span style={{ color: colors.text, fontSize: typography.fontSize.sm }}>
                              الصف: {selectedUser.grade}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
