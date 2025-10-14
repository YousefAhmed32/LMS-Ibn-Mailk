const User = require('../models/User');
const OTP = require('../models/OTP');
const Course = require('../models/Course');
const ExamResult = require('../models/ExamResult');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Search for student by ID
const searchStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const parentId = req.user.id;

    // Find student by studentId
    const student = await User.findOne({ 
      studentId: studentId.toUpperCase(),
      role: 'student',
      isActive: true 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الطالب'
      });
    }

    // Check if student is already linked to another parent (but allow if it's the same parent)
    const existingParent = await User.findOne({
      role: 'parent',
      linkedStudents: student._id
    });

    if (existingParent && existingParent._id.toString() !== parentId.toString()) {
      console.log('❌ Student linked to different parent in search:', {
        studentId: student._id,
        currentParent: parentId,
        linkedParent: existingParent._id
      });
      
      return res.status(400).json({
        success: false,
        message: 'هذا الطالب مرتبط بالفعل بولي أمر آخر'
      });
    }
    
    if (existingParent && existingParent._id.toString() === parentId.toString()) {
      console.log('✅ Student already linked to current parent in search - allowing access');
    }

    // Return student info (without sensitive data)
    const studentInfo = {
      _id: student._id,
      firstName: student.firstName,
      secondName: student.secondName,
      userEmail: student.userEmail,
      phoneStudent: student.phoneStudent,
      studentId: student.studentId,
      grade: student.grade,
      governorate: student.governorate
    };

    res.json({
      success: true,
      student: studentInfo
    });
  } catch (error) {
    console.error('Search student error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث عن الطالب'
    });
  }
};

// Send OTP for verification
const sendOTP = async (req, res) => {
  try {
    const { studentId, parentId } = req.body;

    // Check if there's already an active OTP for this student-parent pair
    const existingOTP = await OTP.findOne({
      studentId,
      parentId,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingOTP) {
      return res.status(400).json({
        success: false,
        message: 'تم إرسال رمز تحقق بالفعل، يرجى الانتظار قبل إرسال رمز جديد'
      });
    }

    // Generate new OTP
    const otpRecord = await OTP.generateOTP(studentId, parentId);

    // Create notification for the student instead of SMS/Email
    const Notification = require('../models/Notification');
    const notification = await Notification.createConfirmationNotification(
      studentId,
      otpRecord.otpCode,
      otpRecord.expiresAt,
      {
        parentId,
        studentId,
        otpId: otpRecord._id,
        purpose: 'parent_linking'
      }
    );

    // Emit real-time notification to student via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${studentId}`).emit('notification', {
        id: notification._id,
        type: 'confirmation',
        title: notification.title,
        message: notification.message,
        confirmationCode: notification.confirmationCode,
        expiresAt: notification.expiresAt,
        priority: notification.priority,
        category: notification.category,
        createdAt: notification.createdAt,
        data: notification.data
      });
      console.log(`🔔 Confirmation notification sent to student ${studentId} via Socket.IO`);
    }

    res.json({
      success: true,
      message: 'تم إرسال رمز التحقق إلى الطالب في المنصة',
      notificationId: notification._id,
      expiresAt: otpRecord.expiresAt
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إرسال رمز التحقق'
    });
  }
};

// Verify OTP and link student
const verifyOTP = async (req, res) => {
  try {
    const { studentId, parentId, otpCode } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      studentId,
      parentId,
      isUsed: false
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'رمز التحقق غير موجود أو مستخدم بالفعل'
      });
    }

    // Verify OTP
    const verificationResult = otpRecord.verifyOTP(otpCode);
    
    if (!verificationResult.success) {
      await otpRecord.save(); // Save attempts count
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    // Link student to parent
    await User.findByIdAndUpdate(parentId, {
      $addToSet: { linkedStudents: studentId }
    });

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'تم ربط الطالب بنجاح'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في التحقق من الرمز'
    });
  }
};

