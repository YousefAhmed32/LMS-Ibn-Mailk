const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

/**
 * Enhanced Parent Routes - Real Database Data
 * Provides comprehensive student data for Parent Dashboard
 */

// Import the controller function
let getComprehensiveStudentData;
try {
  const controller = require('../controllers/enhanced-parent-controller');
  getComprehensiveStudentData = controller.getComprehensiveStudentData;
} catch (error) {
  console.error('Error importing enhanced parent controller:', error);
  getComprehensiveStudentData = (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Controller not available'
    });
  };
}

// Get comprehensive student data for parent dashboard
// GET /api/parent/:parentId/student/:studentId/comprehensive
router.get('/:parentId/student/:studentId/comprehensive', authenticateToken, getComprehensiveStudentData);

// Alternative route for current user's student
// GET /api/parent/student/:studentId/comprehensive
router.get('/student/:studentId/comprehensive', authenticateToken, (req, res) => {
  // Set parentId from authenticated user
  req.params.parentId = req.user.id;
  if (getComprehensiveStudentData) {
    getComprehensiveStudentData(req, res);
  } else {
    res.status(500).json({
      success: false,
      message: 'Controller not available'
    });
  }
});

// Get comprehensive data for all linked students
// GET /api/parent/:parentId/students/comprehensive
router.get('/:parentId/students/comprehensive', authenticateToken, async (req, res) => {
  try {
    const parentId = req.params.parentId || req.user.id;
    
    // Get parent with linked students
    const User = require('../models/User');
    const parent = await User.findById(parentId).populate('linkedStudents');
    
    if (!parent || !parent.linkedStudents || parent.linkedStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد طلاب مرتبطين'
      });
    }

    // Get comprehensive data for each student
    const studentsData = [];
    for (const student of parent.linkedStudents) {
      try {
        req.params.studentId = student._id.toString();
        if (getComprehensiveStudentData) {
          const studentData = await getComprehensiveStudentData(req, res);
          if (studentData && studentData.success) {
            studentsData.push(studentData);
          }
        }
      } catch (error) {
        console.error(`Error fetching data for student ${student._id}:`, error);
        // Continue with other students
      }
    }

    res.json({
      success: true,
      students: studentsData,
      totalStudents: studentsData.length
    });

  } catch (error) {
    console.error('Error fetching comprehensive students data:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات الطلاب'
    });
  }
});

module.exports = router;
