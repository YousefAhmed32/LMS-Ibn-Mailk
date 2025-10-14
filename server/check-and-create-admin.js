// Check existing users and create admin if needed
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/');
    console.log('✅ Connected to MongoDB');

    // Check existing users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Role: ${user.role} - ID: ${user._id}`);
    });

    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('\n✅ Admin user already exists:', adminExists.email);
    } else {
      console.log('\n⚠️ No admin user found. Creating admin...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = new User({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phone: '01000000000',
        grade: '12',
        governorate: 'Cairo'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully:', adminUser.email);
    }

    // Check for pending payments
    const Payment = require('./models/Payment');
    const pendingPayments = await Payment.find({ status: 'pending' });
    console.log(`\n💰 Found ${pendingPayments.length} pending payments:`);
    
    pendingPayments.forEach((payment, index) => {
      console.log(`${index + 1}. Payment ID: ${payment._id}`);
      console.log(`   Student Phone: ${payment.studentPhone}`);
      console.log(`   Sender Phone: ${payment.senderPhone}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Created: ${payment.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAndCreateAdmin();
