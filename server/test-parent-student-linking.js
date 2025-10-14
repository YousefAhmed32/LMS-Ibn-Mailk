const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testParentStudentLinking() {
  try {
    console.log('🧪 اختبار نظام ربط الطلاب بأولياء الأمور...\n');
    
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
    console.log(`👤 ولي الأمر: ${parentId}\n`);
    
    // Step 2: Test linking with first student
    console.log('2️⃣ اختبار ربط الطالب الأول...');
    const studentId = '68c64a34caaef1aa3f234366'; // Test Student
    
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
        console.log(`   ${index + 1}. ${child.firstName} ${child.secondName} - ${child.studentId}`);
      });
    } else {
      console.log('❌ فشل جلب بيانات ولي الأمر:', parentDataResponse.data.message);
    }
    
    // Step 4: Test linking with second student
    console.log('\n4️⃣ اختبار ربط طالب ثاني...');
    const secondStudentId = '68c6552ea3d116f70a381f47'; // Student User
    
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
    
    // Step 5: Test error cases
    console.log('\n5️⃣ اختبار الحالات الخطأ...');
    
    // Test invalid ObjectId
    try {
      await axios.post(`${BASE_URL}/api/parent/link-student`, {
        studentId: 'invalid-id'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ تم رفض المعرف غير الصحيح بنجاح');
      }
    }
    
    // Test non-existent student
    try {
      await axios.post(`${BASE_URL}/api/parent/link-student`, {
        studentId: '507f1f77bcf86cd799439999'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ تم رفض الطالب غير الموجود بنجاح');
      }
    }
    
    console.log('\n🎉 تم اختبار النظام بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
  }
}

testParentStudentLinking();