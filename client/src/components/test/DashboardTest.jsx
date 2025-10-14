import React from 'react';
import { motion } from 'framer-motion';
import StudentDashboard from '../dashboard/StudentDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  Palette,
  Zap,
  BarChart3
} from 'lucide-react';

const DashboardTest = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-luxury-navy-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Test Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Student Dashboard Test
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Interactive demonstration of the Student Dashboard component
              </p>
            </div>
            <Button
              onClick={toggleTheme}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Palette className="h-4 w-4" />
              <span>{isDarkMode ? 'Light' : 'Dark'} Mode</span>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white dark:bg-luxury-navy-800 border-gray-200 dark:border-luxury-navy-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 text-luxury-gold-500 ml-2" />
                  Real-time Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Animated progress bars, count-up effects, and dynamic updates
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-luxury-navy-800 border-gray-200 dark:border-luxury-navy-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Zap className="h-5 w-5 text-luxury-gold-500 ml-2" />
                  Smooth Animations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Framer Motion powered animations with staggered effects
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-luxury-navy-800 border-gray-200 dark:border-luxury-navy-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Monitor className="h-5 w-5 text-luxury-gold-500 ml-2" />
                  Responsive Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mobile-first design with adaptive layouts
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Dashboard Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StudentDashboard />
        </motion.div>

        {/* Test Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-white dark:bg-luxury-navy-800 rounded-2xl shadow-xl border border-gray-200 dark:border-luxury-navy-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Test Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Monitor className="h-4 w-4 text-luxury-gold-500" />
                <span className="text-gray-600 dark:text-gray-400">Desktop View</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Tablet className="h-4 w-4 text-luxury-gold-500" />
                <span className="text-gray-600 dark:text-gray-400">Tablet View</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="h-4 w-4 text-luxury-gold-500" />
                <span className="text-gray-600 dark:text-gray-400">Mobile View</span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Resize your browser window to test responsive behavior
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardTest;
