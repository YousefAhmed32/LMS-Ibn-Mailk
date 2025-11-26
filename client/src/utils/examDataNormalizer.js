/**
 * Exam Data Normalizer Utility
 * 
 * This utility provides functions to normalize and clean exam data
 * to ensure consistent structure between CreateCourse and EditCourse pages.
 * 
 * Common Issues Fixed:
 * 1. true_false questions: correctAnswer must be boolean, not index (0/1)
 * 2. options: must be strings array, not objects array
 * 3. Data type consistency across different sources
 */

/**
 * Normalizes a single question's data structure
 * @param {Object} question - The question object to normalize
 * @param {number} qIndex - Index of the question (for ID generation)
 * @returns {Object} Normalized question object
 */
export const normalizeQuestion = (question, qIndex = 0) => {
  if (!question) return null;

  // Clean question text
  const questionText = question.questionText 
    ? String(question.questionText).trim() 
    : '';

  // Normalize options - ensure they are strings
  let normalizedOptions = [];
  if (question.options && Array.isArray(question.options)) {
    normalizedOptions = question.options.map((opt, optIndex) => {
      // If option is an object, extract text
      if (typeof opt === 'object' && opt !== null) {
        return String(opt.text || opt.optionText || opt.value || '').trim();
      }
      // If option is a string, use it directly
      return String(opt).trim();
    }).filter(opt => opt.length > 0); // Remove empty options
  }

  // Normalize correctAnswer based on question type
  let normalizedCorrectAnswer = question.correctAnswer;

  if (question.type === 'true_false') {
    // For true/false questions, correctAnswer must be boolean
    // If it's a number (0 or 1), convert to boolean
    if (typeof normalizedCorrectAnswer === 'number') {
      // In the UI: optIndex 0 = صحيح (true), optIndex 1 = خطأ (false)
      // So if correctAnswer is 0, it means صحيح (true)
      // If correctAnswer is 1, it means خطأ (false)
      normalizedCorrectAnswer = normalizedCorrectAnswer === 0;
    } else if (typeof normalizedCorrectAnswer === 'string') {
      // Handle string values
      normalizedCorrectAnswer = normalizedCorrectAnswer === 'true' || 
                                 normalizedCorrectAnswer === 'صحيح' ||
                                 normalizedCorrectAnswer === '0';
    } else if (normalizedCorrectAnswer === null || normalizedCorrectAnswer === undefined) {
      // Default to false if not set
      normalizedCorrectAnswer = false;
    }
    // Ensure it's a boolean
    normalizedCorrectAnswer = Boolean(normalizedCorrectAnswer);
  } else if (question.type === 'multiple_choice' || question.type === 'mcq') {
    // For multiple choice, correctAnswer should be the index (number) or option text (string)
    if (normalizedCorrectAnswer === null || normalizedCorrectAnswer === undefined) {
      normalizedCorrectAnswer = null;
    } else if (typeof normalizedCorrectAnswer === 'number') {
      // Keep as number (index)
      normalizedCorrectAnswer = normalizedCorrectAnswer;
    } else if (typeof normalizedCorrectAnswer === 'string') {
      // Keep as string (option text)
      normalizedCorrectAnswer = normalizedCorrectAnswer.trim();
    }
  }

  // Ensure points is a valid number
  const points = Math.max(1, parseInt(question.points || question.marks || 1) || 1);

  return {
    id: question.id || `q_${Date.now()}_${qIndex}`,
    questionText,
    type: question.type || 'multiple_choice',
    options: normalizedOptions,
    correctAnswer: normalizedCorrectAnswer,
    points,
    // Preserve other fields if they exist
    ...(question.sampleAnswer && { sampleAnswer: question.sampleAnswer }),
    ...(question.explanation && { explanation: question.explanation }),
    ...(question.order !== undefined && { order: question.order })
  };
};

/**
 * Normalizes an entire exam's data structure
 * @param {Object} exam - The exam object to normalize
 * @returns {Object} Normalized exam object
 */
export const normalizeExam = (exam) => {
  if (!exam) return null;

  // For external exams, just return as is (no questions to normalize)
  if (exam.type !== 'internal_exam' || !exam.questions) {
    return exam;
  }

  const normalizedQuestions = exam.questions.map((question, qIndex) => 
    normalizeQuestion(question, qIndex)
  ).filter(q => q !== null);

  return {
    ...exam,
    questions: normalizedQuestions
  };
};

/**
 * Normalizes an array of exams
 * @param {Array} exams - Array of exam objects
 * @returns {Array} Array of normalized exam objects
 */
export const normalizeExams = (exams) => {
  if (!Array.isArray(exams)) return [];
  
  return exams.map(exam => normalizeExam(exam)).filter(exam => exam !== null);
};

/**
 * Example of correct exam data structure before sending to server:
 * 
 * {
 *   id: "exam_1234567890",
 *   title: "امتحان الفصل الأول",
 *   type: "internal_exam", // or "google_form" or "external"
 *   url: "", // Required for external exams
 *   totalMarks: 100, // Calculated automatically from questions
 *   duration: 30, // in minutes
 *   passingScore: 60, // percentage
 *   questions: [
 *     {
 *       id: "q_1234567890",
 *       questionText: "ما هي عاصمة مصر؟",
 *       type: "multiple_choice", // or "true_false" or "essay"
 *       options: ["القاهرة", "الإسكندرية", "الجيزة", "أسوان"], // Array of strings
 *       correctAnswer: 0, // Index of correct option (for multiple_choice)
 *       points: 5
 *     },
 *     {
 *       id: "q_1234567891",
 *       questionText: "مصر هي أكبر دولة عربية من حيث عدد السكان",
 *       type: "true_false",
 *       options: ["صحيح", "خطأ"], // Fixed for true/false
 *       correctAnswer: true, // MUST be boolean (true/false), NOT number!
 *       points: 2
 *     }
 *   ]
 * }
 * 
 * Key Points:
 * 1. For true_false questions: correctAnswer MUST be boolean (true/false)
 * 2. For multiple_choice questions: correctAnswer can be number (index) or string (option text)
 * 3. options MUST be array of strings, not objects
 * 4. All string fields should be trimmed
 * 5. points should be a positive integer (minimum 1)
 */

export default {
  normalizeQuestion,
  normalizeExam,
  normalizeExams
};

