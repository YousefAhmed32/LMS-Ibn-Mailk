const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testWithExistingParent() {
  try {
    console.log('🎯 اختبار ربط الطلاب مع حساب موجود...\n');
    
    // Use the token from previous successful registration
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ0ZWM0MGQyN2I4ZDk5YmRlZWQ2NzUiLCJpYXQiOjE3NTg3ODQ1NzYsImV4cCI6MTc1OTM4OTM3Nn0.BxZVPjGwgheHSVnjmbL6pY7rqJkUnXp7Cb91lda6jxY';
    const parentId = '68d4ec40d27b8d99bdeed675';
    
    console.log(`👤 ولي الأمر: ${parentId}`);
    console.log(`🔑 Token: ${token.substring(0, 50)}...`);
    
    // Step 1: Test linking with student
    console.log('\n1️⃣ اختبار ربط الطالب...');
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
      console.log(`   📋 الاسم: ${linkResponse.data.student.firstName} ${linkResponse.data.student.secondName} ${linkResponse.data.student.thirdName} ${linkResponse.data.student.fourthName}`);
      console.log(`   📧 البريد: ${linkResponse.data.student.userEmail}`);
      console.log(`   🎓 معرف الطالب: ${linkResponse.data.student.studentId}`);
      console.log(`   📱 الهاتف: ${linkResponse.data.student.phoneStudent}`);
      console.log(`   🏫 الصف: ${linkResponse.data.student.grade}`);
      console.log(`   📍 المحافظة: ${linkResponse.data.student.governorate}`);
      console.log(`   📊 إحصائيات:`);
      console.log(`      - إجمالي الكورسات: ${linkResponse.data.student.stats.totalCourses}`);
      console.log(`      - الكورسات المكتملة: ${linkResponse.data.student.stats.completedCourses}`);
      console.log(`      - متوسط الدرجات: ${linkResponse.data.student.stats.averageGrade}%`);
      console.log(`      - معدل الحضور: ${linkResponse.data.student.stats.attendanceRate}%`);
    } else {
      console.log('❌ فشل ربط الطالب:', linkResponse.data.message);
    }
    
    // Step 2: Test fetching parent data
    console.log('\n2️⃣ اختبار جلب بيانات ولي الأمر...');
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
    
    // Step 3: Test linking with second student
    console.log('\n3️⃣ اختبار ربط طالب ثاني...');
    const secondStudentId = '68d4eb443239c048e27a08fe'; // فاطمة أحمد
    
    const secondLinkResponse = await axios.post(`${BASE_URL}/api/parent/link-student`, {
      studentId: secondStudentId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (secondLinkResponse.data.success) {
      console.log('✅ تم ربط الطالب الثاني بنجاح!');
      console.log(`📋 الاسم: ${secondLinkResponse.data.student.firstName} ${secondLinkResponse.data.student.secondName}`);
    } else {
      console.log('❌ فشل ربط الطالب الثاني:', secondLinkResponse.data.message);
    }
    
    console.log('\n🎉 تم اختبار النظام بنجاح!');
    console.log('\n📋 ملخص النتائج:');
    console.log(`✅ ربط الطالب الأول: ${linkResponse.data.success ? 'نجح' : 'فشل'}`);
    console.log(`✅ جلب البيانات: ${parentDataResponse.data.success ? 'نجح' : 'فشل'}`);
    console.log(`✅ ربط الطالب الثاني: ${secondLinkResponse.data.success ? 'نجح' : 'فشل'}`);
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
  }
}

testWithExistingParent();
