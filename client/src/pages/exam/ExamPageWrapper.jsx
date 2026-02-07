import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InternalExamInterface from '../../components/student/InternalExamInterface';

/**
 * ExamPageWrapper - Standalone page wrapper for InternalExamInterface.
 * Extracts URL params (courseId, examId) and passes them as props.
 * Used for both /exam/:courseId/:examId and /courses/:courseId/exams/:examId routes.
 */
const ExamPageWrapper = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();

  const handleExamComplete = (result) => {
    // Stay on page to show results (InternalExamInterface handles result display)
    console.log('Exam completed:', result);
  };

  const handleBack = () => {
    if (courseId) {
      navigate(`/courses/${courseId}/content`);
    } else {
      navigate(-1);
    }
  };

  if (!courseId || !examId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold mb-2">خطأ</h2>
          <p className="text-gray-500">معرف الدورة أو الامتحان غير صالح</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <InternalExamInterface
        courseId={courseId}
        examId={examId}
        onExamComplete={handleExamComplete}
        onBack={handleBack}
      />
    </div>
  );
};

export default ExamPageWrapper;
