const Course = require('../../models/Course');
const mongoose = require('mongoose');

const generateExamId = () => `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const normalizeExamData = (examData, existingExam = null) => {
  const examId = existingExam?.id || examData.id || generateExamId();
  
  const normalized = {
    id: examId,
    title: examData.title?.trim() || 'امتحان بدون عنوان',
    type: examData.type || 'internal_exam',
    url: examData.url || '',
    migratedFromGoogleForm: examData.migratedFromGoogleForm || false,
    migrationNote: examData.migrationNote || '',
    duration: parseInt(examData.duration) || 30,
    passingScore: parseInt(examData.passingScore) || 60,
    isActive: examData.isActive !== undefined ? examData.isActive : true,
    questions: (examData.questions || []).map((q, index) => {
      const questionId = q.id || `q_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`;
      const question = {
        id: questionId,
        questionText: q.questionText?.trim() || '',
        type: q.type || 'mcq',
        points: parseInt(q.points || q.marks || 10),
        marks: parseInt(q.marks || q.points || 10),
        order: q.order || index + 1
      };

      if (question.type === 'mcq' || question.type === 'multiple_choice') {
        question.options = (q.options || q.choices || []).map((opt, optIdx) => {
          const optId = (typeof opt === 'object' && opt.id) ? opt.id : `opt_${questionId}_${optIdx}`;
          const optText = typeof opt === 'object' ? (opt.text || opt.optionText || '') : String(opt);
          return {
            id: optId,
            text: optText.trim(),
            optionText: optText.trim()
          };
        });

        if (q.correctAnswer) {
          question.correctAnswer = String(q.correctAnswer).trim();
        } else if (q.choices) {
          const correctChoice = q.choices.find(c => c.isCorrect === true);
          if (correctChoice && question.options.length > 0) {
            const correctIndex = q.choices.indexOf(correctChoice);
            question.correctAnswer = question.options[correctIndex]?.id || null;
          }
        }
      } else if (question.type === 'true_false') {
        question.options = [];
        question.correctAnswer = typeof q.correctAnswer === 'boolean' ? q.correctAnswer : true;
      } else if (question.type === 'essay') {
        question.options = [];
        question.sampleAnswer = q.sampleAnswer || '';
      }

      return question;
    })
  };

  const totalMarks = normalized.questions.reduce((sum, q) => sum + (q.points || 10), 0);
  normalized.totalMarks = totalMarks;
  normalized.totalPoints = totalMarks;

  return normalized;
};

const saveExamDraft = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const examData = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const examIdToUse = examId && examId !== 'draft' ? examId : examData.id || null;
    const existingExamIndex = examIdToUse ? course.exams.findIndex(e => e.id === examIdToUse) : -1;
    const existingExam = existingExamIndex >= 0 ? course.exams[existingExamIndex] : null;

    const normalizedExam = normalizeExamData(examData, existingExam);
    normalizedExam.status = 'draft';
    normalizedExam.updatedAt = new Date();
    
    if (existingExam) {
      normalizedExam.version = (existingExam.version || 1) + 1;
      normalizedExam.createdAt = existingExam.createdAt || new Date();
      course.exams[existingExamIndex] = normalizedExam;
    } else {
      normalizedExam.version = 1;
      normalizedExam.createdAt = new Date();
      course.exams.push(normalizedExam);
    }

    await course.save();

    res.json({
      success: true,
      message: 'Draft saved successfully',
      exam: normalizedExam
    });
  } catch (error) {
    console.error('Error saving exam draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message
    });
  }
};

const publishExam = async (req, res) => {
  try {
    const { courseId, examId } = req.params;
    const examData = req.body;

    if (!examData.title || !examData.title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Exam title is required for publishing'
      });
    }

    if (!examData.questions || !Array.isArray(examData.questions) || examData.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required for publishing'
      });
    }

    for (let i = 0; i < examData.questions.length; i++) {
      const q = examData.questions[i];
      
      if (!q.questionText || !q.questionText.trim()) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1}: Question text is required`
        });
      }
      
      if (q.type === 'mcq' || q.type === 'multiple_choice') {
        const choices = q.choices || q.options || [];
        if (choices.length < 2) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: At least 2 options required for MCQ`
          });
        }
        
        const emptyChoices = choices.filter(c => {
          const text = typeof c === 'object' ? (c.text || c.optionText || '') : String(c);
          return !text.trim();
        });
        if (emptyChoices.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Some options are empty`
          });
        }
        
        const hasCorrect = choices.some(c => {
          if (typeof c === 'object') {
            return c.isCorrect === true;
          }
          return false;
        });
        if (!hasCorrect && !q.correctAnswer) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Correct answer must be specified`
          });
        }
      }
      
      if (q.type === 'true_false') {
        if (q.correctAnswer !== true && q.correctAnswer !== false) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1}: Correct answer must be true or false`
          });
        }
      }
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const examIdToUse = examId && examId !== 'publish' ? examId : examData.id || null;
    const existingExamIndex = examIdToUse ? course.exams.findIndex(e => e.id === examIdToUse) : -1;
    const existingExam = existingExamIndex >= 0 ? course.exams[existingExamIndex] : null;

    const normalizedExam = normalizeExamData(examData, existingExam);
    normalizedExam.status = 'published';
    normalizedExam.publishedAt = new Date();
    normalizedExam.updatedAt = new Date();
    
    if (existingExam) {
      normalizedExam.version = (existingExam.version || 1) + 1;
      normalizedExam.createdAt = existingExam.createdAt || new Date();
      course.exams[existingExamIndex] = normalizedExam;
    } else {
      normalizedExam.version = 1;
      normalizedExam.createdAt = new Date();
      course.exams.push(normalizedExam);
    }

    await course.save();

    res.json({
      success: true,
      message: 'Exam published successfully',
      exam: normalizedExam
    });
  } catch (error) {
    console.error('Error publishing exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish exam',
      error: error.message
    });
  }
};

module.exports = {
  saveExamDraft,
  publishExam
};
