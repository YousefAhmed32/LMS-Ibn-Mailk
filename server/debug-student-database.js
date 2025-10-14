const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms-ebn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function debugStudentDatabase() {
  try {
    console.log('🔍 فحص قاعدة البيانات للطلاب...\n');
    
    // Find all students
    const students = await User.find({ role: 'student' }).select('_id firstName secondName thirdName fourthName userEmail studentId isActive linkedStudents');
    
    console.log(`📊 إجمالي الطلاب في قاعدة البيانات: ${students.length}\n`);
    
    if (students.length === 0) {
      console.log('❌ لا يوجد طلاب في قاعدة البيانات!');
      console.log('💡 الحل: يجب إنشاء طلاب أولاً');
      return;
    }
    
    console.log('👥 قائمة الطلاب المتاحين:');
    console.log('='.repeat(80));
    
    students.forEach((student, index) => {
      console.log(`\n${index + 1}. الطالب:`);
      console.log(`   📋 الاسم: ${student.firstName} ${student.secondName} ${student.thirdName} ${student.fourthName}`);
      console.log(`   🆔 ObjectId: ${student._id}`);
      console.log(`   📧 البريد: ${student.userEmail}`);
      console.log(`   🎓 معرف الطالب: ${student.studentId || 'غير محدد'}`);
      console.log(`   ✅ نشط: ${student.isActive ? 'نعم' : 'لا'}`);
      console.log(`   🔗 مرتبط بولي أمر: ${student.linkedStudents && student.linkedStudents.length > 0 ? 'نعم' : 'لا'}`);
    });
    
    // Find active students only
    const activeStudents = students.filter(s => s.isActive);
    console.log(`\n✅ الطلاب النشطين: ${activeStudents.length}`);
    
    // Find students not linked to any parent
    const unlinkedStudents = students.filter(s => s.isActive && (!s.linkedStudents || s.linkedStudents.length === 0));
    console.log(`🔓 الطلاب غير المرتبطين: ${unlinkedStudents.length}`);
    
    if (unlinkedStudents.length > 0) {
      console.log('\n🎯 الطلاب المتاحين للربط:');
      unlinkedStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student._id} - ${student.firstName} ${student.secondName}`);
      });
    }
    
    // Check parents
    const parents = await User.find({ role: 'parent' }).select('_id firstName secondName userEmail linkedStudents');
    console.log(`\n👨‍👩‍👧‍👦 إجمالي أولياء الأمور: ${parents.length}`);
    
    parents.forEach((parent, index) => {
      console.log(`\n${index + 1}. ولي الأمر:`);
      console.log(`   📋 الاسم: ${parent.firstName} ${parent.secondName}`);
      console.log(`   🆔 ObjectId: ${parent._id}`);
      console.log(`   📧 البريد: ${parent.userEmail}`);
      console.log(`   🔗 الطلاب المرتبطين: ${parent.linkedStudents ? parent.linkedStudents.length : 0}`);
    });
    
    // Test specific parent account
    const testParent = await User.findOne({ userEmail: 'parant@gmail.com' });
    if (testParent) {
      console.log(`\n🔍 حساب ولي الأمر للاختبار:`);
      console.log(`   🆔 ObjectId: ${testParent._id}`);
      console.log(`   📧 البريد: ${testParent.userEmail}`);
      console.log(`   🔗 الطلاب المرتبطين: ${testParent.linkedStudents ? testParent.linkedStudents.length : 0}`);
    } else {
      console.log(`\n❌ لم يتم العثور على حساب parant@gmail.com`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugStudentDatabase();
