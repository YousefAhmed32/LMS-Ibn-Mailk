const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

const addSampleCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('Connected to MongoDB');

    // Find an admin user to be the creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      const newAdmin = new User({
        firstName: 'Admin',
        secondName: 'User',
        userEmail: 'admin@lms.com',
        password: 'admin123', // This will be hashed by the pre-save middleware
        role: 'admin',
        phoneStudent: '01234567890',
        governorate: 'القاهرة',
        grade: '12'
      });
      await newAdmin.save();
      console.log('Admin user created');
    }

    const creator = await User.findOne({ role: 'admin' });

    // Sample courses data
    const sampleCourses = [
      {
        title: 'الرياضيات للصف التاسع',
        description: 'دورة شاملة في الرياضيات للصف التاسع تغطي جميع الموضوعات المطلوبة',
        subject: 'رياضيات',
        grade: '9',
        price: 500,
        thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
        videos: [
          {
            title: 'مقدمة في الجبر',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            duration: 15.5
          },
          {
            title: 'المعادلات الخطية',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
            duration: 20.75
          }
        ],
        quizzes: [
          {
            question: 'ما هو حل المعادلة 2x + 5 = 15؟',
            options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 3'],
            correctAnswer: 0
          }
        ],
        createdBy: creator._id,
        isActive: true
      },
      {
        title: 'العلوم للصف العاشر',
        description: 'دورة في العلوم الطبيعية للصف العاشر تشمل الفيزياء والكيمياء والأحياء',
        subject: 'علوم',
        grade: '10',
        price: 600,
        thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
        videos: [
          {
            title: 'مقدمة في الفيزياء',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            duration: 18.33
          },
          {
            title: 'قوانين نيوتن',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
            duration: 25.17
          }
        ],
        quizzes: [
          {
            question: 'ما هو قانون نيوتن الأول؟',
            options: ['F = ma', 'الجسم الساكن يبقى ساكناً', 'لكل فعل رد فعل', 'الطاقة محفوظة'],
            correctAnswer: 1
          }
        ],
        createdBy: creator._id,
        isActive: true
      },
      {
        title: 'اللغة العربية للصف الحادي عشر',
        description: 'دورة في اللغة العربية تشمل النحو والصرف والأدب',
        subject: 'لغة عربية',
        grade: '11',
        price: 450,
        thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        videos: [
          {
            title: 'مقدمة في النحو',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            duration: 22.25
          },
          {
            title: 'الإعراب والبناء',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
            duration: 19.5
          }
        ],
        quizzes: [
          {
            question: 'ما هو إعراب كلمة "الطالب" في جملة "جاء الطالب"؟',
            options: ['فاعل', 'مفعول به', 'مبتدأ', 'خبر'],
            correctAnswer: 0
          }
        ],
        createdBy: creator._id,
        isActive: true
      },
      {
        title: 'اللغة الإنجليزية للصف الثاني عشر',
        description: 'دورة في اللغة الإنجليزية تشمل القواعد والمفردات والمحادثة',
        subject: 'لغة إنجليزية',
        grade: '12',
        price: 700,
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
        videos: [
          {
            title: 'Present Perfect Tense',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            duration: 16.75
          },
          {
            title: 'Conditional Sentences',
            url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
            duration: 21.33
          }
        ],
        quizzes: [
          {
            question: 'Which sentence is correct?',
            options: ['I have went to school', 'I have gone to school', 'I have go to school', 'I have going to school'],
            correctAnswer: 1
          }
        ],
        createdBy: creator._id,
        isActive: true
      }
    ];

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Add sample courses
    for (const courseData of sampleCourses) {
      const course = new Course(courseData);
      await course.save();
      console.log(`Added course: ${course.title}`);
    }

    console.log('Sample courses added successfully!');
    console.log(`Total courses: ${await Course.countDocuments()}`);

  } catch (error) {
    console.error('Error adding sample courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
addSampleCourses();

