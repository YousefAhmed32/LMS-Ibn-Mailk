const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Adjust path as needed
const Course = require('../models/Course');

// Test data
const testGoogleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeQHFgGW2jb2NOXEFiHUZVwlFHHe8Gyv4yuNLOfOAhOO7VvBA/viewform?usp=sharing&ouid=100899115287218413340';

const validExamLinks = [
  {
    id: 'exam_1',
    title: 'امتحان 1',
    url: testGoogleFormUrl,
    type: 'google_form'
  },
  {
    id: 'exam_2', 
    title: 'امتحان 2',
    url: 'https://forms.gle/abc123',
    type: 'google_form'
  }
];

const invalidExamLinks = [
  {
    id: 'exam_invalid',
    title: 'Invalid Exam',
    url: 'not-a-valid-url',
    type: 'google_form'
  }
];

describe('Exam Links API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lms_test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await Course.deleteMany({});
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Course.deleteMany({});
  });

  describe('POST /api/admin/courses', () => {
    it('should accept valid exam links array', async () => {
      const courseData = {
        title: 'Test Course with Exams',
        description: 'A test course',
        subject: 'رياضيات',
        grade: '10',
        price: 100,
        duration: 60,
        exams: validExamLinks
      };

      const response = await request(app)
        .post('/api/admin/courses')
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.exams).toHaveLength(2);
      expect(response.body.data.exams[0].url).toBe(testGoogleFormUrl);
    });

    it('should reject invalid exam links', async () => {
      const courseData = {
        title: 'Test Course with Invalid Exams',
        description: 'A test course',
        subject: 'رياضيات',
        grade: '10',
        price: 100,
        duration: 60,
        exams: invalidExamLinks
      };

      const response = await request(app)
        .post('/api/admin/courses')
        .send(courseData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Exam URL must be a valid URL');
    });

    it('should handle empty exams array', async () => {
      const courseData = {
        title: 'Test Course without Exams',
        description: 'A test course',
        subject: 'رياضيات',
        grade: '10',
        price: 100,
        duration: 60,
        exams: []
      };

      const response = await request(app)
        .post('/api/admin/courses')
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.exams).toHaveLength(0);
    });
  });

  describe('GET /api/courses/:id/content', () => {
    it('should return exam links in course content', async () => {
      // First create a course with exams
      const course = new Course({
        title: 'Test Course',
        description: 'A test course',
        subject: 'رياضيات',
        grade: '10',
        price: 100,
        duration: 60,
        exams: validExamLinks
      });
      await course.save();

      const response = await request(app)
        .get(`/api/courses/${course._id}/content`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course.exams).toHaveLength(2);
      expect(response.body.data.course.exams[0].url).toBe(testGoogleFormUrl);
    });
  });
});

// URL validation tests
describe('URL Validation', () => {
  const isValidExternalUrl = (value) => {
    if (!value) return false;
    try {
      const url = new URL(value.trim());
      return ['http:', 'https:'].includes(url.protocol);
    } catch (err) {
      return false;
    }
  };

  it('should validate the provided Google Forms link', () => {
    expect(isValidExternalUrl(testGoogleFormUrl)).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidExternalUrl('not-a-url')).toBe(false);
    expect(isValidExternalUrl('ftp://example.com')).toBe(false);
    expect(isValidExternalUrl('javascript:alert("xss")')).toBe(false);
  });
});
