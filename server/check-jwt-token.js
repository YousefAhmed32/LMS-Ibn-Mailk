const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function checkJWTToken() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ0NmM5NzIxNmU4NmE1MGU4Mjc1MDYiLCJpYXQiOjE3NTg3ODQyNDUsImV4cCI6MTc1OTM4OTA0NX0.3ST57Lo2d6QUN8AmEd2RsZbY3q-7pL2hsEuXFa8wOYo';

    console.log('🔍 فحص الـ JWT Token:');
    const decoded = jwt.decode(token);
    console.log('📊 البيانات المفكوكة:', JSON.stringify(decoded, null, 2));
    
    const userId = decoded.userId;
    console.log(`\n👤 User ID من الـ Token: ${userId}`);
    
    // Check if this user exists in our database
    mongoose.connect('mongodb://localhost:27017/lms-ebn');
    const User = require('./models/User');
    
    const user = await User.findById(userId);
    if (user) {
      console.log('✅ المستخدم موجود في قاعدة البيانات:');
      console.log(`   📋 الاسم: ${user.firstName} ${user.secondName}`);
      console.log(`   📧 البريد: ${user.userEmail}`);
      console.log(`   🎭 الدور: ${user.role}`);
      console.log(`   🔗 الطلاب المرتبطين: ${user.linkedStudents ? user.linkedStudents.length : 0}`);
    } else {
      console.log('❌ المستخدم غير موجود في قاعدة البيانات');
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ خطأ في فك تشفير الـ Token:', error);
  }
}

checkJWTToken();
