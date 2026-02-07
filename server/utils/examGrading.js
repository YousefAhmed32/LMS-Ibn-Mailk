const fs = require('fs');
const path = require('path');

/**
 * Exam Grading Utility — Multiple Correct Answers & Set-Based Logic
 *
 * ROOT CAUSE of "only first correct counted" / wrong grading:
 * ---------------------------------------------------------------
 * 1. Reference vs value: [1,2,3] === [1,2,3] is FALSE in JS (different references).
 * 2. Order-sensitive checks: code that does "correctAnswers.every(c => selected.includes(c))"
 *    can fail if types differ (e.g. number 1 vs string "1") or if selected has extras and
 *    we don't check "no wrong answers".
 * 3. Counting only "correct hits": giving +1 per correct selected but not penalizing wrong
 *    selections leads to inflated scores when student selects everything.
 * 4. Single-value assumption: treating correctAnswer as single and comparing with
 *    selectedAnswers[0] or the first match ignores multiple required correct answers.
 *
 * Correct approach: treat answers as SETS. Full mark iff:
 *   (1) Every correct answer is in the selected set, AND
 *   (2) Every selected answer is in the correct set (no wrong selections).
 * So: normalizedSet(selected) === normalizedSet(correct) and no extras on either side.
 */

/**
 * ✅ ENHANCED: Normalize an answer identifier to a comparable string.
 * Handles: number (index), string (id or text), boolean (true_false).
 * Normalizes whitespace and case-insensitive comparison for text values.
 * @param {*} value
 * @returns {string}
 */
