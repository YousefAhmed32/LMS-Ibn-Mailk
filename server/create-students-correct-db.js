const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB - using the correct database that the server uses
mongoose.connect('mongodb://localhost:27017/lms-ebn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function createStudentsInCorrectDatabase() {
  try {
    console.log('🎓 إنشاء طلاب في قاعدة البيانات الصحيحة (lms-ebn)...\n');
    
    // Check if students already exist
    const existingStudents = await User.find({ role: 'student' });
    console.log(`📊 الطلاب الموجودين حالياً: ${existingStudents.length}`);
    
    if (existingStudents.length > 0) {
      console.log('👥 الطلاب الموجودين:');
      existingStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student._id} - ${student.firstName} ${student.secondName}`);
      });
    }
    
    // Create additional test students if needed
    const testStudents = [
      {
        firstName: 'أحمد',
        secondName: 'محمد',
        thirdName: 'علي',
        fourthName: 'حسن',
        userEmail: 'ahmed.new@test.com',
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
        userEmail: 'fatima.new@test.com',
        password: await bcrypt.hash('123456', 10),
        phoneStudent: '01234567891',
        studentId: 'STU002',
        grade: 'grade11',
        governorate: 'Alexandria',
        role: 'student',
        isActive: true,
        enrolledCourses: []
      }
    ];
    
    console.log('📝 إنشاء طلاب إضافيين...');
    const createdStudents = await User.insertMany(testStudents);
    
    console.log(`✅ تم إنشاء ${createdStudents.length} طالب إضافي!\n`);
    
    console.log('🎯 جميع الطلاب المتاحين للربط:');
    console.log('='.repeat(80));
    
    const allStudents = await User.find({ role: 'student', isActive: true });
    allStudents.forEach((student, index) => {
      console.log(`\n${index + 1}. الطالب:`);
      console.log(`   📋 الاسم: ${student.firstName} ${student.secondName} ${student.thirdName} ${student.fourthName}`);
      console.log(`   🆔 ObjectId: ${student._id}`);
      console.log(`   📧 البريد: ${student.userEmail}`);
      console.log(`   🎓 معرف الطالب: ${student.studentId || 'غير محدد'}`);
      console.log(`   📱 الهاتف: ${student.phoneStudent || 'غير محدد'}`);
      console.log(`   🏫 الصف: ${student.grade || 'غير محدد'}`);
      console.log(`   📍 المحافظة: ${student.governorate || 'غير محدد'}`);
    });
    
    console.log('\n🎉 يمكنك الآن استخدام أي من هذه الـ ObjectIds لربط الطلاب!');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الطلاب:', error);
  } finally {
    mongoose.connection.close();
  }
}

createStudentsInCorrectDatabase();
