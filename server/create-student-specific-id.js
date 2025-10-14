const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms-ebn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function createStudentWithSpecificId() {
  try {
    console.log('🎯 إنشاء طالب بالـ ID المحدد...\n');
    
    const specificId = '68b654bd37bcf19712729591';
    
    // Check if student already exists
    const existingStudent = await User.findById(specificId);
    if (existingStudent) {
      console.log('✅ الطالب موجود بالفعل!');
      console.log(`📋 الاسم: ${existingStudent.firstName} ${existingStudent.secondName}`);
      console.log(`📧 البريد: ${existingStudent.userEmail}`);
      return;
    }
    
    // Create new student with specific ID
    const studentData = {
      _id: new mongoose.Types.ObjectId(specificId),
      firstName: 'أحمد',
      secondName: 'محمد',
      thirdName: 'علي',
      fourthName: 'حسن',
      userEmail: 'ahmed.specific@test.com',
      password: '123456', // Will be hashed by pre-save middleware
      role: 'student',
      isActive: true,
      studentId: 'STU-2024-001',
      phoneStudent: '01234567890',
      grade: 'grade10',
      governorate: 'Cairo',
      address: 'شارع التحرير، القاهرة',
      birthDate: new Date('2008-01-15'),
      gender: 'male',
      parentPhone: '01012345678',
      parentName: 'محمد علي حسن',
      parentRelation: 'أب',
      schoolName: 'مدرسة النهضة الثانوية',
      academicYear: '2024-2025',
      // Add some sample academic data
      courses: [
        {
          name: 'الرياضيات',
          grade: 85,
          progress: 75,
          attendance: 90
        },
        {
          name: 'الفيزياء',
          grade: 78,
          progress: 60,
          attendance: 85
        },
        {
          name: 'الكيمياء',
          grade: 92,
          progress: 80,
          attendance: 95
        }
      ],
      totalVideosWatched: 45,
      studyHours: 120,
      lastActivity: new Date(),
      averageGrade: 85,
      attendanceRate: 90
    };
    
    const newStudent = new User(studentData);
    await newStudent.save();
    
    console.log('✅ تم إنشاء الطالب بنجاح!');
    console.log(`🆔 الـ ID: ${newStudent._id}`);
    console.log(`📋 الاسم: ${newStudent.firstName} ${newStudent.secondName} ${newStudent.thirdName} ${newStudent.fourthName}`);
    console.log(`📧 البريد: ${newStudent.userEmail}`);
    console.log(`🎓 معرف الطالب: ${newStudent.studentId}`);
    console.log(`📱 الهاتف: ${newStudent.phoneStudent}`);
    console.log(`🏫 الصف: ${newStudent.grade}`);
    console.log(`📍 المحافظة: ${newStudent.governorate}`);
    console.log(`📊 متوسط الدرجات: ${newStudent.averageGrade}`);
    console.log(`📈 معدل الحضور: ${newStudent.attendanceRate}%`);
    console.log(`🎥 الفيديوهات المشاهدة: ${newStudent.totalVideosWatched}`);
    console.log(`⏰ ساعات الدراسة: ${newStudent.studyHours}`);
    
    console.log('\n🎉 يمكنك الآن استخدام هذا الـ ID لربط الطالب!');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الطالب:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 السبب: البريد الإلكتروني مستخدم بالفعل');
    }
  } finally {
    mongoose.connection.close();
  }
}

createStudentWithSpecificId();
