const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testServerConnection() {
  try {
    console.log('🔍 اختبار اتصال السيرفر...\n');
    
    // Test basic server connection
    console.log('1️⃣ اختبار الاتصال الأساسي...');
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/test`);
      console.log('✅ السيرفر يعمل');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ السيرفر يعمل (404 متوقع لـ /test)');
      } else {
        console.log('❌ مشكلة في السيرفر:', error.message);
        return;
      }
    }
    
    // Test login endpoint
    console.log('\n2️⃣ اختبار تسجيل الدخول...');
    const loginData = {
      userEmail: 'parent.1758787663519@example.com',
      password: '123456'
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('✅ تسجيل الدخول يعمل');
    console.log(`🔑 التوكن: ${loginResponse.data.token.substring(0, 20)}...`);
    
    // Test parent routes
    console.log('\n3️⃣ اختبار routes ولي الأمر...');
    try {
      const childrenResponse = await axios.get(`${BASE_URL}/api/parent/children`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('✅ route الأطفال يعمل');
    } catch (error) {
      console.log('❌ مشكلة في route الأطفال:', error.response?.data || error.message);
    }
    
    // Test link-student endpoint with debug
    console.log('\n4️⃣ اختبار link-student مع تفاصيل...');
    const linkData = {
      parentId: '68d4f84fd27b8d99bdeed68f',
      studentId: '68b654bd37bcf19712729591'
    };
    
    try {
      const linkResponse = await axios.post(`${BASE_URL}/api/parent/link-student`, linkData, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ ربط الطالب يعمل');
      console.log('📋 الاستجابة:', JSON.stringify(linkResponse.data, null, 2));
    } catch (error) {
      console.log('❌ مشكلة في ربط الطالب:', error.response?.data || error.message);
      console.log('📊 رمز الحالة:', error.response?.status);
      
      if (error.response?.data) {
        console.log('📋 تفاصيل الخطأ:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
  }
}

testServerConnection();
