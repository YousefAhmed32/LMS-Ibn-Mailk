const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testLogin() {
  try {
    console.log('🔐 اختبار تسجيل الدخول...\n');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      userEmail: 'parant@gmail.com',
      password: '11112006My25'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('📊 استجابة تسجيل الدخول:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:');
    console.log('🔍 كود الخطأ:', error.code);
    console.log('🔍 رسالة الخطأ:', error.message);
    
    if (error.response) {
      console.log('📊 حالة الخطأ:', error.response.status);
      console.log('📊 بيانات الخطأ:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('📊 لم يتم إرسال الطلب:', error.request);
    }
  }
}

testLogin();