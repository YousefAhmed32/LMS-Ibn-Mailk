const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms-ebn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function debugStudentSearch() {
  try {
    console.log('🔍 فحص بحث الطالب في قاعدة البيانات...\n');
    
    const studentId = '68b654bd37bcf19712729591';
    
    console.log(`🎯 البحث عن الطالب: ${studentId}`);
    console.log(`✅ صحة الـ ObjectId: ${mongoose.Types.ObjectId.isValid(studentId)}`);
    
    // Test different search methods
    console.log('\n1️⃣ البحث بالـ _id فقط:');
    const studentById = await User.findById(studentId);
    console.log('النتيجة:', studentById ? 'موجود' : 'غير موجود');
    
    console.log('\n2️⃣ البحث بالـ _id + role:');
    const studentByIdRole = await User.findOne({ 
      _id: studentId,
      role: 'student'
    });
    console.log('النتيجة:', studentByIdRole ? 'موجود' : 'غير موجود');
    
    console.log('\n3️⃣ البحث بالـ _id + role + isActive:');
    const studentByIdRoleActive = await User.findOne({ 
      _id: studentId,
      role: 'student',
      isActive: true 
    });
    console.log('النتيجة:', studentByIdRoleActive ? 'موجود' : 'غير موجود');
    
    if (studentById) {
      console.log('\n📋 تفاصيل الطالب:');
      console.log(`   🆔 الـ ID: ${studentById._id}`);
      console.log(`   📋 الاسم: ${studentById.firstName} ${studentById.secondName}`);
      console.log(`   🎭 الدور: ${studentById.role}`);
      console.log(`   ✅ نشط: ${studentById.isActive}`);
      console.log(`   📧 البريد: ${studentById.userEmail}`);
    }
    
    // Check if there are any students at all
    console.log('\n4️⃣ فحص جميع الطلاب:');
    const allStudents = await User.find({ role: 'student' });
    console.log(`👥 إجمالي الطلاب: ${allStudents.length}`);
    
    allStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student._id} - ${student.firstName} ${student.secondName} (نشط: ${student.isActive})`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugStudentSearch();