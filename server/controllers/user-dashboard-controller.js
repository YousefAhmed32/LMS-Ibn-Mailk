const User = require('../models/User');
const Course = require('../models/Course');
const UserCourseProgress = require('../models/UserCourseProgress');
const VideoProgress = require('../models/VideoProgress');
const ExamResult = require('../models/ExamResult');

// Helper function to validate userId
const validateUserId = (userId) => {
  if (!userId || userId === 'undefined' || userId === 'null') {
    return {
      isValid: false,
      error: {
        status: 400,
        message: 'معرف المستخدم غير صحيح'
      }
    };
  }

  // Validate MongoDB ObjectId format
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: 'معرف المستخدم غير صالح'
      }
    };
  }

  return { isValid: true };
};

// Get user statistics for dashboard
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate userId parameter
    const validation = validateUserId(userId);
    if (!validation.isValid) {
      return res.status(validation.error.status).json({
        success: false,
        message: validation.error.message
      });
    }
    
    // Verify user exists and get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Get user's enrolled courses
    const enrolledCourses = await UserCourseProgress.find({ userId }).populate('courseId');
    
    // Calculate total courses
    const totalCourses = enrolledCourses.length;
    
    // Calculate completed courses (progress >= 100%)
    const completedCourses = enrolledCourses.filter(course => course.progress >= 100).length;
    
    // Calculate completion percentage
    const completionPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
    
    // Calculate total watch time from video progress
    const videoProgress = await VideoProgress.find({ userId });
    const totalWatchTime = videoProgress.reduce((total, progress) => total + (progress.watchTime || 0), 0);
    
    // Calculate average score from exam results
    const examResults = await ExamResult.find({ userId });
    const averageScore = examResults.length > 0 
      ? Math.round(examResults.reduce((sum, result) => sum + result.score, 0) / examResults.length)
      : 0;

    const stats = {
      totalCourses,
      totalWatchTime, // in minutes
      averageScore,
      completionPercentage
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// Get user's recent courses
const getRecentCourses = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate userId parameter
    const validation = validateUserId(userId);
    if (!validation.isValid) {
      return res.status(validation.error.status).json({
        success: false,
        message: validation.error.message
      });
    }
    
    // Get user's enrolled courses with progress, sorted by last accessed
    const enrolledCourses = await UserCourseProgress.find({ userId })
      .populate('courseId')
      .sort({ lastAccessed: -1 })
      .limit(5);

    const recentCourses = enrolledCourses.map(course => ({
      id: course.courseId._id,
      title: course.courseId.title,
      progress: Math.round(course.progress),
      lastAccessed: course.lastAccessed ? 
        new Date(course.lastAccessed).toLocaleDateString('ar-SA') : 
        'لم يتم الوصول بعد',
      duration: course.courseId.duration || 0,
      thumbnail: course.courseId.thumbnail || null
    }));

    res.json({
      success: true,
      data: recentCourses
    });

  } catch (error) {
    console.error('Error fetching recent courses:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// Get user's progress over time (for charts)
const getUserProgressOverTime = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate userId parameter
    const validation = validateUserId(userId);
    if (!validation.isValid) {
      return res.status(validation.error.status).json({
        success: false,
        message: validation.error.message
      });
    }
    
    // Get progress data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const progressData = await UserCourseProgress.find({
      userId,
      lastAccessed: { $gte: sixMonthsAgo }
    }).sort({ lastAccessed: 1 });

    // Group by month and calculate average progress
    const monthlyProgress = {};
    progressData.forEach(progress => {
      const month = new Date(progress.lastAccessed).toLocaleDateString('ar-SA', { 
        month: 'long',
        year: 'numeric'
      });
      if (!monthlyProgress[month]) {
        monthlyProgress[month] = [];
      }
      monthlyProgress[month].push(progress.progress);
    });

    const chartData = Object.keys(monthlyProgress).map(month => ({
      month,
      progress: Math.round(
        monthlyProgress[month].reduce((sum, p) => sum + p, 0) / monthlyProgress[month].length
      )
    }));

    res.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('Error fetching progress over time:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

// Get user's score distribution (for pie chart)
const getUserScoreDistribution = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate userId parameter
    const validation = validateUserId(userId);
    if (!validation.isValid) {
      return res.status(validation.error.status).json({
        success: false,
        message: validation.error.message
      });
    }
    
    const examResults = await ExamResult.find({ userId });
    
    // Categorize scores
    const distribution = {
      excellent: 0, // 90-100
      veryGood: 0,  // 80-89
      good: 0,      // 70-79
      acceptable: 0 // 60-69
    };

    examResults.forEach(result => {
      if (result.score >= 90) distribution.excellent++;
      else if (result.score >= 80) distribution.veryGood++;
      else if (result.score >= 70) distribution.good++;
      else if (result.score >= 60) distribution.acceptable++;
    });

    const chartData = [
      { name: 'ممتاز (90-100)', value: distribution.excellent, color: '#10B981' },
      { name: 'جيد جداً (80-89)', value: distribution.veryGood, color: '#3B82F6' },
      { name: 'جيد (70-79)', value: distribution.good, color: '#F59E0B' },
      { name: 'مقبول (60-69)', value: distribution.acceptable, color: '#EF4444' }
    ];

    res.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('Error fetching score distribution:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم'
    });
  }
};

module.exports = {
  getUserStats,
  getRecentCourses,
  getUserProgressOverTime,
  getUserScoreDistribution
};
