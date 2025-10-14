import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Badge from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Server, 
  Database, 
  Cloud, 
  Users, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';

const SystemStatus = () => {
  const { isDark } = useTheme();
  const [systemStats, setSystemStats] = useState({
    server: { status: 'online', uptime: '99.9%', responseTime: '45ms' },
    database: { status: 'online', connections: 12, queries: 156 },
    cloudinary: { status: 'online', uploads: 23, storage: '2.3GB' },
    users: { online: 45, total: 1250, newToday: 8 }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  const statusItems = [
    {
      id: 'server',
      title: 'الخادم',
      icon: Server,
      status: systemStats.server.status,
      details: [
        { label: 'وقت التشغيل', value: systemStats.server.uptime },
        { label: 'وقت الاستجابة', value: systemStats.server.responseTime }
      ]
    },
    {
      id: 'database',
      title: 'قاعدة البيانات',
      icon: Database,
      status: systemStats.database.status,
      details: [
        { label: 'الاتصالات النشطة', value: systemStats.database.connections },
        { label: 'الاستعلامات/دقيقة', value: systemStats.database.queries }
      ]
    },
    {
      id: 'cloudinary',
      title: 'Cloudinary',
      icon: Cloud,
      status: systemStats.cloudinary.status,
      details: [
        { label: 'الرفوعات اليوم', value: systemStats.cloudinary.uploads },
        { label: 'المساحة المستخدمة', value: systemStats.cloudinary.storage }
      ]
    },
    {
      id: 'users',
      title: 'المستخدمين',
      icon: Users,
      status: 'online',
      details: [
        { label: 'المستخدمين النشطين', value: systemStats.users.online },
        { label: 'المجموع', value: systemStats.users.total },
        { label: 'جدد اليوم', value: systemStats.users.newToday }
      ]
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          حالة النظام
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusItems.map((item, index) => {
            const Icon = item.icon;
            const StatusIcon = getStatusIcon(item.status);
            const statusColor = getStatusColor(item.status);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border-2 ${statusColor} border-l-4 border-l-green-500`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold text-sm">{item.title}</span>
                  </div>
                  <StatusIcon className="h-4 w-4" />
                </div>
                
                <div className="space-y-2">
                  {item.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex justify-between items-center text-xs">
                      <span className="opacity-75">{detail.label}</span>
                      <span className="font-medium">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* System Performance Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-200">
                الأداء العام
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-800 dark:text-green-200 font-bold">
                ممتاز
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
            جميع الأنظمة تعمل بكفاءة عالية
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
