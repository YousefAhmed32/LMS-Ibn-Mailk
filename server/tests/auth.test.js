const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('../server'); // Assuming your server exports the app
const User = require('../models/User');

// Mock data
const testUser = {
  firstName: 'Test',
  secondName: 'User',
  thirdName: 'Auth',
  fourthName: 'Test',
  userEmail: 'authtest@example.com',
  password: 'testpassword123',
  role: 'student',
  phoneStudent: '01234567890',
  governorate: 'Cairo',
  grade: 'grade10'
};

describe('Authentication Endpoints', () => {
  let userId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn-test');
    }
  });

  beforeEach(async () => {
    // Clean up test user
    await User.deleteOne({ userEmail: testUser.userEmail });
    
    // Create test user with hashed password
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    const user = new User({
      ...testUser,
      password: hashedPassword
    });
    const savedUser = await user.save();
    userId = savedUser._id;
  });

  afterEach(async () => {
    // Clean up test user
    await User.deleteOne({ userEmail: testUser.userEmail });
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: testUser.userEmail,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('userEmail', testUser.userEmail);
      expect(response.body.user).toHaveProperty('role', testUser.role);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject login with incorrect email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'wrong@example.com',
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: testUser.userEmail,
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Email and password are required');
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: testUser.userEmail
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Email and password are required');
    });

    it('should reject login with wrong field names', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.userEmail, // Wrong field name
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject login with empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"userEmail": "test@example.com", "password": }') // Malformed JSON
        .expect(400);

      // Should handle JSON parsing error gracefully
    });

    it('should return valid JWT token structure', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: testUser.userEmail,
          password: testUser.password
        })
        .expect(200);

      const token = response.body.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // JWT should have 3 parts separated by dots
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
      
      // Decode payload to verify structure
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('exp');
      expect(payload.userId).toBe(userId.toString());
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: testUser.userEmail,
          password: testUser.password
        });
      authToken = loginResponse.body.token;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('userEmail', testUser.userEmail);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

module.exports = {
  testUser,
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll
};



