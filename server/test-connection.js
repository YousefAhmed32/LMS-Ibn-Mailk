const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testConnection() {
  try {
    console.log('🔗 اختبار الاتصال بالـ server...\n');
    
    // Test basic connection
    const response = await axios.get(`${BASE_URL}/api/auth/test`, {
      timeout: 5000
    });
    
    console.log('✅ الاتصال يعمل');
    console.log('📊 الاستجابة:', response.data);
    
  } catch (error) {
    console.log('❌ خطأ في الاتصال:', error.code);
    console.log('🔍 تفاصيل الخطأ:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 الـ server غير متاح');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 لا يمكن العثور على العنوان');
    } else if (error.response) {
      console.log('📊 حالة الخطأ:', error.response.status);
      console.log('📊 بيانات الخطأ:', error.response.data);
    }
  }
}

testConnection();