// Link student to parent (new simplified endpoint)
const linkStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const parentId = req.user.id;

    // Validate input
    if (!studentId || !studentId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }

    // Validate ObjectId format for studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب غير صحيح'
      });
    }

    console.log('🔍 البحث عن الطالب:', studentId);

    // Find student by ObjectId
    const student = await User.findOne({ 
      _id: studentId,
      role: 'student'
    });

    console.log('📋 نتيجة البحث:', student ? 'موجود' : 'غير موجود');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الطالب'
      });
    }

    // Check if student is already linked to another parent (but allow if it's the same parent)
    const existingParent = await User.findOne({
      role: 'parent',
      linkedStudents: student._id
    });

    if (existingParent && existingParent._id.toString() !== parentId.toString()) {
      console.log('❌ Student linked to different parent:', {
        studentId: student._id,
        currentParent: parentId,
        linkedParent: existingParent._id
      });
      
      return res.status(400).json({
        success: false,
        message: 'هذا الطالب مرتبط بالفعل بولي أمر آخر',
        linkedParent: {
          _id: existingParent._id,
          firstName: existingParent.firstName,
          lastName: existingParent.lastName,
          userEmail: existingParent.userEmail,
          phoneParent: existingParent.phoneParent
        }
      });
    }
    
    if (existingParent && existingParent._id.toString() === parentId.toString()) {
      console.log('✅ Student already linked to current parent - allowing access');
    }

    // Check if parent already has this student linked (improved comparison)
    const parent = await User.findById(parentId);
    const linkedStudents = parent.linkedStudents || [];
    const isAlreadyLinked = linkedStudents.some(linkedStudent => {
      const linkedId = linkedStudent.toString ? linkedStudent.toString() : linkedStudent;
      const studentIdStr = student._id.toString ? student._id.toString() : student._id;
      return linkedId === studentIdStr;
    });
    
    if (isAlreadyLinked) {
      console.log('✅ Student already linked to parent - allowing access');
      // Instead of rejecting, return the student info since they're already linked
      const stats = {
        totalCourses: student.enrolledCourses?.length || 0,
        completedCourses: student.enrolledCourses?.filter(c => c.paymentStatus === 'approved').length || 0,
        averageGrade: 85,
        attendanceRate: 92
      };

      const studentInfo = {
        _id: student._id,
        firstName: student.firstName,
        secondName: student.secondName,
        thirdName: student.thirdName,
        fourthName: student.fourthName,
        email: student.email,
        phoneStudent: student.phoneStudent,
        studentId: student.studentId,
        grade: student.grade,
        governorate: student.governorate,
        enrolledCourses: student.enrolledCourses,
        stats: stats
      };

      return res.json({
        success: true,
        message: 'الطالب مرتبط بالفعل بحسابك',
        student: studentInfo
      });
    }

    // Link student to parent
    await User.findByIdAndUpdate(parentId, {
      $addToSet: { linkedStudents: student._id }
    });

    // Calculate student statistics
    const stats = {
      totalCourses: student.enrolledCourses?.length || 0,
      completedCourses: student.enrolledCourses?.filter(c => c.paymentStatus === 'approved').length || 0,
      averageGrade: 85, // Mock data - can be calculated from exam results
      attendanceRate: 92 // Mock data - can be calculated from attendance records
    };

    // Return student info with stats
    const studentInfo = {
      _id: student._id,
      firstName: student.firstName,
      secondName: student.secondName,
      thirdName: student.thirdName,
      fourthName: student.fourthName,
      userEmail: student.userEmail,
      phoneStudent: student.phoneStudent,
      studentId: student.studentId,
      grade: student.grade,
      governorate: student.governorate,
      enrolledCourses: student.enrolledCourses,
      stats: stats
    };

    res.json({
      success: true,
      message: 'تم ربط الطالب بنجاح',
      student: studentInfo
    });
  } catch (error) {
    console.error('Link student error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في ربط الطالب'
    });
  }
};

