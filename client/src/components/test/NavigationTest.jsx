import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import { 
  Home, 
  BookOpen, 
  User, 
  Settings, 
  GraduationCap, 
  Shield,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';

const NavigationTest = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const navigationItems = [
    { name: 'الرئيسية', href: '/', icon: Home, public: true },
    { name: 'الدورات', href: '/courses', icon: BookOpen, public: false },
    { name: 'اشتراكاتي', href: '/my-subscriptions', icon: GraduationCap, public: false },
    { name: 'لوحة التحكم', href: '/dashboard', icon: User, public: false },
    { name: 'لوحة الإدارة', href: '/admin', icon: Shield, public: false, adminOnly: true },
  ];

  const authItems = [
    { name: 'تسجيل الدخول', href: '/login', icon: User, public: true, authRequired: false },
    { name: 'إنشاء حساب', href: '/register', icon: User, public: true, authRequired: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Navigation Test - حالة التنقل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">User Status - حالة المستخدم</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Admin: {isAdmin ? 'Yes' : 'No'}</span>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>User: {user.firstName} {user.secondName}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Routes - المسارات المتاحة</h3>
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isAccessible = item.public || (isAuthenticated && (!item.adminOnly || isAdmin));
                    
                    return (
                      <div key={item.name} className="flex items-center gap-2">
                        {isAccessible ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Icon className="h-4 w-4" />
                        <Link 
                          to={item.href}
                          className={`text-sm ${isAccessible ? 'text-blue-600 hover:underline' : 'text-gray-400'}`}
                        >
                          {item.name}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Links - روابط التنقل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isAccessible = item.public || (isAuthenticated && (!item.adminOnly || isAdmin));
                
                return (
                  <Link key={item.name} to={item.href}>
                    <Button 
                      variant={isAccessible ? "default" : "outline"}
                      className="w-full h-auto p-4 flex flex-col items-center gap-2"
                      disabled={!isAccessible}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
              
              {!isAuthenticated && authItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} to={item.href}>
                    <Button 
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center gap-2"
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NavigationTest;
