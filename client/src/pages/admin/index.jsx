import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminOverview from '../../components/admin/AdminOverview';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { 
  BookOpen, 
  Users, 
  CreditCard, 
  MessageSquare,
  Settings,
  BarChart3
} from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  
  const adminFeatures = [
    {
      icon: BookOpen,
      title: "إدارة الدورات",
      description: "إنشاء وتعديل وحذف الدورات التعليمية",
      href: "/admin/courses",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "إدارة الطلاب",
      description: "عرض وإدارة حسابات الطلاب",
      href: "/admin/students",
      color: "from-green-500 to-green-600"
    },
    {
      icon: CreditCard,
      title: "المدفوعات والاشتراكات",
      description: "مراجعة وإدارة طلبات الدفع",
      href: "/admin/payments",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: MessageSquare,
      title: "الرسائل",
      description: "التواصل مع الطلاب والإجابة على استفساراتهم",
      href: "/admin/messages",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: BarChart3,
      title: "التقارير والإحصائيات",
      description: "عرض إحصائيات المنصة والأداء",
      href: "/admin/analytics",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Settings,
      title: "إعدادات النظام",
      description: "تكوين إعدادات المنصة والمستخدمين",
      href: "/admin/settings",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <AdminLayout>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              لوحة تحكم المدير
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              إدارة شاملة لمنصة ابن مالك التعليمية
            </p>
          </div>

          {/* Admin Overview */}
          <div className="mb-12">
            <AdminOverview />
          </div>

          {/* Admin Features Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              أدوات الإدارة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <Card className="h-full bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                    <CardHeader className="text-center pb-4">
                      <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${feature.color} text-white rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon size={32} />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardHeader>
                    <CardContent className="text-center pt-0">
                      <Button 
                        className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white`}
                        onClick={() => navigate(feature.href)}
                      >
                        الوصول
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إجراءات سريعة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-12">
                <BookOpen className="h-4 w-4 mr-2" />
                إضافة دورة جديدة
              </Button>
              <Button variant="outline" className="h-12">
                <Users className="h-4 w-4 mr-2" />
                مراجعة الطلبات الجديدة
              </Button>
              <Button variant="outline" className="h-12">
                <CreditCard className="h-4 w-4 mr-2" />
                مراجعة المدفوعات
              </Button>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminPage;
