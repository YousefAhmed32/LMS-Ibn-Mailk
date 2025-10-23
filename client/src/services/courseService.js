import axiosInstance from "../api/axiosInstance";

// Course Services
export async function createCourseService(courseData) {
  try {
    const { data } = await axiosInstance.post("/api/courses", courseData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function getAllCoursesService(params = {}) {
  try {
    const { data } = await axiosInstance.get("/api/courses", { params });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function getCourseByIdService(courseId) {
  try {
    const { data } = await axiosInstance.get(`/api/courses/${courseId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function updateCourseService(courseId, updateData) {
  try {
    const { data } = await axiosInstance.patch(`/api/courses/${courseId}`, updateData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function deleteCourseService(courseId) {
  try {
    const { data } = await axiosInstance.delete(`/api/courses/${courseId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function deactivateCourseService(courseId) {
  try {
    const { data } = await axiosInstance.patch(`/api/courses/${courseId}/deactivate`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function getMyCoursesService(params = {}) {
  try {
    const { data } = await axiosInstance.get("/api/courses/creator/my-courses", { params });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Utility functions
export const formatCourseDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
};

export const formatCoursePrice = (price) => {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(price);
};

// Enrollment Services
export async function enrollInCourseService(courseId, proofImage) {
  try {
    const { data } = await axiosInstance.post(`/api/courses/${courseId}/enroll`, { proofImage });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function getEnrollmentStatusService(courseId) {
  try {
    const { data } = await axiosInstance.get(`/api/courses/${courseId}/enrollment-status`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function uploadPaymentProofService(courseId, formData) {
  try {
    const { data } = await axiosInstance.post(`/api/courses/${courseId}/upload-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Upload payment proof service error:', error);
    throw error.response?.data || { error: error.message };
  }
}

export async function getMyEnrolledCoursesService() {
  try {
    const { data } = await axiosInstance.get("/api/courses/my/enrolled");
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export const getCourseFilters = () => ({
  grades: [
    { value: "Grade 7", label: "أولي إعدادي" },
    { value: "Grade 8", label: "ثاني إعدادي" },
    { value: "Grade 9", label: "ثالث إعدادي" },
    { value: "Grade 10", label: "أولي ثانوي" },
    { value: "Grade 11", label: "ثاني ثانوي" },
    { value: "Grade 12", label: "ثالث ثانوي" }
  ],
  terms: [
    { value: "Term 1", label: "Term 1" },
    { value: "Term 2", label: "Term 2" }
  ],
  subjects: [
    { value: "لغة عربية", label: "لغة عربية" }
  ]
});

// Get course content for enrolled students
export async function getCourseContentService(courseId) {
  try {
    const { data } = await axiosInstance.get(`/api/courses/${courseId}/content`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Update lesson progress
export async function updateLessonProgressService(courseId, lessonId, progressData) {
  try {
    const { data } = await axiosInstance.post(`/api/courses/${courseId}/lessons/${lessonId}/progress`, progressData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Submit quiz result
export async function submitQuizResultService(courseId, lessonId, quizData) {
  try {
    const { data } = await axiosInstance.post(`/api/courses/${courseId}/lessons/${lessonId}/quiz`, quizData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Get course details (for video page)
export async function getCourseDetailsService(courseId) {
  try {
    const { data } = await axiosInstance.get(`/api/courses/${courseId}/details`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Get user progress for a course
export async function getUserProgressService(courseId, userId) {
  try {
    const { data } = await axiosInstance.get(`/api/courses/${courseId}/progress/${userId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Update video progress
export async function updateVideoProgressService(courseId, videoId, progressData) {
  try {
    const { data } = await axiosInstance.post(`/api/courses/${courseId}/videos/${videoId}/progress`, progressData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Mark video as completed
export async function markVideoCompletedService(courseId, videoId) {
  try {
    const { data } = await axiosInstance.post(`/api/courses/${courseId}/videos/${videoId}/complete`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Get exam details
export async function getExamDetailsService(courseId, examId) {
  try {
    const { data } = await axiosInstance.get(`/api/courses/${courseId}/exams/${examId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Submit exam answers
export async function submitExamService(courseId, examId, answers) {
  try {
    const { data } = await axiosInstance.post(`/api/exams/${examId}/submit`, {
      answers,
      courseId
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Get exam results for a course
export async function getExamResultsService(courseId) {
  try {
    const { data } = await axiosInstance.get(`/api/exams/results/${courseId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Course Service Object - Main export for components
export const courseService = {
  // Course CRUD operations
  create: createCourseService,
  getAll: getAllCoursesService,
  getById: getCourseByIdService,
  update: updateCourseService,
  delete: deleteCourseService,
  deactivate: deactivateCourseService,
  getMyCourses: getMyCoursesService,
  
  // Course details and content
  getCourseDetails: getCourseDetailsService,
  getCourseContent: getCourseContentService,
  
  // Enrollment operations
  enroll: enrollInCourseService,
  getEnrollmentStatus: getEnrollmentStatusService,
  uploadPaymentProof: uploadPaymentProofService,
  getMyEnrolledCourses: getMyEnrolledCoursesService,
  
  // Progress tracking
  getUserProgress: getUserProgressService,
  updateVideoProgress: updateVideoProgressService,
  markVideoCompleted: markVideoCompletedService,
  updateLessonProgress: updateLessonProgressService,
  
  // Quiz operations
  submitQuizResult: submitQuizResultService,
  
  // Exam operations
  getExamDetails: getExamDetailsService,
  submitExam: submitExamService,
  getExamResults: getExamResultsService,
  
  // Utility functions
  formatDuration: formatCourseDuration,
  formatPrice: formatCoursePrice,
  getFilters: getCourseFilters
};
