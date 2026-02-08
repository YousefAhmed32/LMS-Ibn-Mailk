const Course = require('../../models/Course');
const { uploadImageToGridFS } = require('../../utils/unifiedGridfsUpload');
const { getYouTubeEmbedUrl } = require('../../utils/videoUtils');

// Create new course with comprehensive error handling
const createCourse = async (req, res) => {
  try {
    console.log('=== COURSE CREATION REQUEST ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('User:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? `${req.files.length} files present` : 'No files');
    console.log('================================');

    // Extract course data from request body
    const courseData = { ...req.body };

    // Handle image upload if present
    if (req.file) {
      try {
        console.log('📸 Uploading image to GridFS...', {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        const result = await uploadImageToGridFS(req.file, req.user?._id);
        courseData.imageUrl = result.url;
        console.log('✅ Image uploaded to GridFS:', result.url);
      } catch (error) {
        console.error('❌ GridFS upload error:', error);
        // Don't fail the entire request if image upload fails
        console.warn('⚠️ Continuing without image...');
        courseData.imageUrl = null;
      }
    } else if (req.body.imageUrl) {
      // Handle direct imageUrl from frontend (already uploaded)
      courseData.imageUrl = req.body.imageUrl;
      console.log('✅ Using provided imageUrl:', req.body.imageUrl);
    }

    // Input validation with detailed error messages
    const validationErrors = [];

    // Required field validation
    if (!courseData.title || courseData.title.trim() === '') {
      validationErrors.push('Course title is required');
    }

    if (!courseData.subject || courseData.subject.trim() === '') {
      validationErrors.push('Subject is required');
    }

    if (!courseData.grade || courseData.grade.trim() === '') {
      validationErrors.push('Grade is required');
    }

    // Price validation
    const price = parseFloat(courseData.price);
    if (isNaN(price) || price < 0) {
      validationErrors.push('Valid price is required (must be a number >= 0)');
    }

    // Grade validation
    const validGrades = ['7', '8', '9', '10', '11', '12'];
    if (courseData.grade && !validGrades.includes(courseData.grade)) {
      validationErrors.push('Grade must be one of: 7, 8, 9, 10, 11, 12');
    }

    // Duration validation
    const duration = parseInt(courseData.duration);
    if (courseData.duration && (isNaN(duration) || duration < 0)) {
      validationErrors.push('Duration must be a valid number >= 0');
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        receivedData: {
          title: courseData.title,
          subject: courseData.subject,
          grade: courseData.grade,
          price: courseData.price,
          duration: courseData.duration
        }
      });
    }

    // Set default values for optional fields
    courseData.description = courseData.description || '';
    courseData.level = courseData.level || 'beginner';
    courseData.duration = duration || 0;
    courseData.price = price;
    
    // Handle isActive - convert string to boolean if needed
    if (typeof courseData.isActive === 'string') {
      courseData.isActive = courseData.isActive === 'true';
    } else {
      courseData.isActive = courseData.isActive !== false;
    }

    // Handle videos - parse JSON string if present
    if (courseData.videos) {
      console.log('🔍 Processing videos:', typeof courseData.videos, courseData.videos);
      try {
        if (typeof courseData.videos === 'string') {
          console.log('📝 Parsing videos JSON string...');
          courseData.videos = JSON.parse(courseData.videos);
          console.log('✅ Parsed videos:', courseData.videos);
        } else if (Array.isArray(courseData.videos)) {
          console.log('✅ Videos already an array:', courseData.videos);
        }
        
        // Validate and format videos array - normalize YouTube URLs to embed format
        if (Array.isArray(courseData.videos)) {
          // ✅ Helper function to extract YouTube ID
          const extractYouTubeID = (url) => {
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url?.match(regex);
            return match ? match[1] : null;
          };
          
          courseData.videos = courseData.videos.map((video, index) => {
            const rawUrl = (video.url || '').trim();
            const embedUrl = getYouTubeEmbedUrl(rawUrl);
            const url = embedUrl || rawUrl;
            const videoId = extractYouTubeID(url);
            
            // ✅ معالجة publishSettings بشكل صحيح
            let processedPublishSettings = {
              autoPublish: true,
              notifyStudents: true
            };
            
            if (video.publishSettings) {
              if (video.status === 'scheduled' && video.publishSettings.publishDate) {
                // ✅ تحويل publishDate إلى Date object إذا كان string
                const publishDate = video.publishSettings.publishDate;
                const publishDateObj = publishDate instanceof Date 
                  ? publishDate 
                  : new Date(publishDate);
                
                // ✅ التحقق من صحة التاريخ
                if (isNaN(publishDateObj.getTime())) {
                  console.warn(`⚠️ Invalid publishDate for video ${index + 1}:`, publishDate);
                } else {
                  processedPublishSettings = {
                    publishDate: publishDateObj,
                    autoPublish: video.publishSettings.autoPublish !== undefined 
                      ? video.publishSettings.autoPublish 
                      : true,
                    notifyStudents: video.publishSettings.notifyStudents !== undefined
                      ? video.publishSettings.notifyStudents
                      : true
                  };
                  console.log(`✅ Processed publishSettings for video ${index + 1}:`, {
                    publishDate: processedPublishSettings.publishDate,
                    publishDateISO: processedPublishSettings.publishDate.toISOString(),
                    autoPublish: processedPublishSettings.autoPublish,
                    notifyStudents: processedPublishSettings.notifyStudents
                  });
                }
              } else {
                processedPublishSettings = {
                  autoPublish: video.publishSettings.autoPublish !== undefined 
                    ? video.publishSettings.autoPublish 
                    : true,
                  notifyStudents: video.publishSettings.notifyStudents !== undefined
                    ? video.publishSettings.notifyStudents
                    : true
                };
              }
            }
            
            const formattedVideo = {
              id: video.id || `video_${Date.now()}_${index}`,
              title: video.title || `Video ${index + 1}`,
              url,
              videoId: videoId || video.videoId,
              provider: video.provider || 'youtube',
              order: video.order !== undefined ? parseInt(video.order) : index,
              duration: video.duration ? Math.max(1, parseInt(video.duration)) : 1,
              thumbnail: video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''),
              status: video.status || 'visible', // ✅ احفظ الحالة
              publishSettings: processedPublishSettings, // ✅ احفظ إعدادات الجدولة المعالجة
              createdAt: video.createdAt || new Date(),
              lastModified: new Date()
            };
            
            // ✅ فقط إذا كان visible، حدد publishedAt
            if (formattedVideo.status === 'visible') {
              formattedVideo.publishedAt = new Date();
            }
            
            return formattedVideo;
          });
        } else {
          courseData.videos = [];
        }
      } catch (error) {
        console.error('❌ Error parsing videos:', error);
        courseData.videos = [];
      }
    } else {
      courseData.videos = [];
    }

    // Handle exams - parse JSON string if present
    if (courseData.exams) {
      console.log('🔍 Processing exams:', typeof courseData.exams, courseData.exams);
      try {
        if (typeof courseData.exams === 'string') {
          console.log('📝 Parsing exams JSON string...');
          courseData.exams = JSON.parse(courseData.exams);
          console.log('✅ Parsed exams:', courseData.exams);
        } else if (Array.isArray(courseData.exams)) {
          console.log('✅ Exams already an array:', courseData.exams);
        }
        
        // Validate and format exams array for new internal structure
        if (Array.isArray(courseData.exams)) {
          courseData.exams = courseData.exams.map((exam, index) => {
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
                  
                  // ✅ SINGLE-CHOICE ONLY: correctAnswer must be string (option.id)
                  if (question.correctAnswer === undefined || question.correctAnswer === null) {
                    throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Correct answer is required for multiple choice`);
                  }
                  
                  // Validate correctAnswer is string (option.id) and exists in options — no transformation
                  if (typeof question.correctAnswer !== 'string') {
                    throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Correct answer must be option.id (string), got ${typeof question.correctAnswer}`);
                  }
                  
                  const correctAnswerId = question.correctAnswer.trim();
                  const optionExists = question.options.some(opt => {
                    const optId = typeof opt === 'object' ? (opt.id || opt._id) : null;
                    return optId === correctAnswerId;
                  });
                  
                  if (!optionExists) {
                    console.error(`❌ Option IDs available:`, question.options.map(opt => typeof opt === 'object' ? (opt.id || opt._id) : 'N/A'));
                    throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Correct answer option.id "${correctAnswerId}" not found in options`);
                  }
                  
                  // ✅ REJECT: Remove correctAnswers if present
                  if (question.correctAnswers) {
                    delete question.correctAnswers;
                  }
                  
                  // ✅ REJECT: Remove isCorrect flags from options
                  question.options.forEach(opt => {
                    if (typeof opt === 'object') {
                      delete opt.isCorrect;
                    }
                  });
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
            
            const processedExam = {
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
              // ✅ احفظ حالة الامتحان وموعد النشر
              status: exam.status || 'draft',
              publishedAt: exam.publishedAt || null,
              createdAt: exam.createdAt || new Date(),
              updatedAt: exam.updatedAt || new Date(),
              version: exam.version || 1,
              isActive: exam.isActive !== undefined ? exam.isActive : true
            };
            
            // ✅ إذا كان status = 'published' ولم يكن publishedAt محدداً، حدده الآن
            if (processedExam.status === 'published' && !processedExam.publishedAt) {
              processedExam.publishedAt = new Date();
            }
            
            return processedExam;
          });
        } else {
          courseData.exams = [];
        }
      } catch (error) {
        console.error('❌ Error processing exams:', error);
        return res.status(400).json({
          success: false,
          message: 'Invalid exam data',
          error: error.message
        });
      }
    } else {
      courseData.exams = [];
    }

    // Set the creator
    if (req.user && req.user._id) {
      courseData.createdBy = req.user._id;
      console.log('👤 Setting createdBy:', req.user._id);
    } else {
      console.warn('⚠️ No user found in request. Setting createdBy to null.');
      courseData.createdBy = null;
    }

    console.log('✅ Processed course data:', {
      title: courseData.title,
      subject: courseData.subject,
      grade: courseData.grade,
      price: courseData.price,
      duration: courseData.duration,
      videosCount: courseData.videos.length,
      examsCount: courseData.exams.length
    });

    // Create and save course
    console.log('📝 Creating Course instance with data:', JSON.stringify(courseData, null, 2));
    const course = new Course(courseData);
    
    // Validate the course model
    const validationError = course.validateSync();
    if (validationError) {
      console.error('❌ Mongoose validation failed:', validationError);
      const mongooseErrors = Object.values(validationError.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Course validation failed',
        errors: mongooseErrors
      });
    }

    // Save to database
    console.log('💾 Saving course to database...');
    const savedCourse = await course.save();
    console.log('✅ Course saved successfully:', savedCourse._id);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Course created successfully',
      data: savedCourse
    });

  } catch (error) {
    console.error('=== COURSE CREATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('Request data:', req.body);
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
      message: 'Internal server error while creating course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = createCourse;