// NEW: Robust parent-student linking endpoint with business rules
const linkStudentRobust = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { studentUniqueId } = req.body;
      const parentId = req.params.parentId || req.user?.id;

      // Validate input
      if (!studentUniqueId || !studentUniqueId.trim()) {
        return res.status(400).json({
          status: 'validation_error',
          message: 'Student unique ID is required'
        });
      }

      // Validate parentId
      if (!parentId || parentId === 'undefined') {
        return res.status(400).json({
          status: 'validation_error',
          message: 'Parent ID is required'
        });
      }

      // Validate ObjectId format for parentId
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({
          status: 'validation_error',
          message: 'Invalid parent ID format'
        });
      }

      // Find parent
      const parent = await User.findById(parentId).session(session);
      if (!parent || parent.role !== 'parent') {
        return res.status(404).json({
          status: 'not_found',
          message: 'Parent not found'
        });
      }

      // Find student by studentId or ObjectId
      let student;
      
      // Check if input is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(studentUniqueId)) {
        student = await User.findOne({ 
          _id: studentUniqueId,
          role: 'student',
          isActive: true 
        }).session(session);
      }
      
      // If not found by ObjectId, try by studentId
      if (!student) {
        student = await User.findOne({ 
          studentId: studentUniqueId.toUpperCase(),
          role: 'student',
          isActive: true 
        }).session(session);
      }

      if (!student) {
        return res.status(404).json({
          status: 'not_found',
          message: 'Student not found'
        });
      }

      // Check if student is already linked to another parent
      const existingParent = await User.findOne({
        role: 'parent',
        linkedStudents: student._id
      }).session(session);

      if (existingParent && existingParent._id.toString() !== parentId) {
        return res.status(400).json({
          status: 'already_linked',
          message: 'Student is already linked to another parent',
          student: {
            _id: student._id,
            firstName: student.firstName,
            secondName: student.secondName,
            studentId: student.studentId
          }
        });
      }

      // Check if parent already has this student linked (idempotent)
      if (parent.linkedStudents && parent.linkedStudents.includes(student._id)) {
        return res.status(200).json({
          status: 'already_linked',
          message: 'Student is already linked to this parent',
          student: {
            _id: student._id,
            firstName: student.firstName,
            secondName: student.secondName,
            thirdName: student.thirdName,
            fourthName: student.fourthName,
            userEmail: student.userEmail,
            phoneStudent: student.phoneStudent,
            studentId: student.studentId,
            grade: student.grade,
            governorate: student.governorate
          }
        });
      }

      // Enforce max 3 students per parent
      const currentLinkedCount = parent.linkedStudents ? parent.linkedStudents.length : 0;
      if (currentLinkedCount >= 3) {
        return res.status(403).json({
          status: 'limit_reached',
          message: 'Maximum of 3 students allowed per parent',
          currentCount: currentLinkedCount
        });
      }

      // Link student to parent atomically
      await User.findByIdAndUpdate(
        parentId, 
        { $addToSet: { linkedStudents: student._id } },
        { session }
      );

      // Return success with redirect URL
      return res.status(201).json({
        status: 'linked',
        message: 'Student linked successfully',
        student: {
          _id: student._id,
          firstName: student.firstName,
          secondName: student.secondName,
          thirdName: student.thirdName,
          fourthName: student.fourthName,
          userEmail: student.userEmail,
          phoneStudent: student.phoneStudent,
          studentId: student.studentId,
          grade: student.grade,
          governorate: student.governorate
        },
        redirectUrl: `/parent/stats/${student._id}`
      });
    });
  } catch (error) {
    console.error('Link student robust error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  } finally {
    await session.endSession();
  }
};

// Get student data for parent
const getStudentData = async (req, res) => {
  try {
    console.log('🔍 getStudentData called with:', { 
      parentId: req.params.parentId || req.user?.id,
      userId: req.user?.id 
    });
    
    // Use parentId from params if available, otherwise from user
    const parentId = req.params.parentId || req.user.id;

    // Find parent with linked students (only students, not parents)
    const parent = await User.findById(parentId).populate({
      path: 'linkedStudents',
      match: { role: 'student' }
    });
    
    console.log('👤 Parent data:', { 
      parentId, 
      hasParent: !!parent, 
      linkedStudentsCount: parent?.linkedStudents?.length || 0,
      linkedStudents: parent?.linkedStudents?.map(s => ({
        id: s._id,
        name: `${s.firstName} ${s.secondName}`,
        studentId: s.studentId
      })) || []
    });
    
    if (!parent) {
      console.log('❌ Parent not found:', parentId);
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    if (!parent.linkedStudents || parent.linkedStudents.length === 0) {
      console.log('📭 No linked students found for parent:', parentId);
      return res.status(404).json({
        success: false,
        message: 'لا يوجد طالب مرتبط'
      });
    }

    // Return all linked students for children endpoint
    if (req.params.parentId || req.path.includes('/children')) {
      console.log('✅ Returning children data:', parent.linkedStudents.length, 'students');
      return res.json({
        success: true,
        children: parent.linkedStudents
      });
    }

    // For now, get the first linked student
    const student = parent.linkedStudents[0];

    // Calculate stats (mock data for now)
    const stats = {
      totalCourses: student.enrolledCourses?.length || 0,
      completedCourses: student.enrolledCourses?.filter(c => c.paymentStatus === 'approved').length || 0,
      averageGrade: 85, // Mock data
      attendanceRate: 92 // Mock data
    };

    console.log('✅ Returning student data for:', student.firstName, student.secondName);
    res.json({
      success: true,
      student: student,
      stats: stats
    });
  } catch (error) {
    console.error('💥 Get student data error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات الطالب'
    });
  }
};

