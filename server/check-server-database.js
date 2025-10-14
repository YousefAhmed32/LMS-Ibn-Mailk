const mongoose = require('mongoose');

// Connect to MongoDB - using the exact same connection as the server
mongoose.connect('mongodb://localhost:27017/lms-ebn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function checkServerDatabase() {
  try {
    console.log('🔍 فحص قاعدة البيانات التي يستخدمها الـ server...\n');
    
    console.log(`📊 قاعدة البيانات: ${mongoose.connection.name}`);
    console.log(`🔗 الاتصال: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Check all users
    const allUsers = await User.find({});
    console.log(`👥 إجمالي المستخدمين: ${allUsers.length}`);
    
    // Check students
    const students = await User.find({ role: 'student' });
    console.log(`🎓 إجمالي الطلاب: ${students.length}`);
    
    // Check parents
    const parents = await User.find({ role: 'parent' });
    console.log(`👨‍👩‍👧‍👦 إجمالي أولياء الأمور: ${parents.length}`);
    
    console.log('\n👥 جميع الطلاب:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student._id} - ${student.firstName} ${student.secondName} (Active: ${student.isActive})`);
    });
    
    console.log('\n👨‍👩‍👧‍👦 جميع أولياء الأمور:');
    parents.forEach((parent, index) => {
      console.log(`${index + 1}. ${parent._id} - ${parent.firstName} ${parent.secondName} (${parent.userEmail})`);
    });
    
    // Test specific student
    const testStudentId = '68d4eb443239c048e27a08fd';
    console.log(`\n🔍 اختبار البحث عن الطالب: ${testStudentId}`);
    
    const student = await User.findOne({ 
      _id: testStudentId,
      role: 'student',
      isActive: true 
    });
    
    if (student) {
      console.log('✅ تم العثور على الطالب!');
      console.log(`📋 الاسم: ${student.firstName} ${student.secondName}`);
    } else {
      console.log('❌ لم يتم العثور على الطالب');
      
      // Try to find by ID only
      const studentById = await User.findById(testStudentId);
      if (studentById) {
        console.log('🔍 الطالب موجود لكن:');
        console.log(`   Role: ${studentById.role}`);
        console.log(`   Active: ${studentById.isActive}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkServerDatabase();
