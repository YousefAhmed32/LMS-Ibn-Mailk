const Course = require('../../models/Course');
const { uploadToCloudinary } = require('../../utils/cloudinaryUpload');

// Update existing course with comprehensive error handling
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    console.log('=== COURSE UPDATE REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Course ID:', id);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('Body:', req.body);
    console.log('Files:', req.file ? 'File present' : 'No file');
    console.log('================================');

    // Check if course exists
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
        error: `No course found with ID: ${id}`
      });
    }

    // Handle image upload if present
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.path);
        updateData.imageUrl = result.secure_url;
        console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
      } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
        // Fallback to local storage
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    // Handle videos - parse JSON string if present (do this first)
    if (updateData.videos !== undefined) {
      console.log('🔍 Processing videos:', typeof updateData.videos, updateData.videos);
      try {
        if (typeof updateData.videos === 'string') {
          console.log('📝 Parsing videos JSON string...');
          updateData.videos = JSON.parse(updateData.videos);
          console.log('✅ Parsed videos:', updateData.videos);
        } else if (Array.isArray(updateData.videos)) {
          console.log('✅ Videos already an array:', updateData.videos);
        }
        
        // Validate and format videos array
        if (Array.isArray(updateData.videos)) {
          updateData.videos = updateData.videos.map((video, index) => ({
            title: video.title || `Video ${index + 1}`,
            url: video.url || '',
            order: video.order !== undefined ? parseInt(video.order) : index,
            duration: video.duration ? Math.max(1, parseInt(video.duration)) : 1,
            thumbnail: video.thumbnail || '',
          }));
        } else {
          updateData.videos = [];
        }
      } catch (error) {
        console.error('❌ Error parsing videos:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid videos data',
          error: error.message
        });
      }
    }

    // Handle exams - parse JSON string if present (do this first)
    if (updateData.exams !== undefined) {
      console.log('🔍 Processing exams:', typeof updateData.exams, updateData.exams);
      try {
        if (typeof updateData.exams === 'string') {
          console.log('📝 Parsing exams JSON string...');
          updateData.exams = JSON.parse(updateData.exams);
          console.log('✅ Parsed exams:', updateData.exams);
        } else if (Array.isArray(updateData.exams)) {
          console.log('✅ Exams already an array:', updateData.exams);
        }
        
        // Validate and format exams array for new internal structure
        if (Array.isArray(updateData.exams)) {
          updateData.exams = updateData.exams.map((exam, index) => {
            // Validate exam structure
            if (!exam.title || exam.title.trim() === '') {
              throw new Error(`Exam ${index + 1}: Title is required`);
            }
            
            // Allow external exam types (like google_form) to skip internal questions requirement
            const externalExamTypes = ['google_form', 'external', 'link'];
            const isExternalExam = exam.type && externalExamTypes.includes(exam.type);
            
            // Default to internal_exam if no type specified
            if (!exam.type) {
              exam.type = 'internal_exam';
            }
            
            if (!isExternalExam && (!exam.questions || !Array.isArray(exam.questions) || exam.questions.length === 0)) {
              throw new Error(`Exam ${index + 1}: At least one question is required for internal exams`);
            }
            
            // Validate questions only for internal exams
            if (!isExternalExam && exam.questions && Array.isArray(exam.questions)) {
              exam.questions.forEach((question, qIndex) => {
                if (!question.questionText || question.questionText.trim() === '') {
                  throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Question text is required`);
                }
                
                if (!question.type || !['mcq', 'multiple_choice', 'true_false', 'essay'].includes(question.type)) {
                  throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Invalid question type. Must be one of: mcq, multiple_choice, true_false, essay`);
                }
                
                // Set default points if not provided
                if (!question.points || question.points < 1) {
                  question.points = 1;
                }
                
                if (question.type === 'mcq' || question.type === 'multiple_choice') {
                  if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
                    throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Multiple choice must have at least 2 options`);
                  }
                  
                  if (question.correctAnswer === undefined || question.correctAnswer === null) {
                    throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Correct answer is required for multiple choice`);
                  }
                }
                
                if (question.type === 'true_false') {
                  if (typeof question.correctAnswer !== 'boolean') {
                    throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: True/False must have boolean correct answer`);
                  }
                }
              });
            }
            
            // Calculate totalPoints as sum of all question points
            let totalPoints = 0;
            if (!isExternalExam && exam.questions && Array.isArray(exam.questions)) {
              totalPoints = exam.questions.reduce((sum, question) => {
                return sum + (question.points || 1);
              }, 0);
            }
            
            return {
              id: exam.id || `exam_${Date.now()}_${index}`,
              title: exam.title.trim(),
              type: exam.type || 'internal_exam', // Default to internal_exam
              url: exam.url || '', // For external exams
              migratedFromGoogleForm: exam.migratedFromGoogleForm || false,
              migrationNote: exam.migrationNote || '',
              totalMarks: totalPoints, // totalMarks should equal totalPoints
              totalPoints: totalPoints, // Calculated automatically
              duration: parseInt(exam.duration) || 30,
              passingScore: parseInt(exam.passingScore) || 60,
              questions: isExternalExam ? [] : exam.questions, // Empty for external exams
              totalQuestions: isExternalExam ? 0 : (exam.questions ? exam.questions.length : 0),
              createdAt: exam.createdAt || new Date().toISOString()
            };
          });
        } else {
          updateData.exams = [];
        }
      } catch (error) {
        console.error('❌ Error parsing exams:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid exam data',
          error: error.message
        });
      }
    }

    // Input validation with detailed error messages
    const validationErrors = [];

    // Validate title if provided
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim() === '') {
        validationErrors.push('Course title cannot be empty');
      } else if (updateData.title.length > 100) {
        validationErrors.push('Course title cannot exceed 100 characters');
      }
    }

    // Validate subject if provided
    if (updateData.subject !== undefined) {
      if (!updateData.subject || updateData.subject.trim() === '') {
        validationErrors.push('Subject cannot be empty');
      } else if (updateData.subject.length > 50) {
        validationErrors.push('Subject cannot exceed 50 characters');
      }
    }

    // Validate grade if provided
    if (updateData.grade !== undefined) {
      const validGrades = ['7', '8', '9', '10', '11', '12'];
      if (!updateData.grade || updateData.grade.trim() === '') {
        validationErrors.push('Grade cannot be empty');
      } else if (!validGrades.includes(updateData.grade)) {
        validationErrors.push('Grade must be one of: 7, 8, 9, 10, 11, 12');
      }
    }

    // Validate price if provided
    if (updateData.price !== undefined) {
      const price = parseFloat(updateData.price);
      if (isNaN(price) || price < 0) {
        validationErrors.push('Price must be a valid number >= 0');
      } else {
        updateData.price = price;
      }
    }

    // Validate duration if provided
    if (updateData.duration !== undefined) {
      const duration = parseInt(updateData.duration);
      if (isNaN(duration) || duration < 0) {
        validationErrors.push('Duration must be a valid number >= 0');
      } else {
        updateData.duration = duration;
      }
    }

    // Validate level if provided
    if (updateData.level !== undefined) {
      const validLevels = ['beginner', 'intermediate', 'advanced'];
      if (!validLevels.includes(updateData.level)) {
        validationErrors.push('Level must be one of: beginner, intermediate, advanced');
      }
    }

    // Validate description if provided
    if (updateData.description !== undefined && updateData.description.length > 500) {
      validationErrors.push('Description cannot exceed 500 characters');
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        receivedData: {
          title: updateData.title,
          subject: updateData.subject,
          grade: updateData.grade,
          price: updateData.price,
          duration: updateData.duration
        }
      });
    }


    // Handle isActive conversion
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive !== 'false' && updateData.isActive !== false;
    }

    console.log('✅ Processed update data:', {
      title: updateData.title,
      subject: updateData.subject,
      grade: updateData.grade,
      price: updateData.price,
      duration: updateData.duration,
      videosCount: updateData.videos?.length || 'not updated',
      examsCount: updateData.exams?.length || 'not updated'
    });

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or could not be updated',
        error: `No course found with ID: ${id}`
      });
    }

    console.log('✅ Course updated successfully:', updatedCourse._id);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });

  } catch (error) {
    console.error('=== COURSE UPDATE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request data:', req.body);
    console.error('Course ID:', req.params.id);
    console.error('================================');

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Database validation error',
        errors: validationErrors
      });
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry error',
        error: 'A course with this information already exists'
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: `Invalid ${error.path}: ${error.value}`
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = updateCourse;
