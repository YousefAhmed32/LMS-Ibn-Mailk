const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lms-ebn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = require('./models/User');

async function createTestParent() {
  try {
    console.log('👨‍👩‍👧‍👦 إنشاء حساب ولي أمر للاختبار...\n');
    
    // Check if parent already exists
    const existingParent = await User.findOne({ userEmail: 'parant@gmail.com' });
    if (existingParent) {
      console.log('✅ حساب ولي الأمر موجود بالفعل');
      console.log(`🆔 ObjectId: ${existingParent._id}`);
      console.log(`📧 البريد: ${existingParent.userEmail}`);
      console.log(`🔗 الطلاب المرتبطين: ${existingParent.linkedStudents ? existingParent.linkedStudents.length : 0}`);
      return existingParent._id;
    }
    
    // Create test parent
    const testParent = {
      firstName: 'أحمد',
      secondName: 'محمد',
      thirdName: 'علي',
      fourthName: 'حسن',
      userEmail: 'parant@gmail.com',
      password: await bcrypt.hash('11112006My25', 10),
      phoneNumber: '01234567899',
      role: 'parent',
      isActive: true,
      linkedStudents: []
    };
    
    console.log('📝 إنشاء حساب ولي الأمر...');
    const createdParent = await User.create(testParent);
    
    console.log('✅ تم إنشاء حساب ولي الأمر بنجاح!');
    console.log(`🆔 ObjectId: ${createdParent._id}`);
    console.log(`📧 البريد: ${createdParent.userEmail}`);
    console.log(`📱 الهاتف: ${createdParent.phoneNumber}`);
    console.log(`🔗 الطلاب المرتبطين: ${createdParent.linkedStudents.length}`);
    
    return createdParent._id;
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب ولي الأمر:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestParent();
