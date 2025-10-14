// Enhanced Parent Dashboard - Complete Implementation Example
// This shows the key components for the statistics dashboard with charts

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Cell, BarChart, Bar } from 'recharts';
import { Copy, Download, Plus, X, RefreshCw, FileText, Award, BookOpen, Calendar, TrendingUp } from 'lucide-react';

// Main Statistics Dashboard Component
const StatisticsDashboard = ({ student, stats, gradeProgression, subjectDistribution, coursePerformance, onCopyId, onExportReport }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Student Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Award size={32} className="text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {student.firstName} {student.secondName}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">معرف الطالب:</span>
                  <span className="font-mono text-gray-800 dark:text-white">{student.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">الصف:</span>
                  <span className="text-gray-800 dark:text-white">{student.grade}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">البريد:</span>
                  <span className="text-gray-800 dark:text-white">{student.userEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">المحافظة:</span>
                  <span className="text-gray-800 dark:text-white">{student.governorate}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCopyId(student.studentId)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title="نسخ معرف الطالب"
            >
              <Copy size={20} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExportReport}
              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
              title="تصدير التقرير"
            >
              <Download size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {stats.totalCourses}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">إجمالي الكورسات</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Award size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {stats.averageGrade}%
          </h3>
          <p className="text-gray-600 dark:text-gray-300">متوسط الدرجات</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            <Calendar size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {stats.attendanceRate}%
          </h3>
          <p className="text-gray-600 dark:text-gray-300">معدل الحضور</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
            {stats.completedCourses}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">كورسات مكتملة</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Grade Progression Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
            تطور الدرجات
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradeProgression}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="grade" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subject Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
            توزيع المواد الدراسية
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Course Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8"
      >
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
          أداء الكورسات
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">اسم الكورس</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">الحالة</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">التقدم</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">متوسط الدرجات</th>
                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">عدد الامتحانات</th>
              </tr>
            </thead>
            <tbody>
              {coursePerformance.map((course, index) => (
                <motion.tr
                  key={course.courseId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{course.courseName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {course.status === 'approved' ? 'مفعل' : 'في الانتظار'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{course.progress}%</span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{course.averageGrade}%</td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{course.examCount}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StatisticsDashboard;
