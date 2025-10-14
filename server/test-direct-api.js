const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDirectAPI() {
  try {
    console.log('🧪 اختبار مباشر للـ API...\n');
    
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ0NmM5NzIxNmU4NmE1MGU4Mjc1MDYiLCJpYXQiOjE3NTg3ODQyNDUsImV4cCI6MTc1OTM4OTA0NX0.3ST57Lo2d6QUN8AmEd2RsZbY3q-7pL2hsEuXFa8wOYo';
    const studentId = '68d4eb443239c048e27a08fd';
    
    console.log(`🔑 Token: ${token.substring(0, 50)}...`);
    console.log(`🎓 Student ID: ${studentId}`);
    
    const response = await axios.post(`${BASE_URL}/api/parent/link-student`, {
      studentId: studentId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ نجح الطلب!');
    console.log('📊 الاستجابة:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ فشل الطلب:');
    console.log('🔍 كود الخطأ:', error.code);
    console.log('🔍 رسالة الخطأ:', error.message);
    
    if (error.response) {
      console.log('📊 حالة الخطأ:', error.response.status);
      console.log('📊 بيانات الخطأ:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testDirectAPI();
