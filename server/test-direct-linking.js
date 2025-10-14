const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDirectLinking() {
  try {
    console.log('🧪 اختبار مباشر لربط الطالب...\n');
    
    // Use existing parent and student IDs
    const parentId = '68d4f84fd27b8d99bdeed68f'; // From previous test
    const studentId = '68b654bd37bcf19712729591'; // The specific ID
    
    console.log(`👨‍👩‍👧‍👦 ولي الأمر: ${parentId}`);
    console.log(`🎓 الطالب: ${studentId}`);
    
    // First, let's login to get a token
    console.log('\n1️⃣ تسجيل دخول...');
    const loginData = {
      userEmail: 'parent.1758787663519@example.com',
      password: '123456'
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('✅ تم تسجيل الدخول بنجاح');
    
    // Test the link-student endpoint directly
    console.log('\n2️⃣ اختبار ربط الطالب...');
    const linkData = {
      parentId: parentId,
      studentId: studentId
    };
    
    console.log('📤 البيانات المرسلة:', JSON.stringify(linkData, null, 2));
    
    const linkResponse = await axios.post(`${BASE_URL}/api/parent/link-student`, linkData, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ تم ربط الطالب بنجاح!');
    console.log('📋 استجابة الربط:', JSON.stringify(linkResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.log('📋 تفاصيل الخطأ:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status) {
      console.log(`📊 رمز الحالة: ${error.response.status}`);
    }
  }
}

testDirectLinking();
