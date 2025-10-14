const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFinalLinking() {
  try {
    console.log('🎯 اختبار نهائي لربط الطالب...\n');
    
    // Register a new parent
    console.log('1️⃣ تسجيل ولي أمر جديد...');
    const registerData = {
      firstName: 'محمد',
      secondName: 'أحمد',
      thirdName: 'علي',
      fourthName: 'حسن',
      email: `parent.final.${Date.now()}@example.com`,
      password: '123456',
      phoneNumber: '01012345678',
      governorate: 'Cairo',
      address: 'شارع التحرير، القاهرة',
      role: 'parent',
      relation: 'Father'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    console.log('✅ تم تسجيل ولي الأمر بنجاح');
    console.log(`🆔 ID ولي الأمر: ${registerResponse.data.data._id}`);
    
    const parentId = registerResponse.data.data._id;
    
    // Login the parent
    console.log('\n2️⃣ تسجيل دخول ولي الأمر...');
    const loginData = {
      userEmail: registerData.email,
      password: registerData.password
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('✅ تم تسجيل الدخول بنجاح');
    
    // Link student with specific ID
    console.log('\n3️⃣ ربط الطالب بالـ ID المحدد...');
    const studentId = '68b654bd37bcf19712729591';
    console.log(`🎯 محاولة ربط الطالب: ${studentId}`);
    
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
    
    // Test fetching children
    console.log('\n4️⃣ اختبار جلب بيانات الأطفال...');
    const childrenResponse = await axios.get(`${BASE_URL}/api/parent/children`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ تم جلب بيانات الأطفال بنجاح');
    console.log(`👥 عدد الأطفال المرتبطين: ${childrenResponse.data.children.length}`);
    
    if (childrenResponse.data.children.length > 0) {
      const child = childrenResponse.data.children[0];
      console.log('📊 بيانات الطفل الأول:');
      console.log(`   📋 الاسم: ${child.firstName} ${child.secondName}`);
      console.log(`   🆔 الـ ID: ${child._id}`);
      console.log(`   📧 البريد: ${child.userEmail}`);
    }
    
    console.log('\n🎉 الاختبار مكتمل بنجاح!');
    console.log('💡 يمكنك الآن استخدام الـ ID في الواجهة الأمامية');
    
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

testFinalLinking();
