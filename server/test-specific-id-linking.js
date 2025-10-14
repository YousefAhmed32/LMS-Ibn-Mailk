const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testLinkingWithSpecificId() {
  try {
    console.log('🧪 اختبار ربط الطالب بالـ ID المحدد...\n');
    
    // First, register a new parent
    console.log('1️⃣ تسجيل ولي أمر جديد...');
    const registerData = {
      firstName: 'محمد',
      secondName: 'أحمد',
      thirdName: 'علي',
      fourthName: 'حسن',
      email: `parent.${Date.now()}@example.com`,
      password: '123456',
      phoneNumber: '01012345678',
      governorate: 'Cairo',
      address: 'شارع التحرير، القاهرة',
      role: 'parent',
      relation: 'Father'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    console.log('✅ تم تسجيل ولي الأمر بنجاح');
    console.log('📋 استجابة التسجيل:', JSON.stringify(registerResponse.data, null, 2));
    
    const parentId = registerResponse.data.data._id;
    
    // Login the parent
    console.log('\n2️⃣ تسجيل دخول ولي الأمر...');
    const loginData = {
      userEmail: registerData.email,
      password: registerData.password
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log(`🔑 التوكن: ${loginResponse.data.token.substring(0, 20)}...`);
    
    // Link student with specific ID
    console.log('\n3️⃣ ربط الطالب بالـ ID المحدد...');
    const studentId = '68b654bd37bcf19712729591';
    console.log(`🎯 محاولة ربط الطالب: ${studentId}`);
    
    const linkData = {
      parentId: parentId,
      studentId: studentId
    };
    
    const linkResponse = await axios.post(`${BASE_URL}/api/parent/link-student`, linkData, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('✅ تم ربط الطالب بنجاح!');
    console.log('📊 بيانات الطالب المرتبط:');
    console.log(`   📋 الاسم: ${linkResponse.data.student.firstName} ${linkResponse.data.student.secondName}`);
    console.log(`   📧 البريد: ${linkResponse.data.student.userEmail}`);
    console.log(`   🎓 معرف الطالب: ${linkResponse.data.student.studentId}`);
    console.log(`   📱 الهاتف: ${linkResponse.data.student.phoneStudent}`);
    console.log(`   🏫 الصف: ${linkResponse.data.student.grade}`);
    console.log(`   📍 المحافظة: ${linkResponse.data.student.governorate}`);
    
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
    
    if (error.response?.status === 400) {
      console.log('💡 السبب المحتمل: بيانات غير صحيحة');
    } else if (error.response?.status === 404) {
      console.log('💡 السبب المحتمل: الطالب غير موجود');
    } else if (error.response?.status === 500) {
      console.log('💡 السبب المحتمل: خطأ في السيرفر');
    }
  }
}

testLinkingWithSpecificId();
