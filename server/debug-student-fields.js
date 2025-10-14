const mongoose = require('mongoose');

// Connect to MongoDB Atlas (same as server)
mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function debugStudentFields() {
  try {
    console.log('🔍 فحص حقول الطالب...\n');
    
    const studentId = '68b654bd37bcf19712729591';
    
    const student = await User.findById(studentId);
    
    if (student) {
      console.log('📋 جميع حقول الطالب:');
      console.log(`   🆔 _id: ${student._id}`);
      console.log(`   📋 firstName: ${student.firstName}`);
      console.log(`   📋 secondName: ${student.secondName}`);
      console.log(`   🎭 role: "${student.role}" (type: ${typeof student.role})`);
      console.log(`   ✅ isActive: ${student.isActive} (type: ${typeof student.isActive})`);
      console.log(`   📧 userEmail: ${student.userEmail}`);
      console.log(`   🎓 studentId: ${student.studentId}`);
      console.log(`   📱 phoneStudent: ${student.phoneStudent}`);
      console.log(`   🏫 grade: ${student.grade}`);
      console.log(`   📍 governorate: ${student.governorate}`);
      
      // Test individual conditions
      console.log('\n🧪 اختبار الشروط الفردية:');
      console.log(`   role === 'student': ${student.role === 'student'}`);
      console.log(`   isActive === true: ${student.isActive === true}`);
      console.log(`   isActive: ${student.isActive}`);
      
      // Test the exact query
      console.log('\n🔍 اختبار الاستعلام المحدد:');
      const testQuery = await User.findOne({ 
        _id: studentId,
        role: 'student',
        isActive: true 
      });
      console.log(`النتيجة: ${testQuery ? 'موجود' : 'غير موجود'}`);
      
      // Test without isActive
      console.log('\n🔍 اختبار بدون isActive:');
      const testQueryNoActive = await User.findOne({ 
        _id: studentId,
        role: 'student'
      });
      console.log(`النتيجة: ${testQueryNoActive ? 'موجود' : 'غير موجود'}`);
      
    } else {
      console.log('❌ الطالب غير موجود');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugStudentFields();
