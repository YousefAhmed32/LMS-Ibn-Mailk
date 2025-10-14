import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getParentDashboardData, 
  selectParentDashboardData, 
  selectExamResultLoading,
  selectExamResultError
} from '../../store/slices/examResultSlice';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Award, 
  BookOpen, 
  Calendar,
  BarChart3,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ExamResultsDashboard = ({ studentId }) => {
  const dispatch = useDispatch();
  const dashboardData = useSelector(selectParentDashboardData);
  const loading = useSelector(selectExamResultLoading);
  const error = useSelector(selectExamResultError);

  useEffect(() => {
    if (studentId) {
      dispatch(getParentDashboardData(studentId));
    }
  }, [dispatch, studentId]);

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-50 border-green-200',
      'A': 'text-green-500 bg-green-50 border-green-200',
      'B+': 'text-blue-600 bg-blue-50 border-blue-200',
      'B': 'text-blue-500 bg-blue-50 border-blue-200',
      'C+': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'C': 'text-yellow-500 bg-yellow-50 border-yellow-200',
      'D+': 'text-orange-600 bg-orange-50 border-orange-200',
      'D': 'text-orange-500 bg-orange-50 border-orange-200',
      'F': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[grade] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getLevelColor = (level) => {
    const colors = {
      'Excellent': 'text-green-600',
      'Very Good': 'text-blue-600',
      'Good': 'text-blue-500',
      'Average': 'text-yellow-600',
      'Below Average': 'text-orange-600',
      'Poor': 'text-red-600'
    };
    return colors[level] || 'text-gray-600';
  };

  const getPerformanceIcon = (percentage) => {
    if (percentage >= 90) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (percentage >= 80) return <Award className="w-6 h-6 text-blue-500" />;
    if (percentage >= 70) return <Target className="w-6 h-6 text-green-500" />;
    if (percentage >= 60) return <TrendingUp className="w-6 h-6 text-yellow-500" />;
    return <AlertCircle className="w-6 h-6 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في تحميل البيانات</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const { student, performance, resultsByCourse, recentResults } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Student Info Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              نتائج الامتحانات - {student.name}
            </h2>
            <p className="text-gray-600">الصف: {student.grade}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {performance.averagePercentage}%
            </div>
            <p className="text-sm text-gray-600">متوسط الأداء</p>
          </div>
        </div>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Exams */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الامتحانات</p>
              <p className="text-2xl font-bold text-gray-900">{performance.totalExams}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Average Grade */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط التقدير</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.averageGrade ? performance.averageGrade.toFixed(1) : 'N/A'}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Best Score */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">أفضل نتيجة</p>
              <p className="text-2xl font-bold text-gray-900">{performance.bestScore}%</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        {/* Performance Level */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مستوى الأداء</p>
              <p className="text-lg font-bold text-gray-900">
                {performance.averagePercentage >= 90 ? 'ممتاز' :
                 performance.averagePercentage >= 80 ? 'جيد جداً' :
                 performance.averagePercentage >= 70 ? 'جيد' :
                 performance.averagePercentage >= 60 ? 'مقبول' : 'يحتاج تحسين'}
              </p>
            </div>
            {getPerformanceIcon(performance.averagePercentage)}
          </div>
        </div>
      </motion.div>

      {/* Results by Course */}
      {resultsByCourse && resultsByCourse.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-bold text-gray-900">النتائج حسب المادة</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resultsByCourse.map((courseData, index) => (
              <motion.div
                key={courseData.course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {courseData.course.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {courseData.course.subject} - الصف {courseData.course.grade}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {courseData.averagePercentage}%
                    </div>
                    <p className="text-sm text-gray-600">متوسط المادة</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {courseData.results.map((result, resultIndex) => (
                    <div
                      key={result._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getGradeColor(result.grade)}`}>
                          <span className="text-sm font-bold">{result.grade}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{result.examTitle}</p>
                          <p className="text-sm text-gray-600">
                            {result.formattedScore} ({result.percentage}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getLevelColor(result.level)}`}>
                          {result.level}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.submittedAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Results */}
      {recentResults && recentResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">النتائج الأخيرة</h3>
          
          <div className="space-y-4">
            {recentResults.slice(0, 5).map((result, index) => (
              <motion.div
                key={result._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getGradeColor(result.grade)}`}>
                    <span className="text-sm font-bold">{result.grade}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{result.examTitle}</p>
                    <p className="text-sm text-gray-600">
                      {result.courseId.title} - {result.formattedScore}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {result.percentage}%
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(result.submittedAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No Results Message */}
      {(!resultsByCourse || resultsByCourse.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 rounded-xl"
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد نتائج امتحانات</h3>
          <p className="text-gray-500">
            لم يتم إدخال أي نتائج امتحانات بعد. ستظهر النتائج هنا بمجرد إدخالها.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ExamResultsDashboard;

