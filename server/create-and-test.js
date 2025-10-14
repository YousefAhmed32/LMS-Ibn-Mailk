const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function createAndTest() {
  try {
    console.log('🎯 إنشاء واختبار جديد...\n');
    
    // Create new parent
    const timestamp = Date.now();
    const registerData = {
      firstName: 'محمد',
      secondName: 'أحمد',
      thirdName: 'علي',
      fourthName: 'حسن',
      email: `parent.test.${timestamp}@example.com`,
      password: '123456',
      phoneNumber: '01012345678',
      governorate: 'Cairo',
      address: 'شارع التحرير، القاهرة',
      role: 'parent',
      relation: 'Father'
    };
    
    console.log('1️⃣ تسجيل ولي أمر جديد...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    console.log('✅ تم تسجيل ولي الأمر');
    console.log(`📧 البريد: ${registerData.email}`);
    console.log(`🆔 ID: ${registerResponse.data.data._id}`);
    
    const parentId = registerResponse.data.data._id;
    
    // Login
    console.log('\n2️⃣ تسجيل دخول...');
    const loginData = {
      userEmail: registerData.email,
      password: registerData.password
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('✅ تم تسجيل الدخول');
    
    // Test link
    console.log('\n3️⃣ ربط الطالب...');
    const studentId = '68b654bd37bcf19712729591';
    const linkData = {
      parentId: parentId,
      studentId: studentId
    };
    
    console.log(`🎯 محاولة ربط الطالب: ${studentId}`);
    
    const linkResponse = await axios.post(`${BASE_URL}/api/parent/link-student`, linkData, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ تم ربط الطالب بنجاح!');
    console.log('📋 الاستجابة:', JSON.stringify(linkResponse.data, null, 2));
    
    // Test children endpoint
    console.log('\n4️⃣ اختبار جلب الأطفال...');
    const childrenResponse = await axios.get(`${BASE_URL}/api/parent/children`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ تم جلب الأطفال');
    console.log(`👥 عدد الأطفال: ${childrenResponse.data.children.length}`);
    
    if (childrenResponse.data.children.length > 0) {
      const child = childrenResponse.data.children[0];
      console.log(`📋 الطفل: ${child.firstName} ${child.secondName} (${child._id})`);
    }
    
    console.log('\n🎉 النجاح! يمكنك الآن استخدام الـ ID في الواجهة الأمامية');
    
  } catch (error) {
    console.error('❌ خطأ:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.log('📋 تفاصيل:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.status) {
      console.log(`📊 رمز الحالة: ${error.response.status}`);
    }
  }
}

createAndTest();
