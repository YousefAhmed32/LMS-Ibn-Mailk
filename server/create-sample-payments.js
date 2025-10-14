/**
 * Script to create sample payments for testing admin dashboard
 */

const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');
const Course = require('./models/Course');

async function createSamplePayments() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/test');
    console.log('✅ Connected to MongoDB');

    // Check if we have any courses
    const courses = await Course.find().limit(3);
    if (courses.length === 0) {
      console.log('❌ No courses found. Please create courses first.');
      return;
    }

    // Check if we have any users
    const users = await User.find().limit(3);
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    // Check existing payments
    const existingPayments = await Payment.countDocuments();
    console.log(`📊 Existing payments: ${existingPayments}`);

    if (existingPayments > 0) {
      console.log('✅ Payments already exist. No need to create sample data.');
      
      // Show existing payments
      const payments = await Payment.find()
        .populate('studentId', 'firstName secondName userEmail')
        .populate('courseId', 'title price')
        .limit(5);
      
      console.log('📋 Sample existing payments:');
      payments.forEach((payment, index) => {
        console.log(`${index + 1}. ${payment.studentName || 'Unknown'} - ${payment.courseId?.title || 'Unknown Course'} - ${payment.status} - ${payment.amount} EGP`);
      });
      
      return;
    }

    // Create sample payments
    const samplePayments = [
      {
        studentId: users[0]._id,
        studentName: 'أحمد محمد علي',
        studentPhone: '01012345678',
        courseId: courses[0]._id,
        amount: courses[0].price,
        transactionId: 'TXN001',
        screenshot: 'https://example.com/screenshot1.jpg',
        status: 'pending',
        paymentMethod: 'vodafone_cash',
        currency: 'EGP'
      },
      {
        studentId: users[1] ? users[1]._id : users[0]._id,
        studentName: 'فاطمة أحمد حسن',
        studentPhone: '01087654321',
        courseId: courses[1] ? courses[1]._id : courses[0]._id,
        amount: courses[1] ? courses[1].price : courses[0].price,
        transactionId: 'TXN002',
        screenshot: 'https://example.com/screenshot2.jpg',
        status: 'accepted',
        paymentMethod: 'vodafone_cash',
        currency: 'EGP',
        acceptedAt: new Date(),
        acceptedBy: users[0]._id
      },
      {
        studentId: users[2] ? users[2]._id : users[0]._id,
        studentName: 'محمد علي أحمد',
        studentPhone: '01011223344',
        courseId: courses[2] ? courses[2]._id : courses[0]._id,
        amount: courses[2] ? courses[2].price : courses[0].price,
        transactionId: 'TXN003',
        screenshot: 'https://example.com/screenshot3.jpg',
        status: 'rejected',
        paymentMethod: 'vodafone_cash',
        currency: 'EGP',
        rejectedAt: new Date(),
        rejectedBy: users[0]._id,
        rejectionReason: 'Invalid payment proof'
      }
    ];

    // Insert sample payments
    const createdPayments = await Payment.insertMany(samplePayments);
    console.log(`✅ Created ${createdPayments.length} sample payments`);

    // Show created payments
    console.log('📋 Created payments:');
    createdPayments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.studentName} - ${payment.status} - ${payment.amount} EGP`);
    });

  } catch (error) {
    console.error('❌ Error creating sample payments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createSamplePayments().catch(console.error);
}

module.exports = { createSamplePayments };
