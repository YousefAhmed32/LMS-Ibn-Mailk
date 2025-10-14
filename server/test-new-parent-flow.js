const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function createNewParentAndTest() {
  try {
    console.log('🎯 إنشاء حساب ولي أمر جديد واختبار الربط...\n');
    
    // Step 1: Register new parent
    console.log('1️⃣ إنشاء حساب ولي أمر جديد...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      firstName: 'أحمد',
      secondName: 'محمد',
      thirdName: 'علي',
      fourthName: 'حسن',
      email: 'parent.final.test@example.com',
      password: '123456',
      phoneNumber: '01234567899',
      role: 'parent',
      relation: 'father'
    });
    
    if (!registerResponse.data.success) {
      console.log('❌ فشل إنشاء الحساب:', registerResponse.data);
      return;
    }
    
    console.log('✅ تم إنشاء الحساب بنجاح');
    console.log('📊 استجابة التسجيل:', JSON.stringify(registerResponse.data, null, 2));
    
    // Step 2: Login with new account
    console.log('\n2️⃣ تسجيل الدخول بالحساب الجديد...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      userEmail: 'parent.final.test@example.com',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ فشل تسجيل الدخول:', loginResponse.data);
      return;
    }
    
    console.log('✅ تم تسجيل الدخول بنجاح');
    const token = loginResponse.data.token;
    const parentId = loginResponse.data.user._id;
    console.log(`👤 ولي الأمر: ${parentId}`);
    
    // Step 3: Test linking with student
    console.log('\n3️⃣ اختبار ربط الطالب...');
    const studentId = '68d4eb443239c048e27a08fd'; // أحمد محمد
    
    const linkResponse = await axios.post(`${BASE_URL}/api/parent/link-student`, {
      studentId: studentId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (linkResponse.data.success) {
      console.log('🎉 تم ربط الطالب بنجاح!');
      console.log('📊 بيانات الطالب المرتبط:');
      console.log(`   📋 الاسم: ${linkResponse.data.student.firstName} ${linkResponse.data.student.secondName}`);
      console.log(`   📧 البريد: ${linkResponse.data.student.userEmail}`);
      console.log(`   🎓 معرف الطالب: ${linkResponse.data.student.studentId}`);
      console.log(`   📊 إحصائيات:`);
      console.log(`      - إجمالي الكورسات: ${linkResponse.data.student.stats.totalCourses}`);
      console.log(`      - الكورسات المكتملة: ${linkResponse.data.student.stats.completedCourses}`);
      console.log(`      - متوسط الدرجات: ${linkResponse.data.student.stats.averageGrade}%`);
      console.log(`      - معدل الحضور: ${linkResponse.data.student.stats.attendanceRate}%`);
    } else {
      console.log('❌ فشل ربط الطالب:', linkResponse.data.message);
    }
    
    // Step 4: Test fetching parent data
    console.log('\n4️⃣ اختبار جلب بيانات ولي الأمر...');
    const parentDataResponse = await axios.get(`${BASE_URL}/api/parent/children`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (parentDataResponse.data.success) {
      console.log('✅ تم جلب بيانات ولي الأمر بنجاح');
      console.log(`👥 عدد الطلاب المرتبطين: ${parentDataResponse.data.children.length}`);
      parentDataResponse.data.children.forEach((child, index) => {
        console.log(`   ${index + 1}. ${child.firstName} ${child.secondName} - ${child.studentId || 'غير محدد'}`);
      });
    } else {
      console.log('❌ فشل جلب بيانات ولي الأمر:', parentDataResponse.data.message);
    }
    
    console.log('\n🎉 تم اختبار النظام بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
  }
}

createNewParentAndTest();