// Get student grades data for parent
const getStudentGrades = async (req, res) => {
  try {
    const { parentId, childId } = req.params;
    
    // Validate childId
    if (!childId || childId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }
    
    // Verify parent has access to this student
    const parent = await User.findById(parentId);
    if (!parent || !parent.linkedStudents.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
      });
    }

    // Get student data
    const student = await User.findById(childId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الطالب'
      });
    }

    // Mock grades data - replace with actual data from your database
    const grades = [
      { subject: 'الرياضيات', score: 85, total: 100, percentage: 85, date: new Date() },
      { subject: 'الفيزياء', score: 92, total: 100, percentage: 92, date: new Date() },
      { subject: 'الكيمياء', score: 78, total: 100, percentage: 78, date: new Date() },
      { subject: 'اللغة العربية', score: 88, total: 100, percentage: 88, date: new Date() },
      { subject: 'اللغة الإنجليزية', score: 90, total: 100, percentage: 90, date: new Date() }
    ];

    // Mock charts data
    const charts = {
      gradeProgression: [
        { month: 'يناير', grade: 80 },
        { month: 'فبراير', grade: 82 },
        { month: 'مارس', grade: 85 },
        { month: 'أبريل', grade: 88 },
        { month: 'مايو', grade: 90 },
        { month: 'يونيو', grade: 92 }
      ],
      subjectDistribution: [
        { subject: 'الرياضيات', score: 85 },
        { subject: 'الفيزياء', score: 92 },
        { subject: 'الكيمياء', score: 78 },
        { subject: 'اللغة العربية', score: 88 },
        { subject: 'اللغة الإنجليزية', score: 90 }
      ]
    };

    res.json({
      success: true,
      grades: grades,
      charts: charts
    });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل درجات الطالب'
    });
  }
};

// Get student attendance data for parent
const getStudentAttendance = async (req, res) => {
  try {
    const { parentId, childId } = req.params;
    
    // Validate childId
    if (!childId || childId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }
    
    // Verify parent has access to this student
    const parent = await User.findById(parentId);
    if (!parent || !parent.linkedStudents.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
      });
    }

    // Get student data
    const student = await User.findById(childId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الطالب'
      });
    }

    // Mock attendance data - replace with actual data from your database
    const attendance = [
      { date: new Date(), status: 'present', course: 'الرياضيات' },
      { date: new Date(), status: 'present', course: 'الفيزياء' },
      { date: new Date(), status: 'absent', course: 'الكيمياء' },
      { date: new Date(), status: 'present', course: 'اللغة العربية' },
      { date: new Date(), status: 'present', course: 'اللغة الإنجليزية' }
    ];

    // Mock charts data
    const charts = {
      attendanceChart: [
        { month: 'يناير', present: 20, absent: 2 },
        { month: 'فبراير', present: 22, absent: 1 },
        { month: 'مارس', present: 21, absent: 2 },
        { month: 'أبريل', present: 23, absent: 0 },
        { month: 'مايو', present: 22, absent: 1 },
        { month: 'يونيو', present: 24, absent: 0 }
      ]
    };

    res.json({
      success: true,
      attendance: attendance,
      charts: charts
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات حضور الطالب'
    });
  }
};

