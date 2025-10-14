import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
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
  Plus,
  X
} from 'lucide-react';

const MessagesCenter = () => {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Mock data
  const conversations = [
    {
      id: 1,
      student: {
        id: 1,
        name: 'أحمد محمد',
        avatar: null,
        grade: 'الصف العاشر',
        isOnline: true
      },
      lastMessage: {
        text: 'شكراً لك على الشرح الواضح',
        time: 'منذ 5 دقائق',
        isRead: false,
        sender: 'student'
      },
      unreadCount: 2,
      isStarred: false,
      isArchived: false
    },
    {
      id: 2,
      student: {
        id: 2,
        name: 'سارة أحمد',
        avatar: null,
        grade: 'الصف التاسع',
        isOnline: false
      },
      lastMessage: {
        text: 'هل يمكنك مساعدتي في حل هذا السؤال؟',
        time: 'منذ 15 دقيقة',
        isRead: true,
        sender: 'student'
      },
      unreadCount: 0,
      isStarred: true,
      isArchived: false
    },
    {
      id: 3,
      student: {
        id: 3,
        name: 'محمد علي',
        avatar: null,
        grade: 'الصف الحادي عشر',
        isOnline: true
      },
      lastMessage: {
        text: 'متى سيكون الاختبار القادم؟',
        time: 'منذ ساعة',
        isRead: false,
        sender: 'student'
      },
      unreadCount: 1,
      isStarred: false,
      isArchived: false
    }
  ];

  const messages = [
    {
      id: 1,
      text: 'مرحباً، كيف يمكنني مساعدتك؟',
      time: '10:30 ص',
      sender: 'admin',
      isRead: true
    },
    {
      id: 2,
      text: 'أريد الاستفسار عن الدورة الجديدة',
      time: '10:32 ص',
      sender: 'student',
      isRead: true
    },
    {
      id: 3,
      text: 'بالطبع، ما هو استفسارك تحديداً؟',
      time: '10:33 ص',
      sender: 'admin',
      isRead: true
    },
    {
      id: 4,
      text: 'هل الدورة مناسبة للمبتدئين؟',
      time: '10:35 ص',
      sender: 'student',
      isRead: false
    }
  ];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'unread' && conv.unreadCount > 0) ||
      (filterStatus === 'starred' && conv.isStarred) ||
      (filterStatus === 'archived' && conv.isArchived);
    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      toast({
        title: "تم إرسال الرسالة",
        description: "تم إرسال رسالتك بنجاح",
        variant: "success"
      });
      setNewMessage('');
    }
  };

  const handleReply = (conversationId) => {
    setSelectedConversation(conversationId);
    toast({
      title: "فتح المحادثة",
      description: "تم فتح المحادثة للرد",
      variant: "success"
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            مركز الرسائل
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            {conversations.filter(c => c.unreadCount > 0).length} رسائل جديدة
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث في المحادثات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">جميع المحادثات</option>
                  <option value="unread">غير مقروءة</option>
                  <option value="starred">مميزة</option>
                  <option value="archived">مؤرشفة</option>
                </select>
              </div>

              {/* Conversations */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedConversation === conversation.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        {conversation.student.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {conversation.student.name}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {conversation.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                          {conversation.lastMessage.text}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {conversation.lastMessage.time}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {conversation.student.grade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="h-96 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {conversations.find(c => c.id === selectedConversation)?.student.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {conversations.find(c => c.id === selectedConversation)?.student.grade}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === 'admin'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center justify-between mt-1 text-xs ${
                          message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          <span>{message.time}</span>
                          {message.sender === 'admin' && (
                            <div className="flex items-center">
                              {message.isRead ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="اكتب رسالتك..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    اختر محادثة
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    اختر محادثة من القائمة لبدء المحادثة
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesCenter;
