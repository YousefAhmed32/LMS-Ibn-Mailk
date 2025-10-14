const mongoose = require('mongoose');

// Connect to MongoDB Atlas (same as server)
mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function testDatabaseQuery() {
  try {
    console.log('🧪 اختبار استعلام قاعدة البيانات...\n');
    
    const studentId = '68b654bd37bcf19712729591';
    
    console.log(`🎯 البحث عن الطالب: ${studentId}`);
    console.log(`✅ صحة الـ ObjectId: ${mongoose.Types.ObjectId.isValid(studentId)}`);
    
    // Test the exact query from controller
    console.log('\n1️⃣ اختبار الاستعلام المحدد من الـ controller:');
    const student = await User.findOne({ 
      _id: studentId,
      role: 'student',
      isActive: true 
    });
    
    console.log('النتيجة:', student ? 'موجود' : 'غير موجود');
    
    if (student) {
      console.log('📋 تفاصيل الطالب:');
      console.log(`   🆔 الـ ID: ${student._id}`);
      console.log(`   📋 الاسم: ${student.firstName} ${student.secondName}`);
      console.log(`   🎭 الدور: ${student.role}`);
      console.log(`   ✅ نشط: ${student.isActive}`);
    } else {
      console.log('❌ الطالب غير موجود بالاستعلام المحدد');
      
      // Test without filters
      console.log('\n2️⃣ اختبار بدون فلاتر:');
      const studentNoFilters = await User.findById(studentId);
      console.log('النتيجة:', studentNoFilters ? 'موجود' : 'غير موجود');
      
      if (studentNoFilters) {
        console.log('📋 تفاصيل الطالب بدون فلاتر:');
        console.log(`   🆔 الـ ID: ${studentNoFilters._id}`);
        console.log(`   📋 الاسم: ${studentNoFilters.firstName} ${studentNoFilters.secondName}`);
        console.log(`   🎭 الدور: ${studentNoFilters.role}`);
        console.log(`   ✅ نشط: ${studentNoFilters.isActive}`);
      }
    }
    
    // List all students
    console.log('\n3️⃣ جميع الطلاب:');
    const allStudents = await User.find({ role: 'student' });
    console.log(`👥 إجمالي الطلاب: ${allStudents.length}`);
    
    allStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student._id} - ${student.firstName} ${student.secondName} (نشط: ${student.isActive})`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDatabaseQuery();