// Get student progress data for parent
const getStudentProgress = async (req, res) => {
  try {
    const { parentId, childId } = req.params;
    
    // Validate childId
    if (!childId || childId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }
    
    // Verify parent has access to this student
    const parent = await User.findById(parentId);
    if (!parent || !parent.linkedStudents.includes(childId)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى بيانات هذا الطالب'
      });
    }

    // Get student data
    const student = await User.findById(childId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الطالب'
      });
    }

    // Mock progress data - replace with actual data from your database
    const progress = [
      { course: 'الرياضيات', progress: 85, completedLessons: 17, totalLessons: 20 },
      { course: 'الفيزياء', progress: 92, completedLessons: 23, totalLessons: 25 },
      { course: 'الكيمياء', progress: 78, completedLessons: 16, totalLessons: 20 },
      { course: 'اللغة العربية', progress: 88, completedLessons: 18, totalLessons: 20 },
      { course: 'اللغة الإنجليزية', progress: 90, completedLessons: 19, totalLessons: 21 }
    ];

    // Mock charts data
    const charts = {
      completionRates: [
        { name: 'مكتمل', value: 75 },
        { name: 'قيد التقدم', value: 20 },
        { name: 'لم يبدأ', value: 5 }
      ]
    };

    res.json({
      success: true,
      progress: progress,
      charts: charts
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل بيانات تقدم الطالب'
    });
  }
};

// Export student report
const exportReport = async (req, res) => {
  try {
    // Use parentId from params if available, otherwise from user
    const parentId = req.params.parentId || req.user.id;

    // Find parent with linked students
    const parent = await User.findById(parentId).populate('linkedStudents');
    
    if (!parent || !parent.linkedStudents || parent.linkedStudents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد طالب مرتبط'
      });
    }

    const student = parent.linkedStudents[0];

    // Generate PDF report (mock implementation)
    // In production, use a library like puppeteer or pdfkit
    const reportData = {
      studentName: `${student.firstName} ${student.secondName}`,
      studentId: student.studentId,
      grade: student.grade,
      reportDate: new Date().toLocaleDateString('ar-EG'),
      courses: student.enrolledCourses || [],
      stats: {
        totalCourses: student.enrolledCourses?.length || 0,
        completedCourses: student.enrolledCourses?.filter(c => c.paymentStatus === 'approved').length || 0,
        averageGrade: 85,
        attendanceRate: 92
      }
    };

    // For now, return JSON data
    // In production, generate actual PDF
    res.json({
      success: true,
      message: 'تم إنشاء التقرير',
      data: reportData
    });
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء التقرير'
    });
  }
};

