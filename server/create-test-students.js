const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms-ebn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function createTestStudents() {
  try {
    console.log('🎓 إنشاء طلاب للاختبار...\n');
    
    // Check if students already exist
    const existingStudents = await User.find({ role: 'student' });
    if (existingStudents.length > 0) {
      console.log(`✅ يوجد بالفعل ${existingStudents.length} طالب في قاعدة البيانات`);
      existingStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student._id} - ${student.firstName} ${student.secondName}`);
      });
      return;
    }
    
    // Create test students with correct enum values
    const testStudents = [
      {
        firstName: 'أحمد',
        secondName: 'محمد',
        thirdName: 'علي',
        fourthName: 'حسن',
        userEmail: 'ahmed.student@test.com',
        password: await bcrypt.hash('123456', 10),
        phoneStudent: '01234567890',
        studentId: 'STU001',
        grade: 'grade10',
        governorate: 'Cairo',
        role: 'student',
        isActive: true,
        enrolledCourses: []
      },
      {
        firstName: 'فاطمة',
        secondName: 'أحمد',
        thirdName: 'محمد',
        fourthName: 'علي',
        userEmail: 'fatima.student@test.com',
        password: await bcrypt.hash('123456', 10),
        phoneStudent: '01234567891',
        studentId: 'STU002',
        grade: 'grade11',
        governorate: 'Alexandria',
        role: 'student',
        isActive: true,
        enrolledCourses: []
      },
      {
        firstName: 'محمد',
        secondName: 'علي',
        thirdName: 'حسن',
        fourthName: 'أحمد',
        userEmail: 'mohamed.student@test.com',
        password: await bcrypt.hash('123456', 10),
        phoneStudent: '01234567892',
        studentId: 'STU003',
        grade: 'grade12',
        governorate: 'Giza',
        role: 'student',
        isActive: true,
        enrolledCourses: []
      },
      {
        firstName: 'سارة',
        secondName: 'محمد',
        thirdName: 'علي',
        fourthName: 'حسن',
        userEmail: 'sara.student@test.com',
        password: await bcrypt.hash('123456', 10),
        phoneStudent: '01234567893',
        studentId: 'STU004',
        grade: 'grade10',
        governorate: 'Minya',
        role: 'student',
        isActive: true,
        enrolledCourses: []
      },
      {
        firstName: 'يوسف',
        secondName: 'أحمد',
        thirdName: 'محمد',
        fourthName: 'علي',
        userEmail: 'youssef.student@test.com',
        password: await bcrypt.hash('123456', 10),
        phoneStudent: '01234567894',
        studentId: 'STU005',
        grade: 'grade11',
        governorate: 'Assiut',
        role: 'student',
        isActive: true,
        enrolledCourses: []
      }
    ];
    
    console.log('📝 إنشاء الطلاب...');
    const createdStudents = await User.insertMany(testStudents);
    
    console.log(`✅ تم إنشاء ${createdStudents.length} طالب بنجاح!\n`);
    
    console.log('🎯 الطلاب المتاحين للربط:');
    console.log('='.repeat(80));
    
    createdStudents.forEach((student, index) => {
      console.log(`\n${index + 1}. الطالب:`);
      console.log(`   📋 الاسم: ${student.firstName} ${student.secondName} ${student.thirdName} ${student.fourthName}`);
      console.log(`   🆔 ObjectId: ${student._id}`);
      console.log(`   📧 البريد: ${student.userEmail}`);
      console.log(`   🎓 معرف الطالب: ${student.studentId}`);
      console.log(`   📱 الهاتف: ${student.phoneStudent}`);
      console.log(`   🏫 الصف: ${student.grade}`);
      console.log(`   📍 المحافظة: ${student.governorate}`);
    });
    
    console.log('\n🎉 يمكنك الآن استخدام أي من هذه الـ ObjectIds لربط الطلاب!');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الطلاب:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestStudents();