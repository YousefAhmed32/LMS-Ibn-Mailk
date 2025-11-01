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
  try {
    const { studentUniqueId } = req.body;
    const parentId = req.params.parentId || req.user?.id;

    // Validate input
    if (!studentUniqueId || !studentUniqueId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب مطلوب'
      });
    }

    // Validate parentId
    if (!parentId || parentId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'معرف الوالد مطلوب'
      });
    }

    // Validate ObjectId format for parentId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الوالد غير صحيح'
      });
    }

    // Validate studentUniqueId format (either ObjectId or studentId string)
    const isValidObjectId = mongoose.Types.ObjectId.isValid(studentUniqueId);
    const isValidStudentId = typeof studentUniqueId === 'string' && studentUniqueId.trim().length > 0;
    
    if (!isValidObjectId && !isValidStudentId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطالب غير صحيح'
      });
    }

    // Find parent
    const parent = await User.findById(parentId);
    if (!parent || parent.role !== 'parent') {
      return res.status(404).json({
        success: false,
        message: 'الوالد غير موجود'
      });
    }

    // Find student by studentId or ObjectId
    let student;
    
    // Check if input is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(studentUniqueId)) {
      student = await User.findOne({ 
        _id: studentUniqueId,
        role: 'student',
        isActive: { $ne: false } // Handle both true and undefined
      });
    }
    
    // If not found by ObjectId, try by studentId
    if (!student) {
      student = await User.findOne({ 
        studentId: studentUniqueId.toUpperCase().trim(),
        role: 'student',
        isActive: { $ne: false }
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود. يرجى التحقق من معرف الطالب'
      });
    }

    // Check if student is already linked to another parent
    const existingParent = await User.findOne({
      role: 'parent',
      linkedStudents: student._id,
      _id: { $ne: parentId }
    });

    if (existingParent) {
      return res.status(400).json({
        success: false,
        message: 'الطالب مرتبط بالفعل بحساب والد آخر'
      });
    }

    // Check if parent already has this student linked (idempotent)
    const isAlreadyLinked = parent.linkedStudents && parent.linkedStudents.some(
      linkedId => linkedId.toString() === student._id.toString()
    );
    
    if (isAlreadyLinked) {
      // Return success data for already linked (idempotent operation)
      return res.status(200).json({
        success: true,
        message: 'الطالب مرتبط بالفعل بحسابك',
        student: {
          _id: student._id,
          firstName: student.firstName,
          secondName: student.secondName,
          thirdName: student.thirdName,
          fourthName: student.fourthName,
          email: student.email || student.userEmail,
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
        success: false,
        message: 'لا يمكن ربط أكثر من 3 طلاب بحساب واحد'
      });
    }

    // Link student to parent (atomic operation using $addToSet)
    await User.findByIdAndUpdate(
      parentId, 
      { $addToSet: { linkedStudents: student._id } }
    );

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'تم ربط الطالب بنجاح',
      student: {
        _id: student._id,
        firstName: student.firstName,
        secondName: student.secondName,
        thirdName: student.thirdName,
        fourthName: student.fourthName,
        email: student.email || student.userEmail,
        phoneStudent: student.phoneStudent,
        studentId: student.studentId,
        grade: student.grade,
        governorate: student.governorate
      }
    });

  } catch (error) {
    console.error('Link student robust error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'خطأ في التحقق من البيانات: ' + error.message
      });
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'الطالب مرتبط بالفعل'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء ربط الطالب. يرجى المحاولة مرة أخرى',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
      // Find student and populate enrolledCourses.course
      student = await User.findById(studentId)
        .populate('enrolledCourses.course', 'title subject grade price videos exams')
        .lean();
      
      if (!student) {
        console.log('❌ Student not found:', studentId);
        return res.status(404).json({
          success: false,
          message: 'الطالب غير موجود'
        });
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
        message: 'خطأ في قاعدة البيانات أثناء جلب بيانات الطالب'
      });
    }

    // 7. Get exam results from separate collection with course populated
    console.log('🔍 Attempting to fetch exam results for student:', studentId);
    
    let examResults = [];
    try {
      const ExamResult = require('../models/ExamResult');
      examResults = await ExamResult.find({ studentId: studentId })
        .populate('courseId', 'title subject grade')
        .sort({ submittedAt: -1 })
        .lean();
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
    // Handle enrolledCourses structure - it can be an array of objects with course field
    const enrolledCourses = (student.enrolledCourses || []).map(enrollment => {
      // Handle both nested course object and direct course reference
      const course = enrollment.course || enrollment.courseId || enrollment;
      return {
        ...enrollment,
        course: course,
        courseId: course?._id || course
      };
    }).filter(enrollment => enrollment.course); // Filter out any invalid enrollments
    
    // Basic stats
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(c => c.paymentStatus === 'approved').length;
    
    // Calculate average grade from exam results (use percentage if available, otherwise calculate from score/maxScore)
    const validGrades = examResults.filter(exam => {
      if (exam.percentage !== null && exam.percentage !== undefined) return true;
      if (exam.score !== null && exam.score !== undefined && exam.maxScore && exam.maxScore > 0) return true;
      return false;
    });
    
    const averageGrade = validGrades.length > 0 
      ? Math.round(validGrades.reduce((sum, exam) => {
          if (exam.percentage !== null && exam.percentage !== undefined) {
            return sum + exam.percentage;
          }
          return sum + Math.round((exam.score / exam.maxScore) * 100);
        }, 0) / validGrades.length)
      : 0; // Return 0 if no exams instead of default

    // Last exam result
    const lastExam = examResults
      .filter(exam => {
        if (exam.percentage !== null && exam.percentage !== undefined) return true;
        if (exam.score !== null && exam.score !== undefined) return true;
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || 0);
        const dateB = new Date(b.submittedAt || b.createdAt || 0);
        return dateB - dateA;
      })[0];

    // Grade progression over last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentExams = examResults
      .filter(exam => {
        const examDate = new Date(exam.submittedAt || exam.createdAt || 0);
        const hasScore = exam.percentage !== null && exam.percentage !== undefined || 
                        (exam.score !== null && exam.score !== undefined && exam.maxScore && exam.maxScore > 0);
        return examDate >= sixMonthsAgo && hasScore;
      })
      .sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || 0);
        const dateB = new Date(b.submittedAt || b.createdAt || 0);
        return dateA - dateB;
      });

    // Generate grade progression from real data
    const gradeProgression = recentExams.length > 0 
      ? recentExams.map(exam => {
          const examDate = new Date(exam.submittedAt || exam.createdAt || new Date());
          const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
          const month = monthNames[examDate.getMonth()];
          const grade = exam.percentage !== null && exam.percentage !== undefined 
            ? exam.percentage 
            : Math.round((exam.score / exam.maxScore) * 100);
          
          return {
            date: examDate.toISOString(),
            month: month,
            grade: grade,
            subject: exam.examTitle || exam.courseId?.title || 'عام'
          };
        })
      : []; // Return empty array if no data instead of mock data

    // Subject performance distribution - use course subjects
    const subjectStats = {};
    examResults.forEach(exam => {
      const hasScore = exam.percentage !== null && exam.percentage !== undefined || 
                      (exam.score !== null && exam.score !== undefined && exam.maxScore && exam.maxScore > 0);
      
      if (hasScore) {
        // Use course subject if available, otherwise use exam title
        const subject = exam.courseId?.subject || exam.courseId?.title || exam.examTitle || 'عام';
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, count: 0, color: getSubjectColor(subject) };
        }
        const score = exam.percentage !== null && exam.percentage !== undefined 
          ? exam.percentage 
          : Math.round((exam.score / exam.maxScore) * 100);
        subjectStats[subject].total += score;
        subjectStats[subject].count += 1;
      }
    });

    const subjectDistribution = Object.keys(subjectStats).length > 0 
      ? Object.entries(subjectStats).map(([subject, data]) => ({
          name: subject,
          value: Math.round(data.total / data.count),
          percentage: Math.round(data.total / data.count),
          color: data.color,
          count: data.count
        }))
      : []; // Return empty array if no data

    // Course performance - properly handle enrolledCourses structure
    const coursePerformance = enrolledCourses.map(enrollment => {
      // Handle both course object and course ID
      const course = enrollment.course || enrollment.courseId || enrollment;
      const courseId = course._id || course;
      
      const courseExams = examResults.filter(exam => {
        const examCourseId = exam.courseId?._id?.toString() || exam.courseId?.toString() || exam.courseId;
        return examCourseId && examCourseId.toString() === courseId.toString();
      });
      
      const courseAverage = courseExams.length > 0 
        ? Math.round(courseExams.reduce((sum, exam) => sum + (exam.percentage || exam.score || 0), 0) / courseExams.length)
        : 0;

      const lastExam = courseExams.length > 0
        ? courseExams.sort((a, b) => new Date(b.submittedAt || b.examDate || 0) - new Date(a.submittedAt || a.examDate || 0))[0]
        : null;

      return {
        courseId: courseId,
        courseName: course.title || course.courseName || 'غير محدد',
        status: enrollment.paymentStatus || 'approved',
        progress: enrollment.progress || 0,
        averageGrade: courseAverage,
        examCount: courseExams.length,
        lastExamDate: lastExam ? (lastExam.submittedAt || lastExam.examDate) : null
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
          subject: lastExam.examTitle || lastExam.courseId?.title || 'عام',
          score: lastExam.percentage || Math.round((lastExam.score / lastExam.maxScore) * 100),
          date: lastExam.submittedAt || lastExam.createdAt,
          courseName: lastExam.courseId?.title || lastExam.courseId || 'غير محدد'
        } : null,
        lastExamScore: lastExam ? (lastExam.percentage || Math.round((lastExam.score / lastExam.maxScore) * 100)) : null,
        lastExamTotal: lastExam ? 100 : null
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
            .sort((a, b) => {
              const dateA = new Date(a.submittedAt || a.createdAt || 0);
              const dateB = new Date(b.submittedAt || b.createdAt || 0);
              return dateB - dateA;
            })
            .slice(0, 5)
            .map(exam => {
              const score = exam.percentage !== null && exam.percentage !== undefined 
                ? exam.percentage 
                : (exam.score && exam.maxScore ? Math.round((exam.score / exam.maxScore) * 100) : 0);
              
              return {
                type: 'exam',
                title: `امتحان ${exam.examTitle || 'عام'}`,
                score: score,
                date: exam.submittedAt || exam.createdAt,
                courseName: exam.courseId?.title || exam.courseId || 'غير محدد',
                points: Math.round(score / 10)
              };
            })
        : [] // Return empty array if no data
    };

    console.log('✅ Stats data prepared successfully');
    
    // 9. Return structured response matching expected format
    res.status(200).json({
      success: true,
      data: statsData
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

// Get comprehensive student data for parent dashboard
const getComprehensiveStudentData = async (req, res) => {
  try {
    console.log('🔍 getComprehensiveStudentData called with:', { 
      studentId: req.params.studentId, 
      parentId: req.user?.id 
    });
    
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

    // 5. Check if student is linked to parent
    const linkedStudents = parent.linkedStudents || [];
    const isLinked = linkedStudents.some(linkedStudent => {
      const linkedId = linkedStudent.toString ? linkedStudent.toString() : linkedStudent;
      const studentIdStr = studentId.toString ? studentId.toString() : studentId;
      return linkedId === studentIdStr;
    });
    
    console.log('🔗 Link check:', { 
      studentId, 
      isLinked, 
      linkedStudentsCount: linkedStudents.length
    });
    
    if (!isLinked) {
      console.log('❌ Parent access denied - student not linked');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student not linked to parent.'
      });
    }

    // 6. Get student data with enrolled courses
    console.log('🔍 Attempting to find student with ID:', studentId);
    
    let student;
    try {
      student = await User.findById(studentId)
        .populate({
          path: 'enrolledCourses.course',
          select: 'title subject grade price videos exams createdBy',
          populate: {
            path: 'createdBy',
            select: 'firstName secondName thirdName fourthName'
          }
        })
        .lean();
      
      if (!student) {
        console.log('❌ Student not found:', studentId);
        return res.status(404).json({
          success: false,
          message: 'الطالب غير موجود'
        });
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
        message: 'خطأ في قاعدة البيانات أثناء جلب بيانات الطالب'
      });
    }

    // 7. Get exam results from ExamResult collection
    console.log('🔍 Fetching exam results for student:', studentId);
    
    let examResults = [];
    try {
      examResults = await ExamResult.find({ studentId: studentId })
        .populate('courseId', 'title subject grade')
        .sort({ submittedAt: -1 })
        .lean();
      console.log('📊 Exam results found:', examResults.length);
    } catch (examError) {
      console.error('💥 Error fetching exam results:', {
        error: examError.message,
        studentId
      });
      examResults = [];
    }

    // 8. Get quiz results
    let quizResults = [];
    try {
      const QuizResult = require('../models/QuizResult');
      quizResults = await QuizResult.find({ userId: studentId })
        .populate('courseId', 'title subject')
        .sort({ completedAt: -1 })
        .lean();
      console.log('📝 Quiz results found:', quizResults.length);
    } catch (quizError) {
      console.error('💥 Error fetching quiz results:', quizError.message);
      quizResults = [];
    }

    // 9. Get course progress
    let courseProgress = [];
    try {
      const UserCourseProgress = require('../models/UserCourseProgress');
      courseProgress = await UserCourseProgress.find({ userId: studentId })
        .populate('courseId', 'title subject grade')
        .lean();
      console.log('📈 Course progress found:', courseProgress.length);
    } catch (progressError) {
      console.error('💥 Error fetching course progress:', progressError.message);
      courseProgress = [];
    }

    // 10. Process enrolled courses
    const enrolledCourses = (student.enrolledCourses || []).map(enrollment => {
      const course = enrollment.course || enrollment.courseId || enrollment;
      const courseId = course._id || course;
      
      // Find progress for this course
      const progress = courseProgress.find(p => 
        p.courseId && (p.courseId._id?.toString() === courseId.toString() || p.courseId.toString() === courseId.toString())
      );
      
      // Calculate total lessons (videos + exams)
      const totalVideos = course.videos?.length || 0;
      const totalExams = course.exams?.length || 0;
      const totalLessons = totalVideos + totalExams;
      
      // Calculate completed lessons from progress
      const completedVideos = progress?.completedVideos?.length || 0;
      const completedExams = progress?.completedExams?.length || 0;
      const completedLessons = completedVideos + completedExams;
      
      // Map paymentStatus to subscriptionStatus
      let subscriptionStatus = 'غير محدد';
      if (enrollment.paymentStatus === 'approved') {
        subscriptionStatus = progress?.isCompleted ? 'Completed' : 'Active';
      } else if (enrollment.paymentStatus === 'pending') {
        subscriptionStatus = 'Pending';
      } else if (enrollment.paymentStatus === 'rejected') {
        subscriptionStatus = 'Expired';
      }
      
      // Get instructor name from course.createdBy
      let instructorName = 'غير محدد';
      if (course.createdBy) {
        const instructor = course.createdBy;
        const nameParts = [];
        if (instructor.firstName) nameParts.push(instructor.firstName);
        if (instructor.secondName) nameParts.push(instructor.secondName);
        if (instructor.thirdName) nameParts.push(instructor.thirdName);
        if (instructor.fourthName) nameParts.push(instructor.fourthName);
        instructorName = nameParts.length > 0 ? nameParts.join(' ') : 'غير محدد';
      }
      
      return {
        courseId: courseId,
        courseName: course.title || 'غير محدد',
        subject: course.subject || 'غير محدد',
        grade: course.grade || student.grade,
        progress: progress?.overallProgress || enrollment.progress || 0,
        status: enrollment.paymentStatus || 'pending',
        subscriptionStatus: subscriptionStatus,
        instructorName: instructorName,
        totalLessons: totalLessons,
        completedLessons: completedLessons,
        enrolledAt: enrollment.enrolledAt || progress?.enrolledAt,
        isCompleted: progress?.isCompleted || false
      };
    }).filter(enrollment => enrollment.courseId);

    // 11. Calculate statistics
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(c => c.isCompleted || c.status === 'approved').length;
    
    // Calculate average grade from exam results
    const validGrades = examResults.filter(exam => {
      if (exam.percentage !== null && exam.percentage !== undefined) return true;
      if (exam.score !== null && exam.score !== undefined && exam.maxScore && exam.maxScore > 0) return true;
      return false;
    });
    
    const averageGrade = validGrades.length > 0 
      ? Math.round(validGrades.reduce((sum, exam) => {
          if (exam.percentage !== null && exam.percentage !== undefined) {
            return sum + exam.percentage;
          }
          return sum + Math.round((exam.score / exam.maxScore) * 100);
        }, 0) / validGrades.length)
      : 0;

    // Calculate attendance rate based on course progress
    const totalPossibleProgress = enrolledCourses.length * 100;
    const actualProgress = enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0);
    const attendanceRate = totalPossibleProgress > 0 
      ? Math.round((actualProgress / totalPossibleProgress) * 100)
      : 0;

    // Last exam result
    const lastExam = examResults
      .filter(exam => {
        if (exam.percentage !== null && exam.percentage !== undefined) return true;
        if (exam.score !== null && exam.score !== undefined) return true;
        return false;
      })
      .sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || 0);
        const dateB = new Date(b.submittedAt || b.createdAt || 0);
        return dateB - dateA;
      })[0];

    // 12. Generate grade progression chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentExams = examResults
      .filter(exam => {
        const examDate = new Date(exam.submittedAt || exam.createdAt || 0);
        const hasScore = exam.percentage !== null && exam.percentage !== undefined || 
                        (exam.score !== null && exam.score !== undefined && exam.maxScore && exam.maxScore > 0);
        return examDate >= sixMonthsAgo && hasScore;
      })
      .sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || 0);
        const dateB = new Date(b.submittedAt || b.createdAt || 0);
        return dateA - dateB;
      });

    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const gradeProgression = recentExams.map(exam => {
      const examDate = new Date(exam.submittedAt || exam.createdAt || new Date());
      const month = monthNames[examDate.getMonth()];
      const grade = exam.percentage !== null && exam.percentage !== undefined 
        ? exam.percentage 
        : Math.round((exam.score / exam.maxScore) * 100);
      
      return {
        date: examDate.toISOString(),
        month: month,
        grade: grade,
        subject: exam.examTitle || exam.courseId?.title || 'عام'
      };
    });

    // 13. Subject distribution
    const subjectStats = {};
    examResults.forEach(exam => {
      const hasScore = exam.percentage !== null && exam.percentage !== undefined || 
                      (exam.score !== null && exam.score !== undefined && exam.maxScore && exam.maxScore > 0);
      
      if (hasScore) {
        const subject = exam.courseId?.subject || exam.courseId?.title || exam.examTitle || 'عام';
        if (!subjectStats[subject]) {
          subjectStats[subject] = { total: 0, count: 0, color: getSubjectColor(subject) };
        }
        const score = exam.percentage !== null && exam.percentage !== undefined 
          ? exam.percentage 
          : Math.round((exam.score / exam.maxScore) * 100);
        subjectStats[subject].total += score;
        subjectStats[subject].count += 1;
      }
    });

    const subjectDistribution = Object.keys(subjectStats).length > 0 
      ? Object.entries(subjectStats).map(([subject, data]) => ({
          name: subject,
          value: Math.round(data.total / data.count),
          percentage: Math.round(data.total / data.count),
          color: data.color,
          count: data.count
        }))
      : [];

    // 14. Course performance
    const coursePerformance = enrolledCourses.map(enrollment => {
      const courseId = enrollment.courseId;
      const courseExams = examResults.filter(exam => {
        const examCourseId = exam.courseId?._id?.toString() || exam.courseId?.toString() || exam.courseId;
        return examCourseId && examCourseId.toString() === courseId.toString();
      });
      
      const courseAverage = courseExams.length > 0 
        ? Math.round(courseExams.reduce((sum, exam) => {
            const score = exam.percentage !== null && exam.percentage !== undefined 
              ? exam.percentage 
              : (exam.score && exam.maxScore ? Math.round((exam.score / exam.maxScore) * 100) : 0);
            return sum + score;
          }, 0) / courseExams.length)
        : 0;

      const lastExam = courseExams.length > 0
        ? courseExams.sort((a, b) => new Date(b.submittedAt || b.examDate || 0) - new Date(a.submittedAt || a.examDate || 0))[0]
        : null;

      return {
        courseId: courseId,
        courseName: enrollment.courseName,
        status: enrollment.status,
        progress: enrollment.progress,
        averageGrade: courseAverage,
        examCount: courseExams.length,
        lastExamDate: lastExam ? (lastExam.submittedAt || lastExam.examDate) : null
      };
    });

    // 15. Recent activity (from exam results and quiz results)
    const recentActivity = [];
    
    // Add exam activities
    examResults.slice(0, 5).forEach(exam => {
      const score = exam.percentage !== null && exam.percentage !== undefined 
        ? exam.percentage 
        : (exam.score && exam.maxScore ? Math.round((exam.score / exam.maxScore) * 100) : 0);
      
      recentActivity.push({
        type: 'exam',
        title: `امتحان ${exam.examTitle || 'عام'}`,
        score: score,
        date: exam.submittedAt || exam.createdAt,
        courseName: exam.courseId?.title || exam.courseId || 'غير محدد',
        points: Math.round(score / 10)
      });
    });
    
    // Add quiz activities
    quizResults.slice(0, 3).forEach(quiz => {
      recentActivity.push({
        type: 'quiz',
        title: `اختبار ${quiz.courseId?.title || 'عام'}`,
        score: quiz.score,
        date: quiz.completedAt || quiz.createdAt,
        courseName: quiz.courseId?.title || 'غير محدد',
        points: Math.round(quiz.score / 10)
      });
    });
    
    // Sort by date and take top 10
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    const topRecentActivity = recentActivity.slice(0, 10);

    // 16. Format exam results for response
    const formattedExamResults = examResults.map(exam => ({
      id: exam._id,
      examId: exam.examId,
      examTitle: exam.examTitle,
      courseId: exam.courseId?._id || exam.courseId,
      courseName: exam.courseId?.title || 'غير محدد',
      subject: exam.courseId?.subject || 'غير محدد',
      score: exam.score,
      maxScore: exam.maxScore,
      percentage: exam.percentage || (exam.maxScore > 0 ? Math.round((exam.score / exam.maxScore) * 100) : 0),
      grade: exam.grade,
      level: exam.level,
      submittedAt: exam.submittedAt,
      createdAt: exam.createdAt
    }));

    // 17. Prepare comprehensive response
    const response = {
      success: true,
      student: {
        _id: student._id,
        firstName: student.firstName,
        secondName: student.secondName,
        thirdName: student.thirdName,
        fourthName: student.fourthName,
        userEmail: student.userEmail || student.email,
        phoneStudent: student.phoneStudent,
        studentId: student.studentId,
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
          subject: lastExam.examTitle || lastExam.courseId?.title || 'عام',
          score: lastExam.percentage || Math.round((lastExam.score / lastExam.maxScore) * 100),
          date: lastExam.submittedAt || lastExam.createdAt,
          courseName: lastExam.courseId?.title || 'غير محدد'
        } : null,
        lastExamScore: lastExam ? (lastExam.percentage || Math.round((lastExam.score / lastExam.maxScore) * 100)) : null,
        lastExamTotal: lastExam ? 100 : null
      },
      enrolledCourses,
      examResults: formattedExamResults,
      charts: {
        gradeProgression,
        subjectDistribution,
        coursePerformance,
        attendanceChart: coursePerformance.map(course => ({
          month: course.courseName,
          attendance: course.progress
        }))
      },
      recentActivity: topRecentActivity
    };

    console.log('✅ Comprehensive student data retrieved successfully');
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Get comprehensive student data error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      studentId: req.params.studentId,
      parentId: req.user?.id
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
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
  getStudentStats,
  getComprehensiveStudentData
};
