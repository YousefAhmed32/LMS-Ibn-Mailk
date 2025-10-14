// Comprehensive Login Tests
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const app = require('../server'); // Assuming server exports app

describe('Login System Tests', () => {
  let testUsers = {};

  beforeAll(async () => {
    // Connect to test database
    const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/';
    await mongoose.connect(MONGO_URL);

    // Create test users
    const adminUser = new User({
      firstName: 'Test',
      secondName: 'Admin',
      thirdName: 'User',
      fourthName: 'System',
      userEmail: 'test-admin@example.com',
      password: 'testadmin123',
      role: 'admin',
      phoneStudent: '01000000000',
      phoneFather: '01000000001',
      phoneMother: '01000000002',
      governorate: 'Cairo',
      grade: 'تالتة ثانوي'
    });

    const studentUser = new User({
      firstName: 'Test',
      secondName: 'Student',
      thirdName: 'User',
      fourthName: 'Demo',
      userEmail: 'test-student@example.com',
      password: 'teststudent123',
      role: 'student',
      phoneStudent: '01111111111',
      phoneFather: '01111111112',
      phoneMother: '01111111113',
      governorate: 'Giza',
      grade: 'أولى ثانوي'
    });

    await adminUser.save();
    await studentUser.save();

    testUsers.admin = adminUser;
    testUsers.student = studentUser;
  });

  afterAll(async () => {
    // Clean up test users
    await User.deleteMany({ 
      userEmail: { $in: ['test-admin@example.com', 'test-student@example.com'] } 
    });
    await mongoose.disconnect();
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with valid admin credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'test-admin@example.com',
          password: 'testadmin123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('userEmail', 'test-admin@example.com');
      expect(response.body.user).toHaveProperty('role', 'admin');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should login successfully with valid student credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'test-student@example.com',
          password: 'teststudent123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('role', 'student');
    });

    test('should handle case-insensitive email login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'TEST-ADMIN@EXAMPLE.COM',
          password: 'testadmin123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should trim whitespace from email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: '  test-admin@example.com  ',
          password: 'testadmin123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should reject login with incorrect email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'nonexistent@example.com',
          password: 'testadmin123'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'test-admin@example.com',
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'testadmin123'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    test('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'test-admin@example.com'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    test('should reject login with wrong field name (email instead of userEmail)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-admin@example.com', // Wrong field name
          password: 'testadmin123'
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should handle deactivated user account', async () => {
      // Deactivate user
      await User.findOneAndUpdate(
        { userEmail: 'test-student@example.com' },
        { isActive: false }
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'test-student@example.com',
          password: 'teststudent123'
        })
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Account is deactivated');

      // Reactivate user for other tests
      await User.findOneAndUpdate(
        { userEmail: 'test-student@example.com' },
        { isActive: true }
      );
    });
  });

  describe('Password Security Tests', () => {
    test('should have properly hashed passwords in database', async () => {
      const user = await User.findOne({ userEmail: 'test-admin@example.com' });
      
      expect(user.password).toMatch(/^\$2[aby]?\$\d+\$/); // bcrypt hash format
      expect(user.password.length).toBeGreaterThan(50);
      
      // Verify password can be compared
      const isValid = await bcrypt.compare('testadmin123', user.password);
      expect(isValid).toBe(true);
    });

    test('should not store plain text passwords', async () => {
      const user = await User.findOne({ userEmail: 'test-admin@example.com' });
      
      expect(user.password).not.toBe('testadmin123');
      expect(user.password).not.toContain('testadmin123');
    });
  });
});
