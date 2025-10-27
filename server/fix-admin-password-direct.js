const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdminPasswordDirect() {
  try {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    // Hash the password with the same salt rounds as the model (12)
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 New hashed password created with salt rounds 12');
    
    // Update the password directly in the database to bypass pre-save hook
    await User.updateOne(
      { email: 'admin@example.com' },
      { password: hashedPassword }
    );
    
    console.log('✅ Admin password updated successfully');
    
    // Verify the password works
    const updatedUser = await User.findOne({ email: 'admin@example.com' });
    const isPasswordValid = await bcrypt.compare('admin123', updatedUser.password);
    console.log('✅ Password verification test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

fixAdminPasswordDirect();
