/**
 * @deprecated This controller is deprecated. Use ../examController.js instead.
 * All exam logic has been consolidated into the main examController.
 * This file re-exports from the consolidated controller for backward compatibility.
 */
const examController = require('../examController');

module.exports = {
  getExamForTaking: examController.getExamForTaking,
  submitExam: examController.submitExam,
  getExamResults: examController.getExamResults,
  getStudentExamPerformance: examController.getStudentExamPerformance,
  getCourseExams: examController.getCourseExams,
  getExamResult: examController.getExamResult,
  getExamSubmission: examController.getExamSubmission
};
