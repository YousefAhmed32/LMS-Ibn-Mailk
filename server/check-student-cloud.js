const mongoose = require('mongoose');

// Connect to MongoDB Atlas (same as server)
mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function checkStudentInCloud() {
  try {
    console.log('☁️ فحص الطالب في قاعدة البيانات السحابية...\n');
    
    const studentId = '68b654bd37bcf19712729591';
    
    console.log(`🎯 البحث عن الطالب: ${studentId}`);
    console.log(`✅ صحة الـ ObjectId: ${mongoose.Types.ObjectId.isValid(studentId)}`);
    
    // Check if student exists
    const student = await User.findById(studentId);
    
    if (student) {
      console.log('✅ الطالب موجود في السحابة!');
      console.log(`📋 الاسم: ${student.firstName} ${student.secondName} ${student.thirdName} ${student.fourthName}`);
      console.log(`📧 البريد: ${student.userEmail}`);
      console.log(`🎭 الدور: ${student.role}`);
      console.log(`✅ نشط: ${student.isActive}`);
      console.log(`🎓 معرف الطالب: ${student.studentId || 'غير محدد'}`);
      console.log(`📱 الهاتف: ${student.phoneStudent || 'غير محدد'}`);
      console.log(`🏫 الصف: ${student.grade || 'غير محدد'}`);
      console.log(`📍 المحافظة: ${student.governorate || 'غير محدد'}`);
    } else {
      console.log('❌ الطالب غير موجود في السحابة');
      
      // List all students for reference
      console.log('\n👥 جميع الطلاب في السحابة:');
      const allStudents = await User.find({ role: 'student' });
      allStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student._id} - ${student.firstName} ${student.secondName}`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkStudentInCloud();