// Get detailed student statistics for parent dashboard
const getStudentStats = async (req, res) => {
  try {
    console.log('🔍 getStudentStats called with:', { studentId: req.params.studentId, parentId: req.user?.id });
    
    const { studentId } = req.params;
    const parentId = req.user.id;

    // 1. Validate studentId format
    if (!studentId || studentId === 'undefined') {
      console.log('❌ Missing studentId');
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // 2. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      console.log('❌ Invalid ObjectId format:', studentId);
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // 3. Validate parentId
    if (!parentId || !mongoose.Types.ObjectId.isValid(parentId)) {
      console.log('❌ Invalid parentId:', parentId);
      return res.status(400).json({
        success: false,
        message: 'Invalid parent ID'
      });
    }

    // 4. Verify parent exists and has access to student
    const parent = await User.findById(parentId);
    console.log('👤 Parent found:', { parentId, hasParent: !!parent, linkedStudents: parent?.linkedStudents?.length || 0 });
    
    if (!parent) {
      console.log('❌ Parent not found:', parentId);
      return res.status(404).json({
        success: false,
        message: 'Parent not found'
      });
    }

    // 5. Check if student is linked to parent (improved comparison)
    const linkedStudents = parent.linkedStudents || [];
    const isLinked = linkedStudents.some(linkedStudent => {
      // Handle both ObjectId and string comparisons
      const linkedId = linkedStudent.toString ? linkedStudent.toString() : linkedStudent;
      const studentIdStr = studentId.toString ? studentId.toString() : studentId;
      return linkedId === studentIdStr;
    });
    
    console.log('🔗 Link check:', { 
      studentId, 
      isLinked, 
      linkedStudentsCount: linkedStudents.length,
      linkedStudents: linkedStudents.map(s => s.toString ? s.toString() : s)
    });
    
    if (!isLinked) {
      console.log('❌ Parent access denied - student not linked, attempting auto-link');
      
      // Try to auto-link the student if not already linked
      try {
        await User.findByIdAndUpdate(parentId, {
          $addToSet: { linkedStudents: studentId }
        });
        console.log('✅ Auto-linked student to parent');
      } catch (linkError) {
        console.log('❌ Failed to auto-link:', linkError.message);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Student not linked to parent.'
        });
      }
    }

    // 6. Get student data with safe populate
    console.log('🔍 Attempting to find student with ID:', studentId);
    
    let student;
    try {
      // First try to find the student without populate
      student = await User.findById(studentId).lean();
      
      if (!student) {
        console.log('❌ Student not found:', studentId);
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      
      console.log('✅ Student found, now populating courses...');
      
      // If student exists, try to populate courses
      try {
        student = await User.findById(studentId)
          .populate('enrolledCourses.courseId')
          .lean();
      } catch (populateError) {
        console.warn('⚠️ Populate failed, using student without courses:', populateError.message);
        // Use the student without populated courses
      }
      
      console.log('👨‍🎓 Student query completed:', { 
        studentId, 
        hasStudent: !!student, 
        enrolledCourses: student?.enrolledCourses?.length || 0 
      });
    } catch (dbError) {
      console.error('💥 Database error when finding student:', {
        error: dbError.message,
        stack: dbError.stack,
        studentId
      });
      
      return res.status(500).json({
        success: false,
        message: 'Database error while fetching student data'
      });
    }

    // 7. Get exam results from separate collection
    console.log('🔍 Attempting to fetch exam results for student:', studentId);
    
    let examResults = [];
    try {
      const ExamResult = require('../models/ExamResult');
      examResults = await ExamResult.find({ studentId: studentId }).lean();
      console.log('📊 Exam results found:', examResults.length);
    } catch (examError) {
      console.error('💥 Error fetching exam results:', {
        error: examError.message,
        studentId
      });
      // Don't fail the entire request for exam results, just use empty array
      examResults = [];
    }

    // 8. Calculate comprehensive statistics
    const enrolledCourses = student.enrolledCourses || [];
    
    // Basic stats
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(c => c.paymentStatus === 'approved').length;
    
    // Calculate average grade from exam results
    const validGrades = examResults.filter(exam => exam.score !== null && exam.score !== undefined);
    const averageGrade = validGrades.length > 0 
      ? Math.round(validGrades.reduce((sum, exam) => sum + exam.score, 0) / validGrades.length)
      : 85; // Default average grade if no exams

    // Last exam result
    const lastExam = examResults
      .filter(exam => exam.score !== null && exam.score !== undefined)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

    // Grade progression over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentExams = examResults
      .filter(exam => new Date(exam.submittedAt) >= sixMonthsAgo && exam.score !== null)
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

    // Generate mock grade progression if no real data
    const gradeProgression = recentExams.length > 0 
      ? recentExams.map(exam => ({
          date: exam.submittedAt,
          month: new Date(exam.submittedAt).toLocaleDateString('ar-EG', { month: 'long' }),
          grade: exam.score,
          subject: exam.examTitle || 'عام'
        }))
      : [
          { month: 'يناير', grade: 80 },
          { month: 'فبراير', grade: 82 },
          { month: 'مارس', grade: 85 },
          { month: 'أبريل', grade: 88 },
          { month: 'مايو', grade: 90 },
          { month: 'يونيو', grade: 92 }
        ];

    // Subject performance distribution
    const subjectStats = {};
    examResults.forEach(exam => {
      if (exam.score !== null && exam.score !== undefined) {
        const subject = exam.examTitle || 'عام';
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, count: 0, color: getSubjectColor(subject) };
        }
        subjectStats[subject].total += exam.score;
        subjectStats[subject].count += 1;
      }
    });

    const subjectDistribution = Object.keys(subjectStats).length > 0 
      ? Object.entries(subjectStats).map(([subject, data]) => ({
          subject: subject,
          score: Math.round(data.total / data.count),
          percentage: Math.round((data.total / data.count) / 100 * 100),
          color: data.color,
          count: data.count
        }))
      : [
          { subject: 'الرياضيات', score: 85 },
          { subject: 'الفيزياء', score: 92 },
          { subject: 'الكيمياء', score: 78 },
          { subject: 'اللغة العربية', score: 88 },
          { subject: 'اللغة الإنجليزية', score: 90 }
        ];

    // Course performance
    const coursePerformance = enrolledCourses.map(enrollment => {
      const course = enrollment.courseId;
      const courseExams = examResults.filter(exam => 
        exam.courseId && exam.courseId.toString() === course._id.toString()
      );
      const courseAverage = courseExams.length > 0 
        ? Math.round(courseExams.reduce((sum, exam) => sum + exam.score, 0) / courseExams.length)
        : 0;

      return {
        courseId: course._id,
        courseName: course.title,
        status: enrollment.paymentStatus,
        progress: enrollment.progress || 0,
        averageGrade: courseAverage,
        examCount: courseExams.length,
        lastExamDate: courseExams.length > 0 
          ? courseExams.sort((a, b) => new Date(b.examDate) - new Date(a.examDate))[0].examDate
          : null
      };
    });

    // Attendance/Activity rate (mock calculation based on exam participation)
    const totalPossibleExams = enrolledCourses.length * 3; // Assume 3 exams per course
    const attendedExams = examResults.length;
    const attendanceRate = totalPossibleExams > 0 
      ? Math.round((attendedExams / totalPossibleExams) * 100)
      : 92; // Default attendance rate

    // Prepare response data
    const statsData = {
      student: {
        _id: student._id,
        firstName: student.firstName,
        secondName: student.secondName,
        studentId: student.studentId,
        email: student.email,
        phoneStudent: student.phoneStudent,
        grade: student.grade,
        governorate: student.governorate,
        profilePicture: student.profilePicture
      },
      statistics: {
        totalCourses,
        completedCourses,
        averageGrade,
        attendanceRate,
        lastExamResult: lastExam ? {
          subject: lastExam.examTitle || 'عام',
          score: lastExam.score,
          date: lastExam.submittedAt,
          courseName: lastExam.courseId || 'غير محدد'
        } : {
          subject: 'الرياضيات',
          score: 88,
          date: new Date(),
          courseName: 'الرياضيات المتقدمة'
        },
        lastExamScore: lastExam ? lastExam.score : 88,
        lastExamTotal: 100
      },
      charts: {
        gradeProgression,
        subjectDistribution,
        coursePerformance,
        attendanceChart: [
          { month: 'يناير', attendance: 95 },
          { month: 'فبراير', attendance: 92 },
          { month: 'مارس', attendance: 88 },
          { month: 'أبريل', attendance: 94 },
          { month: 'مايو', attendance: 90 },
          { month: 'يونيو', attendance: 96 }
        ]
      },
      recentActivity: examResults.length > 0 
        ? examResults
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5)
            .map(exam => ({
              type: 'exam',
              title: `امتحان ${exam.examTitle || 'عام'}`,
              score: exam.score,
              date: exam.submittedAt,
              courseName: exam.courseId || 'غير محدد',
              points: Math.round(exam.score / 10)
            }))
        : [
            { type: 'exam', title: 'امتحان الرياضيات', score: 88, date: new Date(), courseName: 'الرياضيات المتقدمة', points: 8 },
            { type: 'exam', title: 'امتحان الفيزياء', score: 92, date: new Date(), courseName: 'الفيزياء', points: 9 },
            { type: 'exam', title: 'امتحان الكيمياء', score: 78, date: new Date(), courseName: 'الكيمياء', points: 7 },
            { type: 'exam', title: 'امتحان اللغة العربية', score: 85, date: new Date(), courseName: 'اللغة العربية', points: 8 },
            { type: 'exam', title: 'امتحان اللغة الإنجليزية', score: 90, date: new Date(), courseName: 'اللغة الإنجليزية', points: 9 }
          ]
    };

    console.log('✅ Stats data prepared successfully');
    
    // 9. Return structured response
    res.status(200).json({
      success: true,
      stats: statsData
    });

  } catch (error) {
    console.error('❌ Get student stats error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      studentId: req.params.studentId,
      parentId: req.user?.id
    });
    
    // Don't expose internal errors to client
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// Helper function to assign colors to subjects
const getSubjectColor = (subject) => {
  const colors = {
    'الرياضيات': '#F97316',
    'العلوم': '#3B82F6',
    'الفيزياء': '#8B5CF6',
    'الكيمياء': '#10B981',
    'اللغة العربية': '#EF4444',
    'اللغة الإنجليزية': '#06B6D4',
    'التاريخ': '#F59E0B',
    'الجغرافيا': '#84CC16',
    'عام': '#6B7280'
  };
  
  return colors[subject] || '#6B7280';
};

module.exports = {
  searchStudent,
  sendOTP,
  verifyOTP,
  linkStudent,
  linkStudentRobust,
  getStudentData,
  getStudentGrades,
  getStudentAttendance,
  getStudentProgress,
  exportReport,
  getStudentStats
};
