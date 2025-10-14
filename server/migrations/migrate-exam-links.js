const mongoose = require('mongoose');
const Course = require('../models/Course');

// Migration script to convert single examLink to exams array
async function migrateExamLinks() {
  try {
    console.log('Starting exam links migration...');
    
    // Find all courses that have examLink field
    const coursesWithExamLink = await Course.find({ 
      examLink: { $exists: true, $ne: null, $ne: '' } 
    });
    
    console.log(`Found ${coursesWithExamLink.length} courses with examLink to migrate`);
    
    if (coursesWithExamLink.length === 0) {
      console.log('No courses found with examLink field. Migration complete.');
      return;
    }
    
    // Migrate each course
    for (const course of coursesWithExamLink) {
      console.log(`Migrating course: ${course.title} (ID: ${course._id})`);
      
      // Convert examLink to exams array
      const examData = {
        id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'امتحان الدورة',
        url: course.examLink,
        type: 'google_form'
      };
      
      // Update the course
      await Course.findByIdAndUpdate(
        course._id,
        {
          $set: { exams: [examData] },
          $unset: { examLink: 1 }
        }
      );
      
      console.log(`✓ Migrated course: ${course.title}`);
    }
    
    console.log('Migration completed successfully!');
    console.log(`Migrated ${coursesWithExamLink.length} courses`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    return migrateExamLinks();
  })
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateExamLinks };
