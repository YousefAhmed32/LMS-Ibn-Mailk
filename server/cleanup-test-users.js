const mongoose = require('mongoose');

async function cleanupTestUsers() {
  try {
    console.log('🧹 تنظيف المستخدمين التجريبيين');
    console.log('==============================');
    
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ متصل بقاعدة البيانات');
    
    const User = require('./models/User');
    
    // حذف جميع المستخدمين التجريبيين
    const testEmails = [
      'test.user.1234567890@example.com',
      'user26@gmail.com',
      'test@example.com',
      'admin@test.com'
    ];
    
    for (const email of testEmails) {
      const result = await User.deleteOne({ email: email });
      if (result.deletedCount > 0) {
        console.log(`🗑️ تم حذف المستخدم: ${email}`);
      }
    }
    
    // عرض المستخدمين المتبقين
    const remainingUsers = await User.find({});
    console.log(`\n📊 المستخدمين المتبقين: ${remainingUsers.length}`);
    
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.role}`);
    });
    
    console.log('\n✅ تم تنظيف قاعدة البيانات بنجاح');
    
  } catch (error) {
    console.error('❌ خطأ في التنظيف:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

cleanupTestUsers();