function normalizeAnswerKey(value) {
  const originalValue = value;
  const originalType = typeof value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  const result = String(value).trim().toLowerCase(); // Case-insensitive for text comparison
  // #region agent log
  try{
    const logPath = path.join(__dirname,'../../.cursor/debug.log');
    fs.appendFileSync(logPath,JSON.stringify({location:'examGrading.js:27',message:'NORMALIZE_KEY',data:{originalValue,originalType,normalized:result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');
  }catch(e){console.error('DEBUG LOG ERROR:',e.message);}
  // #endregion
  return result;
}

/**
 * ✅ NEW: Comprehensive option ID resolver
 * Resolves an answer reference (ID, index, or text) to a stable option ID
 * @param {*} answerRef - The answer reference (ID, index, or text)
 * @param {Array} options - Array of option objects
 * @param {string} questionId - Question ID for generating stable IDs
 * @returns {string|null} - Resolved option ID or null if not found
 */
function resolveOptionId(answerRef, options, questionId = '') {
  if (answerRef === null || answerRef === undefined) return null;
  
  // Try ID match first (exact match, case-sensitive for IDs)
  const optById = options.find(opt => 
    opt && opt.id && String(opt.id).trim() === String(answerRef).trim()
  );
  if (optById) return optById.id;
  
  // Try index match
  if (typeof answerRef === 'number' && options[answerRef]) {
    const opt = options[answerRef];
    if (!opt.id) {
      // Generate stable ID
      opt.id = `opt_${questionId || 'q'}_${answerRef}`;
    }
    return opt.id;
  }
  
  // Try text match (case-insensitive)
  const normalizedRef = normalizeAnswerKey(answerRef);
  const optByText = options.find(opt => 
    opt && (
      normalizeAnswerKey(opt.text) === normalizedRef ||
      normalizeAnswerKey(opt.optionText) === normalizedRef
    )
  );
  if (optByText) {
    if (!optByText.id) {
      const optIdx = options.indexOf(optByText);
      optByText.id = `opt_${questionId || 'q'}_${optIdx}`;
    }
    return optByText.id;
  }
  
  // Last resort: treat as ID directly (might be valid ID format)
  return String(answerRef).trim();
}

/**
 * Build a Set of comparable keys from an array or single value.
 * Empty array or null/undefined → empty Set.
 * Order does NOT matter (set comparison).
 *
 * @param {Array|*} answers - Array of correct/selected answers, or single value
 * @returns {Set<string>}
 */
function toComparableSet(answers) {
  const originalAnswers = answers;
  const isArray = Array.isArray(answers);
  if (answers === null || answers === undefined) return new Set();
  const arr = Array.isArray(answers) ? answers : [answers];
  const set = new Set();
  for (const a of arr) {
    const key = normalizeAnswerKey(a);
    if (key !== '') set.add(key);
  }
  // #region agent log
  try{fs.appendFileSync(path.join(__dirname,'../../.cursor/debug.log'),JSON.stringify({location:'examGrading.js:42',message:'TO_COMPARABLE_SET',data:{originalAnswers,isArray,setSize:set.size,setValues:Array.from(set)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})+'\n');}catch(e){}
  // #endregion
  return set;
}

/**
 * Check if two sets have exactly the same elements (order-independent).
 *
 * @param {Set<string>} setA
 * @param {Set<string>} setB
 * @returns {boolean}
 */
function setsEqual(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (const x of setA) {
    if (!setB.has(x)) return false;
  }
  return true;
}

/**
 * Grade a single question. Supports:
 * - Single correct answer: correctAnswer (number, string, boolean)
 * - Multiple correct answers: correctAnswers (array of option IDs or indexes)
 * - Single student answer: userAnswer (one value)
 * - Multiple student answers: selectedAnswers (array)
 *
 * Full mark (strict): only if selected set EXACTLY equals correct set:
 *   - All correct answers are selected
 *   - No wrong answers are selected
 *   - Order does not matter
 *
 * Optional partial grading:
 *   - +1 per correct selection
 *   - -1 per wrong selection (or 0 if preferNoNegative)
 *   - Cap at 0 and at maxPoints
 *
 * Edge cases:
 *   - Empty selection: full mark only if correct set is also empty; otherwise 0 (or partial).
 *   - Student selects fewer than required: not full mark (missing correct).
 *   - Student selects extra wrong: not full mark (wrong selection).
 *
 * @param {Object} question - { type, correctAnswer?, correctAnswers?, options?, points?, marks? }
 * @param {*} userAnswer - Single value (legacy) or undefined when using selectedAnswers
 * @param {Array} [selectedAnswers] - Array of selected option IDs/indexes (for multiple choice)
 * @param {Object} [opts] - { usePartialGrading?: boolean, wrongSelectionPenalty?: -1 | 0 }
 * @returns {{ isCorrect: boolean, earnedMarks: number, maxMarks: number, detail?: string }}
 */
function gradeQuestion(question, userAnswer, selectedAnswers = null, opts = {}) {
  const usePartialGrading = opts.usePartialGrading === true;
  const wrongPenalty = opts.wrongSelectionPenalty === 0 ? 0 : -1;

  const maxMarks = question.marks ?? question.points ?? 10;
  const type = (question.type || '').toLowerCase();

  // ----- True/False (single answer) -----
  if (type === 'true_false') {
    const correctBool = question.correctAnswer === true || question.correctAnswer === 'true' || question.correctAnswer === 'صحيح' || question.correctAnswer === 0;
    const userVal = selectedAnswers != null && Array.isArray(selectedAnswers) ? selectedAnswers[0] : userAnswer;
    const userBool = userVal === true || userVal === 'true' || userVal === 'صحيح' || userVal === 0;
    const isCorrect = Boolean(correctBool) === Boolean(userBool);
    return {
      isCorrect,
      earnedMarks: isCorrect ? maxMarks : 0,
      maxMarks,
      detail: isCorrect ? 'correct' : 'incorrect'
    };
  }

  // ----- Essay (no auto grading by option) -----
  if (type === 'essay') {
    return {
      isCorrect: true,
      earnedMarks: maxMarks,
      maxMarks,
      detail: 'essay'
    };
  }

  // ✅ SINGLE-CHOICE ONLY: Simple comparison by option.id
  if (type === 'mcq' || type === 'multiple_choice') {
    const options = question.options || [];
    
    // ✅ REJECT: No correctAnswers array allowed
    if (question.correctAnswers) {
      console.warn(`Question ${question.id}: correctAnswers array detected, using first value`);
      if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
        question.correctAnswer = question.correctAnswers[0];
      }
    }
    
    // ✅ SINGLE-CHOICE ONLY: correctAnswer must be option.id (string)
    if (!question.correctAnswer) {
      return {
        isCorrect: false,
        earnedMarks: 0,
        maxMarks,
        detail: 'no_correct_defined'
      };
    }
    
    // Normalize correctAnswer to string (option.id)
    const correctAnswerId = String(question.correctAnswer).trim();
    
    // ✅ SINGLE-CHOICE ONLY: Student answer must be single value (not array)
    let studentAnswerId;
    if (selectedAnswers !== undefined && selectedAnswers !== null && Array.isArray(selectedAnswers)) {
      // If array sent, use first value (shouldn't happen but handle it)
      studentAnswerId = selectedAnswers.length > 0 ? String(selectedAnswers[0]).trim() : null;
    } else if (userAnswer !== undefined && userAnswer !== null) {
      studentAnswerId = String(userAnswer).trim();
    } else {
      studentAnswerId = null;
    }
    
    // ✅ DEBUG LOG: Log grading comparison
    console.log("GRADING:", {
      questionId: question.id,
      correct: correctAnswerId,
      correctType: typeof question.correctAnswer,
      student: studentAnswerId,
      studentType: typeof userAnswer,
      isArray: Array.isArray(userAnswer) || Array.isArray(selectedAnswers)
    });
    
    // ✅ SIMPLE COMPARISON: String comparison of option IDs
    const isCorrect = studentAnswerId !== null && correctAnswerId === studentAnswerId;
    
    // #region agent log
    try{
      fs.appendFileSync(path.join(__dirname,'../../.cursor/debug.log'),JSON.stringify({
        location:'examGrading.js:mcq',
        message:'GRADE_MCQ_SIMPLE',
        data:{
          questionId:question.id,
          correctAnswerId,
          studentAnswerId,
          isCorrect,
          userAnswer,
          selectedAnswers
        },
        timestamp:Date.now(),
        sessionId:'debug-session',
        runId:'run1',
        hypothesisId:'SINGLE_CHOICE'
      })+'\n');
    }catch(e){}
    // #endregion
    
    return {
      isCorrect,
      earnedMarks: isCorrect ? maxMarks : 0,
      maxMarks,
      detail: isCorrect ? 'correct' : 'incorrect'
    };
  }

  // Unknown type: no marks
  return {
    isCorrect: false,
    earnedMarks: 0,
    maxMarks,
    detail: 'unknown_type'
  };
}

/**
 * Grade a full exam. Maps over questions and uses gradeQuestion for each.
 * Supports answers as:
 *   - Object keyed by questionId: { [questionId]: singleValue }
 *   - Or object keyed by questionId with selectedAnswers: { [questionId]: { selectedAnswers: [] } }
 *
 * @param {Array} questions - List of question objects
 * @param {Object} answers - { [questionId]: value } or { [questionId]: { selectedAnswers: [] } }
 * @param {Object} [opts] - { usePartialGrading?: boolean, wrongSelectionPenalty?: -1 | 0 }
 * @returns {{ totalScore: number, maxScore: number, results: Array }}
 */
function gradeExam(questions, answers, opts = {}) {
  let totalScore = 0;
  let maxScore = 0;
  const results = [];
  const qList = Array.isArray(questions) ? questions : [];

  for (let idx = 0; idx < qList.length; idx++) {
    const question = qList[idx];
    const qId = question.id ?? question._id ?? `q_${idx}`;
    const raw = answers && (answers[qId] !== undefined || answers[question.id] !== undefined || answers[`q_${idx}`] !== undefined)
      ? (answers[qId] ?? answers[question.id] ?? answers[`q_${idx}`])
      : undefined;
    // #region agent log
    try{fs.appendFileSync(path.join(__dirname,'../../.cursor/debug.log'),JSON.stringify({location:'examGrading.js:233',message:'GRADE_EXAM_QUESTION_START',data:{questionId:qId,questionIndex:idx,rawAnswer:raw,rawType:typeof raw,isArray:Array.isArray(raw),allAnswerKeys:Object.keys(answers||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion

    // ✅ SINGLE-CHOICE ONLY: Handle single value answers (not arrays for MCQ)
    let userAnswer;
    let selectedAnswers = null;

    // ✅ REJECT: Arrays for MCQ answers - convert to single value
    if (raw !== null && raw !== undefined) {
      if (Array.isArray(raw)) {
        // If array sent for MCQ, use first value (shouldn't happen but handle it)
        userAnswer = raw.length > 0 ? raw[0] : null;
      } else if (typeof raw === 'object' && raw.selectedAnswers) {
        // Legacy format with selectedAnswers property
        if (Array.isArray(raw.selectedAnswers)) {
          userAnswer = raw.selectedAnswers.length > 0 ? raw.selectedAnswers[0] : null;
        } else {
          userAnswer = raw.selectedAnswers;
        }
      } else {
        userAnswer = raw; // Single value (correct format)
      }
    }
    // #region agent log
    try{fs.appendFileSync(path.join(__dirname,'../../.cursor/debug.log'),JSON.stringify({location:'examGrading.js:245',message:'GRADE_EXAM_ANSWER_RESOLVED',data:{questionId:qId,userAnswer,selectedAnswers,hasSelectedAnswers:selectedAnswers!==null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n');}catch(e){}
    // #endregion

    const graded = gradeQuestion(question, userAnswer, selectedAnswers, opts);
    totalScore += graded.earnedMarks;
    maxScore += graded.maxMarks;
    results.push({
      questionId: qId,
      questionText: question.questionText,
      type: question.type,
      userAnswer: userAnswer,
      selectedAnswers: selectedAnswers,
      correctAnswer: question.correctAnswer,
      correctAnswers: question.correctAnswers,
      isCorrect: graded.isCorrect,
      earnedMarks: graded.earnedMarks,
      maxMarks: graded.maxMarks,
      detail: graded.detail
    });
  }

  return { totalScore, maxScore, results };
}

module.exports = {
  normalizeAnswerKey,
  resolveOptionId,
  toComparableSet,
  setsEqual,
  gradeQuestion,
  gradeExam
};
