/**
 * Integration Tests for YouTube Video Controller
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Course = require('../models/Course');
const User = require('../models/User');

// Test data
const testUser = {
  firstName: 'Test',
  secondName: 'Admin',
  thirdName: 'User',
  fourthName: 'Name',
  userEmail: 'test@example.com',
  password: 'password123',
  role: 'admin',
  phoneStudent: '01234567890',
  governorate: 'Cairo',
  grade: 'grade12'
};

const testCourse = {
  title: 'Test Course',
  description: 'Test course description',
  grade: '12',
  subject: 'Mathematics',
  price: 100,
  level: 'beginner',
  duration: 10
};

const testVideoInput = {
  inputType: 'url',
  input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  title: 'Test Video',
  enableJsApi: false
};

describe('YouTube Video Controller Integration Tests', () => {
  let authToken;
  let userId;
  let courseId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms-test');
    
    // Create test user
    const user = new User(testUser);
    await user.save();
    userId = user._id;
    
    // Get auth token (simplified for testing)
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        userEmail: testUser.userEmail,
        password: testUser.password
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Course.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up courses before each test
    await Course.deleteMany({});
  });

  describe('POST /api/youtube/courses', () => {
    test('should create course with YouTube videos', async () => {
      const courseData = {
        ...testCourse,
        videos: [testVideoInput]
      };

      const response = await request(app)
        .post('/api/youtube/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.course).toBeDefined();
      expect(response.body.data.videosProcessed).toBe(1);
      
      const course = response.body.data.course;
      expect(course.videos).toHaveLength(1);
      expect(course.videos[0].provider).toBe('youtube');
      expect(course.videos[0].videoId).toBe('dQw4w9WgXcQ');
      expect(course.videos[0].embedSrc).toContain('dQw4w9WgXcQ');
      expect(course.videos[0].embedSrc).toContain('controls=1');
      expect(course.videos[0].embedSrc).toContain('rel=0');
      
      courseId = course._id;
    });

    test('should create course with iframe video', async () => {
      const iframeVideoInput = {
        inputType: 'iframe',
        input: '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" width="560" height="315"></iframe>',
        title: 'Iframe Video'
      };

      const courseData = {
        ...testCourse,
        videos: [iframeVideoInput]
      };

      const response = await request(app)
        .post('/api/youtube/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.course.videos).toHaveLength(1);
      expect(response.body.data.course.videos[0].rawInputType).toBe('iframe');
    });

    test('should reject invalid YouTube URL', async () => {
      const invalidVideoInput = {
        inputType: 'url',
        input: 'https://example.com/video',
        title: 'Invalid Video'
      };

      const courseData = {
        ...testCourse,
        videos: [invalidVideoInput]
      };

      const response = await request(app)
        .post('/api/youtube/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Video processing failed');
    });

    test('should reject disallowed iframe domain', async () => {
      const maliciousVideoInput = {
        inputType: 'iframe',
        input: '<iframe src="https://malicious-site.com/embed/video"></iframe>',
        title: 'Malicious Video'
      };

      const courseData = {
        ...testCourse,
        videos: [maliciousVideoInput]
      };

      const response = await request(app)
        .post('/api/youtube/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Video processing failed');
    });

    test('should require authentication', async () => {
      const courseData = {
        ...testCourse,
        videos: [testVideoInput]
      };

      const response = await request(app)
        .post('/api/youtube/courses')
        .send(courseData);

      expect(response.status).toBe(401);
    });

    test('should require admin role', async () => {
      // Create regular user
      const regularUser = new User({
        ...testUser,
        userEmail: 'regular@example.com',
        role: 'student'
      });
      await regularUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          userEmail: 'regular@example.com',
          password: testUser.password
        });

      const regularToken = loginResponse.body.token;

      const courseData = {
        ...testCourse,
        videos: [testVideoInput]
      };

      const response = await request(app)
        .post('/api/youtube/courses')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(courseData);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/youtube/courses/:id', () => {
    beforeEach(async () => {
      // Create a test course
      const course = new Course({
        ...testCourse,
        createdBy: userId,
        videos: [{
          provider: 'youtube',
          videoId: 'dQw4w9WgXcQ',
          embedSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&rel=0',
          title: 'Original Video',
          rawInputType: 'url'
        }]
      });
      await course.save();
      courseId = course._id;
    });

    test('should update course with new videos', async () => {
      const newVideoInput = {
        inputType: 'url',
        input: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        title: 'New Video'
      };

      const updateData = {
        title: 'Updated Course',
        videos: [newVideoInput]
      };

      const response = await request(app)
        .put(`/api/youtube/courses/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.course.title).toBe('Updated Course');
      expect(response.body.data.course.videos).toHaveLength(1);
      expect(response.body.data.course.videos[0].videoId).toBe('9bZkp7q19f0');
    });

    test('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated Course'
      };

      const response = await request(app)
        .put(`/api/youtube/courses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Course not found');
    });
  });

  describe('POST /api/youtube/preview', () => {
    test('should preview valid YouTube URL', async () => {
      const response = await request(app)
        .post('/api/youtube/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testVideoInput);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.video).toBeDefined();
      expect(response.body.data.video.videoId).toBe('dQw4w9WgXcQ');
      expect(response.body.data.video.embedSrc).toContain('dQw4w9WgXcQ');
    });

    test('should preview valid iframe', async () => {
      const iframeInput = {
        inputType: 'iframe',
        input: '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>',
        title: 'Test Video'
      };

      const response = await request(app)
        .post('/api/youtube/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send(iframeInput);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.video.videoId).toBe('dQw4w9WgXcQ');
    });

    test('should reject invalid input', async () => {
      const invalidInput = {
        inputType: 'url',
        input: 'invalid-url'
      };

      const response = await request(app)
        .post('/api/youtube/preview')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidInput);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Video processing failed');
    });
  });

  describe('POST /api/youtube/courses/:id/videos', () => {
    beforeEach(async () => {
      const course = new Course({
        ...testCourse,
        createdBy: userId,
        videos: []
      });
      await course.save();
      courseId = course._id;
    });

    test('should add video to existing course', async () => {
      const response = await request(app)
        .post(`/api/youtube/courses/${courseId}/videos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(testVideoInput);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.video).toBeDefined();
      expect(response.body.data.totalVideos).toBe(1);
    });
  });

  describe('DELETE /api/youtube/courses/:id/videos/:videoId', () => {
    let videoId;

    beforeEach(async () => {
      const course = new Course({
        ...testCourse,
        createdBy: userId,
        videos: [{
          provider: 'youtube',
          videoId: 'dQw4w9WgXcQ',
          embedSrc: 'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&rel=0',
          title: 'Test Video',
          rawInputType: 'url'
        }]
      });
      await course.save();
      courseId = course._id;
      videoId = course.videos[0]._id;
    });

    test('should remove video from course', async () => {
      const response = await request(app)
        .delete(`/api/youtube/courses/${courseId}/videos/${videoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalVideos).toBe(0);
    });

    test('should return 404 for non-existent video', async () => {
      const fakeVideoId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/youtube/courses/${courseId}/videos/${fakeVideoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Video not found in course');
    });
  });
});
