const axios = require('axios');

async function testServerConnection() {
  console.log('🔍 اختبار اتصال الخادم');
  console.log('======================');
  
  try {
    const response = await axios.get('http://localhost:5000/health', {
      timeout: 5000
    });
    
    console.log('✅ الخادم يعمل');
    console.log('   الحالة:', response.status);
    console.log('   البيانات:', response.data);
    
  } catch (error) {
    console.log('❌ الخادم لا يستجيب');
    console.log('   الخطأ:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   السبب: الخادم غير متاح على المنفذ 5000');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   السبب: لا يمكن العثور على الخادم');
    }
  }
}

testServerConnection();