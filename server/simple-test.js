const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function simpleTest() {
  try {
    console.log('🧪 اختبار بسيط...\n');
    
    // Test with existing parent and student
    const parentId = '68d4ffe05a050b67078a3b71'; // From previous test
    const studentId = '68b654bd37bcf19712729591'; // The specific ID
    
    // Login
    const loginData = {
      userEmail: 'parent.final.1758787891234@example.com', // Use the email from previous test
      password: '123456'
    };
    
    console.log('1️⃣ تسجيل دخول...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('✅ تم تسجيل الدخول');
    
    // Test link
    console.log('\n2️⃣ ربط الطالب...');
    const linkData = {
      parentId: parentId,
      studentId: studentId
    };
    
    const linkResponse = await axios.post(`${BASE_URL}/api/parent/link-student`, linkData, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ تم ربط الطالب بنجاح!');
    console.log('📋 الاستجابة:', JSON.stringify(linkResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ خطأ:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.log('📋 تفاصيل:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

simpleTest();
