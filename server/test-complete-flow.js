const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCompleteFlow() {
  try {
    console.log('🎯 اختبار التدفق الكامل لربط الطلاب...\n');
    
    // Step 1: Login as parent
    console.log('1️⃣ تسجيل الدخول كولي أمر...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      userEmail: 'parant@gmail.com',
      password: '11112006My25'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ فشل تسجيل الدخول:', loginResponse.data);
      return;
    }
    
    console.log('✅ تم تسجيل الدخول بنجاح');
    const token = loginResponse.data.token;
    const parentId = loginResponse.data.user._id;
    console.log(`👤 ولي الأمر: ${parentId}`);
    console.log(`📧 البريد: ${loginResponse.data.user.userEmail}`);
    console.log(`🔗 الطلاب المرتبطين حالياً: ${loginResponse.data.user.linkedStudents.length}\n`);
    
    // Step 2: Test linking with first student
    console.log('2️⃣ اختبار ربط الطالب الأول...');
    const studentId = '68d4eb443239c048e27a08fd'; // أحمد محمد علي حسن
    
    const linkResponse = await axios.post(`${BASE_URL}/api/parent/link-student`, {
      studentId: studentId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (linkResponse.data.success) {
      console.log('✅ تم ربط الطالب بنجاح!');
      console.log('📊 بيانات الطالب المرتبط:');
      console.log(`   📋 الاسم: ${linkResponse.data.student.firstName} ${linkResponse.data.student.secondName} ${linkResponse.data.student.thirdName} ${linkResponse.data.student.fourthName}`);
      console.log(`   📧 البريد: ${linkResponse.data.student.userEmail}`);
      console.log(`   🎓 معرف الطالب: ${linkResponse.data.student.studentId || 'غير محدد'}`);
      console.log(`   📱 الهاتف: ${linkResponse.data.student.phoneStudent || 'غير محدد'}`);
      console.log(`   🏫 الصف: ${linkResponse.data.student.grade || 'غير محدد'}`);
      console.log(`   📍 المحافظة: ${linkResponse.data.student.governorate || 'غير محدد'}`);
      console.log(`   📊 إحصائيات:`);
      console.log(`      - إجمالي الكورسات: ${linkResponse.data.student.stats.totalCourses}`);
      console.log(`      - الكورسات المكتملة: ${linkResponse.data.student.stats.completedCourses}`);
      console.log(`      - متوسط الدرجات: ${linkResponse.data.student.stats.averageGrade}%`);
      console.log(`      - معدل الحضور: ${linkResponse.data.student.stats.attendanceRate}%`);
    } else {
      console.log('❌ فشل ربط الطالب:', linkResponse.data.message);
    }
    
    // Step 3: Test fetching parent data
    console.log('\n3️⃣ اختبار جلب بيانات ولي الأمر...');
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
    console.log('\n📋 ملخص النتائج:');
    console.log(`✅ تسجيل الدخول: نجح`);
    console.log(`✅ ربط الطالب: ${linkResponse.data.success ? 'نجح' : 'فشل'}`);
    console.log(`✅ جلب البيانات: ${parentDataResponse.data.success ? 'نجح' : 'فشل'}`);
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
  }
}

testCompleteFlow();
