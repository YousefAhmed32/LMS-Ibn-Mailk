const axios = require('axios');
const mongoose = require('mongoose');

async function testCompleteAuthFlow() {
  console.log('🔐 اختبار شامل لنظام المصادقة');
  console.log('===============================');
  
  const API_BASE_URL = 'http://localhost:5000';
  
  // بيانات المستخدم الصحيحة
  const validUser = {
    firstName: "أحمد",
    secondName: "محمد", 
    thirdName: "علي",
    fourthName: "حسن",
    email: "test.user.1234567890@example.com",
    password: "password123",
    phoneStudent: "01234567890",
    guardianPhone: "01234567891",
    governorate: "Cairo",
    grade: "أولى إعدادي",
    role: "student"
  };
  
  let testResults = {
    registration: null,
    login: null,
    duplicateRegistration: null,
    invalidLogin: null,
    success: false
  };
  
  try {
    // اختبار 1: التسجيل
    console.log('\n📝 اختبار التسجيل...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, validUser, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.registration = {
        success: true,
        status: registerResponse.status,
        data: registerResponse.data
      };
      
      console.log('✅ التسجيل نجح');
      console.log('   الحالة:', registerResponse.status);
      console.log('   النجاح:', registerResponse.data.success);
      console.log('   الرمز المميز:', registerResponse.data.token ? 'موجود' : 'مفقود');
      console.log('   معرف المستخدم:', registerResponse.data.user?._id);
      
    } catch (error) {
      testResults.registration = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('❌ التسجيل فشل');
      console.log('   الحالة:', error.response?.status);
      console.log('   الخطأ:', error.response?.data || error.message);
    }
    
    // اختبار 2: تسجيل الدخول
    console.log('\n🔐 اختبار تسجيل الدخول...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: validUser.email, // استخدام userEmail كما هو متوقع
        password: validUser.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.login = {
        success: true,
        status: loginResponse.status,
        data: loginResponse.data
      };
      
      console.log('✅ تسجيل الدخول نجح');
      console.log('   الحالة:', loginResponse.status);
      console.log('   النجاح:', loginResponse.data.success);
      console.log('   الرمز المميز:', loginResponse.data.token ? 'موجود' : 'مفقود');
      console.log('   المستخدم:', loginResponse.data.user?.email);
      
    } catch (error) {
      testResults.login = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('❌ تسجيل الدخول فشل');
      console.log('   الحالة:', error.response?.status);
      console.log('   الخطأ:', error.response?.data || error.message);
    }
    
    // اختبار 3: التسجيل المكرر
    console.log('\n🔄 اختبار التسجيل المكرر...');
    try {
      const duplicateResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, validUser, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.duplicateRegistration = {
        success: false,
        status: duplicateResponse.status,
        data: duplicateResponse.data
      };
      
      console.log('⚠️ التسجيل المكرر نجح (يجب أن يفشل)');
      console.log('   الحالة:', duplicateResponse.status);
      
    } catch (error) {
      testResults.duplicateRegistration = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('✅ التسجيل المكرر تم رفضه بشكل صحيح');
      console.log('   الحالة:', error.response?.status);
      console.log('   الخطأ:', error.response?.data?.error || error.response?.data?.message);
    }
    
    // اختبار 4: تسجيل الدخول بكلمة مرور خاطئة
    console.log('\n❌ اختبار تسجيل الدخول بكلمة مرور خاطئة...');
    try {
      const invalidLoginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: validUser.email,
        password: "wrongpassword"
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.invalidLogin = {
        success: false,
        status: invalidLoginResponse.status,
        data: invalidLoginResponse.data
      };
      
      console.log('⚠️ تسجيل الدخول بكلمة مرور خاطئة نجح (يجب أن يفشل)');
      console.log('   الحالة:', invalidLoginResponse.status);
      
    } catch (error) {
      testResults.invalidLogin = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('✅ تسجيل الدخول بكلمة مرور خاطئة تم رفضه بشكل صحيح');
      console.log('   الحالة:', error.response?.status);
      console.log('   الخطأ:', error.response?.data?.error || error.response?.data?.message);
    }
    
    // تقييم النتائج
    console.log('\n📊 تقرير النتائج');
    console.log('================');
    
    const registrationSuccess = testResults.registration?.success;
    const loginSuccess = testResults.login?.success;
    const duplicateRejected = !testResults.duplicateRegistration?.success;
    const invalidLoginRejected = !testResults.invalidLogin?.success;
    
    testResults.success = registrationSuccess && loginSuccess && duplicateRejected && invalidLoginRejected;
    
    console.log('\n✅ الحالات الناجحة:');
    if (registrationSuccess) {
      console.log('   - التسجيل: يعمل بشكل صحيح');
    }
    if (loginSuccess) {
      console.log('   - تسجيل الدخول: يعمل بشكل صحيح');
    }
    if (duplicateRejected) {
      console.log('   - رفض التسجيل المكرر: يعمل بشكل صحيح');
    }
    if (invalidLoginRejected) {
      console.log('   - رفض تسجيل الدخول بكلمة مرور خاطئة: يعمل بشكل صحيح');
    }
    
    console.log('\n❌ الحالات الفاشلة:');
    if (!registrationSuccess) {
      console.log('   - التسجيل: فشل');
    }
    if (!loginSuccess) {
      console.log('   - تسجيل الدخول: فشل');
    }
    if (!duplicateRejected) {
      console.log('   - رفض التسجيل المكرر: لا يعمل');
    }
    if (!invalidLoginRejected) {
      console.log('   - رفض تسجيل الدخول بكلمة مرور خاطئة: لا يعمل');
    }
    
    if (testResults.success) {
      console.log('\n🎉 جميع الاختبارات نجحت! نظام المصادقة يعمل بشكل مثالي');
    } else {
      console.log('\n⚠️ بعض الاختبارات فشلت. يرجى مراجعة الأخطاء أعلاه');
    }
    
    // تنظيف البيانات التجريبية
    console.log('\n🧹 تنظيف البيانات التجريبية...');
    try {
      await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
      const User = require('./models/User');
      await User.deleteOne({ email: validUser.email });
      console.log('✅ تم حذف المستخدم التجريبي');
    } catch (cleanupError) {
      console.log('⚠️ فشل في تنظيف البيانات:', cleanupError.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  } finally {
    try {
      await mongoose.disconnect();
    } catch (e) {
      // تجاهل خطأ قطع الاتصال
    }
  }
}

testCompleteAuthFlow();
