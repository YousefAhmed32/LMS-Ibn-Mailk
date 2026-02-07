/**
 * Unified Exam Normalization Utility
 * 
 * Single source of truth for converting exam data between:
 * - Server format: options[{id, text}] + correctAnswer (option.id string for MCQ, boolean for T/F)
 * - UI format: choices[{id, text, isCorrect}] used by ExamBuilderContext
 * 
 * All components (IntegratedExamBuilder, EditCourse, EnhancedCreateCourseModal, ExamBuilderContext)
 * import from this file instead of maintaining their own normalization logic.
 */

// ─── Stable ID Generator ─────────────────────────────────────────
export const generateStableId = (prefix = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

// ═══════════════════════════════════════════════════════════════
// serverToUI: Convert server/DB exam format → UI (ExamBuilder) format
// Used when loading existing exams into the builder for editing
// ═══════════════════════════════════════════════════════════════
export const serverQuestionToUI = (question, idx = 0) => {
  if (!question) return null;

  const qId = question.id || question._id?.toString() || generateStableId('q');
  const type = question.type === 'multiple_choice' ? 'mcq' : (question.type || 'mcq');

  // ✅ Build choices from options OR existing choices
  let choices = [];
  if (type === 'mcq') {
    // Try to get from options first (server format)
    if (question.options && Array.isArray(question.options)) {
      const opts = question.options;
      
      let correctId = null;
      if (typeof question.correctAnswer === 'string' && question.correctAnswer.trim()) {
        correctId = question.correctAnswer.trim();
      } else if (typeof question.correctAnswer === 'number' && opts[question.correctAnswer]) {
        correctId = opts[question.correctAnswer]?.id || null;
      }

      choices = opts.map((opt, i) => {
        const id = (typeof opt === 'object' && opt.id) ? opt.id : generateStableId('opt');
        const text = typeof opt === 'object' ? (opt.text || opt.optionText || '') : String(opt);
        const isCorrect = correctId ? (String(id) === correctId) : (i === 0);
        return { id, text, isCorrect };
      });
    }
    // ✅ Fallback: try to get from choices (UI format - for newly created questions)
    else if (question.choices && Array.isArray(question.choices)) {
      choices = question.choices.map(c => ({
        id: c.id || generateStableId('opt'),
        text: c.text || '',
        isCorrect: c.isCorrect || false
      }));
    }

    // Ensure at least one is correct
    if (choices.length > 0 && !choices.some(c => c.isCorrect)) {
      choices[0].isCorrect = true;
    }
  }

  return {
    id: qId,
    type,
    questionText: question.questionText || question.question || '',
    choices,
    correctAnswer: question.correctAnswer,
    marks: question.marks || question.points || 10,
    sampleAnswer: question.sampleAnswer || '',
    order: question.order ?? idx + 1
  };
};

export const serverToUI = (exam) => {
  if (!exam) return { title: '', totalMarks: 0, questions: [] };
  return {
    title: exam.title || '',
    totalMarks: exam.totalMarks || exam.totalPoints || 0,
    duration: exam.duration || 30,
    passingScore: exam.passingScore || 60,
    questions: (exam.questions || []).map((q, i) => serverQuestionToUI(q, i)).filter(Boolean)
  };
};

// ═══════════════════════════════════════════════════════════════
// uiToServer: Convert UI (ExamBuilder) format → server/DB format
// Used when saving exams from the builder to the backend
// ═══════════════════════════════════════════════════════════════
export const uiQuestionToServer = (question, qIdx = 0) => {
  if (!question) return null;

  const questionId = question.id || generateStableId('q');

  if (question.type === 'mcq' && question.choices && question.choices.length > 0) {
    // Build options with consistent IDs
    const options = question.choices.map((choice, cIdx) => ({
      id: choice.id || `opt_${questionId}_${cIdx}`,
      text: choice.text || '',
      optionText: choice.text || ''
    }));

    // Find the correct answer by isCorrect flag
    const correctChoice = question.choices.find(c => c.isCorrect);
    let correctAnswerId = null;
    if (correctChoice) {
      const correctIndex = question.choices.indexOf(correctChoice);
      correctAnswerId = options[correctIndex]?.id || null;
    }

    return {
      id: questionId,
      questionText: question.questionText || '',
      type: 'mcq',
      options,
      correctAnswer: correctAnswerId, // option.id string
      points: question.marks || question.points || 1,
      order: question.order ?? qIdx + 1
    };
  }

  if (question.type === 'true_false') {
    return {
      id: questionId,
      questionText: question.questionText || '',
      type: 'true_false',
      correctAnswer: typeof question.correctAnswer === 'boolean' ? question.correctAnswer : true,
      points: question.marks || question.points || 1,
      order: question.order ?? qIdx + 1
    };
  }

  // Essay or other types
  return {
    id: questionId,
    questionText: question.questionText || '',
    type: question.type || 'essay',
    sampleAnswer: question.sampleAnswer || '',
    points: question.marks || question.points || 1,
    order: question.order ?? qIdx + 1
  };
};

export const uiToServer = (examForm, existingExamId = null) => {
  const questions = (examForm.questions || []).map((q, i) => uiQuestionToServer(q, i)).filter(Boolean);
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  return {
    id: existingExamId || generateStableId('exam'),
    title: (examForm.title || '').trim(),
    type: 'internal_exam',
    totalMarks: totalPoints,
    totalPoints: totalPoints,
    duration: examForm.duration || 30,
    passingScore: examForm.passingScore || 60,
    questions,
    createdAt: new Date().toISOString()
  };
};

// ═══════════════════════════════════════════════════════════════
// validateExamForSubmit: Validate UI-format exam data before saving
// Returns { valid: boolean, errors: string[] }
// ═══════════════════════════════════════════════════════════════
export const validateExamForSubmit = (examForm) => {
  const errors = [];

  if (!examForm.title || !examForm.title.trim()) {
    errors.push('عنوان الامتحان مطلوب');
  }

  if (!examForm.questions || examForm.questions.length === 0) {
    errors.push('يجب إضافة سؤال واحد على الأقل');
    return { valid: false, errors };
  }

  examForm.questions.forEach((q, i) => {
    const num = i + 1;

    if (!q.questionText || !q.questionText.trim()) {
      errors.push(`السؤال ${num}: نص السؤال مطلوب`);
    }

    if (q.type === 'mcq') {
      if (!q.choices || q.choices.length < 2) {
        errors.push(`السؤال ${num}: يجب أن يحتوي على خيارين على الأقل`);
      } else {
        // Check for empty option texts
        const emptyOpts = q.choices.filter(c => !c.text || !c.text.trim());
        if (emptyOpts.length > 0) {
          errors.push(`السؤال ${num}: بعض الخيارات فارغة`);
        }
        // Check for correct answer selection
        if (!q.choices.some(c => c.isCorrect)) {
          errors.push(`السؤال ${num}: لم يتم تحديد الإجابة الصحيحة`);
        }
        // Check that exactly one choice is correct (single-choice)
        const correctCount = q.choices.filter(c => c.isCorrect).length;
        if (correctCount > 1) {
          errors.push(`السؤال ${num}: يجب تحديد إجابة صحيحة واحدة فقط`);
        }
      }
    }

    if (q.type === 'true_false') {
      if (q.correctAnswer === undefined || q.correctAnswer === null) {
        errors.push(`السؤال ${num}: يجب تحديد الإجابة الصحيحة (صح/خطأ)`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
};

export default {
  generateStableId,
  serverToUI,
  serverQuestionToUI,
  uiToServer,
  uiQuestionToServer,
  validateExamForSubmit
};
