// Complete Login Fix - Root Cause Analysis and Solution
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');

// Fix 1: Ensure correct database connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/';

async function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...');
  
  try {
    // Connect to correct database
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB Atlas');

    // Create test users if they don't exist
    const existingAdmin = await User.findOne({ userEmail: 'admin@test.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        firstName: 'Admin',
        secondName: 'Test',
        thirdName: 'User',
        fourthName: 'System',
        userEmail: 'admin@test.com',
        password: 'admin123', // Will be hashed by pre-save middleware
        role: 'admin',
        phoneStudent: '01000000000',
        phoneFather: '01000000001',
        phoneMother: '01000000002',
        governorate: 'Cairo',
        grade: 'تالتة ثانوي'
      });
      await adminUser.save();
      console.log('✅ Test admin user created');
    } else {
      console.log('✅ Test admin user already exists');
    }

    await mongoose.disconnect();
    console.log('✅ Test environment setup complete');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

// Fix 2: Create a minimal test server
function createTestServer() {
  const app = express();
  
  // Middleware
  app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }));
  app.use(express.json());

  // Connect to database
  mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message));

  // Fixed login endpoint
  app.post('/api/auth/login', async (req, res) => {
    const startTime = Date.now();
    
    try {
      console.log('🔐 Login attempt:', {
        timestamp: new Date().toISOString(),
        body: {
          userEmail: req.body.userEmail ? req.body.userEmail.substring(0, 3) + '***' : 'missing',
          password: req.body.password ? '[PROVIDED]' : '[MISSING]'
        }
      });

      const { userEmail, password } = req.body;

      // Validate input
      if (!userEmail || !password) {
        console.log('❌ Missing credentials');
        return res.status(400).json({
          success: false,
          error: "Email and password are required"
        });
      }

      // Find user by email (case-insensitive and trimmed)
      const normalizedEmail = userEmail.toLowerCase().trim();
      console.log('🔍 Searching for user:', normalizedEmail);
      
      const user = await User.findOne({ 
        userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
      });
      
      if (!user) {
        console.log('❌ User not found:', normalizedEmail);
        return res.status(401).json({
          success: false,
          error: "Invalid credentials"
        });
      }

      console.log('✅ User found:', {
        id: user._id,
        email: user.userEmail,
        role: user.role,
        hasPassword: !!user.password
      });

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for:', normalizedEmail);
        return res.status(401).json({
          success: false,
          error: "Invalid credentials"
        });
      }

      console.log('✅ Password valid');

      // Check if user is active
      if (user.isActive === false) {
        console.log('❌ User account is deactivated:', normalizedEmail);
        return res.status(403).json({
          success: false,
          error: "Account is deactivated"
        });
      }

      // Generate token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production', 
        { expiresIn: '7d' }
      );

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      const duration = Date.now() - startTime;
      console.log('🎉 Login successful:', {
        userId: user._id,
        email: user.userEmail,
        role: user.role,
        duration: `${duration}ms`
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: userResponse
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('💥 Login error:', {
        error: error.message,
        duration: `${duration}ms`
      });
      
      return res.status(500).json({
        success: false,
        error: "Internal server error during login"
      });
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: "OK", 
      message: "Server is running",
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

// Main execution
async function main() {
  console.log('🚀 Starting Login Fix Server...\n');
  
  // Setup test environment
  await setupTestEnvironment();
  
  // Create and start server
  const app = createTestServer();
  const PORT = 5000;
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Fixed Login Server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Login endpoint: http://localhost:${PORT}/api/auth/login`);
    console.log('\n✅ Ready for testing!');
    console.log('Test credentials: admin@test.com / admin123');
  });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔌 Shutting down server...');
  await mongoose.disconnect();
  process.exit(0);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createTestServer, setupTestEnvironment };
