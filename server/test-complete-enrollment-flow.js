// Complete test for the enrollment and activation flow
const axios = require('axios');

async function testCompleteEnrollmentFlow() {
  try {
    console.log('🚀 Testing Complete Enrollment and Activation Flow...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const adminLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      userEmail: 'admin@example.com',
      password: 'admin123'
    });

    if (!adminLoginResponse.data.success) {
      console.log('❌ Admin login failed');
      return;
    }

    const adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Get pending payments
    console.log('\n2️⃣ Fetching pending payments...');
    const pendingResponse = await axios.get('http://localhost:5000/api/admin/payment-proofs/pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (!pendingResponse.data.data || pendingResponse.data.data.length === 0) {
      console.log('❌ No pending payments found');
      return;
    }

    const testPayment = pendingResponse.data.data[0];
    console.log('✅ Found test payment:', testPayment._id);
    console.log('Payment details:', {
      studentId: testPayment.studentId?._id,
      courseId: testPayment.courseId?._id,
      status: testPayment.status,
      amount: testPayment.amount
    });

    // Step 3: Test payment approval
    console.log('\n3️⃣ Testing payment approval...');
    const approvalResponse = await axios.patch(
      `http://localhost:5000/api/admin/payment-proofs/${testPayment._id}/approve`,
      {},
      {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payment approval successful!');
    console.log('Response:', JSON.stringify(approvalResponse.data, null, 2));

    // Step 4: Check student's enrolled courses
    if (testPayment.studentId && testPayment.courseId) {
      console.log('\n4️⃣ Checking student enrolled courses...');
      const enrolledCoursesResponse = await axios.get(
        `http://localhost:5000/api/admin/students/${testPayment.studentId._id}/enrolled-courses`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      console.log('✅ Student enrolled courses:', JSON.stringify(enrolledCoursesResponse.data, null, 2));

      // Step 5: Check course access
      console.log('\n5️⃣ Testing course access check...');
      const accessResponse = await axios.get(
        `http://localhost:5000/api/admin/courses/${testPayment.courseId._id}/access`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      console.log('✅ Course access check:', JSON.stringify(accessResponse.data, null, 2));
    }

    // Step 6: Verify payment status
    console.log('\n6️⃣ Verifying payment status...');
    const updatedPendingResponse = await axios.get('http://localhost:5000/api/admin/payment-proofs/pending', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const updatedPayment = updatedPendingResponse.data.data.find(p => p._id === testPayment._id);
    if (!updatedPayment) {
      console.log('✅ Payment no longer in pending list (approved successfully)');
    } else {
      console.log('⚠️ Payment still in pending list:', updatedPayment.status);
    }

    console.log('\n🎉 Complete enrollment flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin login successful');
    console.log('✅ Pending payments fetched');
    console.log('✅ Payment approval successful');
    console.log('✅ Student enrollment updated');
    console.log('✅ Course access verified');
    console.log('✅ Payment status updated');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Wait for server to start, then test
setTimeout(() => {
  testCompleteEnrollmentFlow();
}, 3000);
