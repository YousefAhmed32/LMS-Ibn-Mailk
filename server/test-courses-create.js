const axios = require('axios');

// Sample courses data
const sampleCourses = [
  {
    title: "Mathematics Grade 7 - First Term",
    description: "Comprehensive mathematics course covering algebra, geometry, and problem-solving for Grade 7 students.",
    grade: "Grade 7",
    term: "First Term",
    subject: "Mathematics",
    price: 150,
    videos: [
      {
        title: "Introduction to Algebra",
        url: "https://example.com/video1.mp4",
        duration: 45
      },
      {
        title: "Basic Geometry Concepts",
        url: "https://example.com/video2.mp4",
        duration: 50
      }
    ]
  },
  {
    title: "Physics Grade 10 - Second Term",
    description: "Advanced physics concepts including mechanics, thermodynamics, and wave phenomena.",
    grade: "Grade 10",
    term: "Second Term",
    subject: "Physics",
    price: 200,
    videos: [
      {
        title: "Mechanics Fundamentals",
        url: "https://example.com/physics1.mp4",
        duration: 60
      },
      {
        title: "Thermodynamics Basics",
        url: "https://example.com/physics2.mp4",
        duration: 55
      }
    ]
  },
  {
    title: "English Literature Grade 12",
    description: "Advanced English literature analysis covering classic novels, poetry, and critical thinking.",
    grade: "Grade 12",
    term: "First Term",
    subject: "English",
    price: 180,
    videos: [
      {
        title: "Shakespeare Analysis",
        url: "https://example.com/english1.mp4",
        duration: 40
      },
      {
        title: "Modern Poetry",
        url: "https://example.com/english2.mp4",
        duration: 35
      }
    ]
  }
];

async function createSampleCourses() {
  try {
    console.log('🚀 Creating sample courses...');
    
    for (const course of sampleCourses) {
      const response = await axios.post('http://localhost:5000/api/courses', course, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // You'll need to get this from login
        }
      });
      
      if (response.data.success) {
        console.log(`✅ Created course: ${course.title}`);
      } else {
        console.log(`❌ Failed to create course: ${course.title}`);
      }
    }
    
    console.log('🎉 Sample courses creation completed!');
  } catch (error) {
    console.error('❌ Error creating sample courses:', error.response?.data || error.message);
  }
}

// Run the script
createSampleCourses();
