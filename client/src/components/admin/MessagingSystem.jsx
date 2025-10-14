import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import Input from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Badge from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Bell,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Reply,
  Archive,
  Star,
  StarOff,
  Paperclip,
  Smile,
  Image,
  FileText,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Users,
  MessageCircle,
  Check,
  CheckCheck,
  Info,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Share,
  Copy,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

const MessagingSystem = () => {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [starredConversations, setStarredConversations] = useState(new Set());
  const [archivedConversations, setArchivedConversations] = useState(new Set());

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call when backend is ready
      const mockMessages = [
        {
          _id: '1',
          sender: { _id: 'user1', name: 'أحمد محمد', email: 'ahmed@example.com' },
          recipient: { _id: 'admin', name: 'Admin', email: 'admin@example.com' },
          subject: 'استفسار حول الدورة',
          content: 'مرحباً، أريد الاستفسار عن محتوى دورة الرياضيات',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          type: 'inquiry'
        },
        {
          _id: '2',
          sender: { _id: 'user2', name: 'فاطمة علي', email: 'fatima@example.com' },
          recipient: { _id: 'admin', name: 'Admin', email: 'admin@example.com' },
          subject: 'مشكلة في الدفع',
          content: 'واجهت مشكلة في عملية الدفع، هل يمكن المساعدة؟',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: true,
          type: 'payment_issue'
        },
        {
          _id: '3',
          sender: { _id: 'user3', name: 'محمد حسن', email: 'mohamed@example.com' },
          recipient: { _id: 'admin', name: 'Admin', email: 'admin@example.com' },
          subject: 'طلب إضافة دورة جديدة',
          content: 'هل يمكن إضافة دورة في الفيزياء للصف الثامن؟',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: false,
          type: 'course_request'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "خطأ في تحميل الرسائل",
        description: "حدث خطأ أثناء تحميل الرسائل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark conversation as read
  const markAsRead = async (studentId) => {
    try {
      await fetch(`http://localhost:5000/api/admin/messages/${studentId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Star/Unstar conversation
  const toggleStar = (studentId) => {
    const newStarred = new Set(starredConversations);
    if (newStarred.has(studentId)) {
      newStarred.delete(studentId);
    } else {
      newStarred.add(studentId);
    }
    setStarredConversations(newStarred);
  };

  // Archive/Unarchive conversation
  const toggleArchive = (studentId) => {
    const newArchived = new Set(archivedConversations);
    if (newArchived.has(studentId)) {
      newArchived.delete(studentId);
    } else {
      newArchived.add(studentId);
    }
    setArchivedConversations(newArchived);
  };

  // Copy message to clipboard
  const copyMessage = (message) => {
    navigator.clipboard.writeText(message);
    toast({
      title: "تم نسخ الرسالة",
      description: "تم نسخ الرسالة إلى الحافظة"
    });
  };

  // Fetch messages for a specific conversation
  const fetchConversationMessages = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/messages/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSelectedConversation({
          studentId,
          student: result.student,
          messages: result.messages || []
        });
        // Mark as read when opening conversation
        markAsRead(studentId);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast({
        title: "خطأ في تحميل المحادثة",
        description: "حدث خطأ أثناء تحميل المحادثة",
        variant: "destructive"
      });
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const response = await fetch(`http://localhost:5000/api/admin/messages/${selectedConversation.studentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchConversationMessages(selectedConversation.studentId);
        fetchConversations(); // Refresh conversations list
        toast({
          title: "تم إرسال الرسالة",
          description: "تم إرسال الرسالة بنجاح"
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: "حدث خطأ أثناء إرسال الرسالة",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Group messages by student
  const conversations = messages.reduce((acc, message) => {
    const studentId = message.senderId;
    if (!acc[studentId]) {
      acc[studentId] = {
        student: message.sender,
        lastMessage: message,
        unreadCount: message.isRead ? 0 : 1,
        isOnline: onlineUsers.has(studentId),
        isStarred: starredConversations.has(studentId),
        isArchived: archivedConversations.has(studentId)
      };
    } else {
      if (new Date(message.createdAt) > new Date(acc[studentId].lastMessage.createdAt)) {
        acc[studentId].lastMessage = message;
      }
      if (!message.isRead) {
        acc[studentId].unreadCount++;
      }
    }
    return acc;
  }, {});

  // Filter conversations based on search and status
  const filteredConversations = Object.entries(conversations).filter(([studentId, conversation]) => {
    const matchesSearch = !searchTerm || 
      conversation.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.student.secondName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'unread' && conversation.unreadCount > 0) ||
      (filterStatus === 'starred' && conversation.isStarred) ||
      (filterStatus === 'archived' && conversation.isArchived);
    
    return matchesSearch && matchesFilter;
  }).sort(([, a], [, b]) => {
    // Sort by starred first, then by last message date
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">جاري تحميل الرسائل...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي المحادثات</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(conversations).length}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">الرسائل غير المقروءة</p>
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(conversations).reduce((sum, conv) => sum + conv.unreadCount, 0)}
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المحادثات المميزة</p>
                <p className="text-2xl font-bold text-yellow-600">{starredConversations.size}</p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المستخدمون المتصلون</p>
                <p className="text-2xl font-bold text-green-600">{onlineUsers.size}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Enhanced Conversations List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  المحادثات
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchConversations}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في المحادثات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="تصفية المحادثات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المحادثات</SelectItem>
                    <SelectItem value="unread">غير مقروءة</SelectItem>
                    <SelectItem value="starred">مميزة</SelectItem>
                    <SelectItem value="archived">مؤرشفة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-[550px] overflow-y-auto">
                <AnimatePresence>
                  {filteredConversations.map(([studentId, conversation], index) => (
                    <motion.div
                      key={studentId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => fetchConversationMessages(studentId)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                        selectedConversation?.studentId === studentId 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {conversation.student.firstName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <div className="font-medium text-sm truncate">
                                {conversation.student.firstName} {conversation.student.secondName}
                              </div>
                              {conversation.isStarred && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {conversation.lastMessage.message}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-1">
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(conversation.lastMessage.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredConversations.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                  >
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p>لا توجد محادثات</p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="h-full backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {selectedConversation.student.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {selectedConversation.student.firstName} {selectedConversation.student.secondName}
                        </CardTitle>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>متصل الآن</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(selectedConversation.studentId)}
                        className="h-8 w-8 p-0"
                      >
                        {starredConversations.has(selectedConversation.studentId) ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleArchive(selectedConversation.studentId)}
                        className="h-8 w-8 p-0"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="p-0 flex flex-col h-[550px]">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {selectedConversation.messages.map((message, index) => (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${message.senderId === selectedConversation.studentId ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className="group max-w-[70%]">
                            <div
                              className={`p-3 rounded-2xl ${
                                message.senderId === selectedConversation.studentId
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                                  : 'bg-blue-600 text-white rounded-br-md'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3 opacity-70" />
                                  <span className="text-xs opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString('ar-EG', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {message.senderId !== selectedConversation.studentId && (
                                  <div className="flex items-center space-x-1">
                                    {message.isRead ? (
                                      <CheckCheck className="h-3 w-3 text-green-400" />
                                    ) : (
                                      <Check className="h-3 w-3 text-gray-400" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Message Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1 mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.message)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Reply className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-md">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Enhanced Message Input */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-end space-x-3">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                          }}
                          placeholder="اكتب رسالتك..."
                          className="min-h-[40px] max-h-[120px] resize-none border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                          className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700"
                        >
                          {sending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <MessageSquare className="h-20 w-20 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    اختر محادثة للبدء
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500">
                    اختر محادثة من القائمة الجانبية لبدء المحادثة
                  </p>
                </motion.div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MessagingSystem;
