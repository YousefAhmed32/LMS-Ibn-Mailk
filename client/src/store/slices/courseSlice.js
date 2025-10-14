import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllCoursesService, getMyEnrolledCoursesService, getCourseByIdService } from '../../services/courseService';

// Async thunks
export const fetchAllCourses = createAsyncThunk(
  'courses/fetchAllCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllCoursesService();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyCourses = createAsyncThunk(
  'courses/fetchMyCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyEnrolledCoursesService();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await getCourseByIdService(courseId);
      return response.course || response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch course');
    }
  }
);

const initialState = {
  allCourses: [],
  myCourses: [],
  enrolledCourses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
    updateEnrolledCourses: (state, action) => {
      state.enrolledCourses = action.payload;
    },
    updateLessonProgress: (state, action) => {
      const { courseId, lessonId, progress } = action.payload;
      if (state.currentCourse && state.currentCourse._id === courseId) {
        const lessonIndex = state.currentCourse.lessons.findIndex(lesson => lesson.id === lessonId);
        if (lessonIndex !== -1) {
          state.currentCourse.lessons[lessonIndex].progress = progress;
        }
      }
    },
    updateQuizResult: (state, action) => {
      const { courseId, lessonId, quizResult } = action.payload;
      if (state.currentCourse && state.currentCourse._id === courseId) {
        const lessonIndex = state.currentCourse.lessons.findIndex(lesson => lesson.id === lessonId);
        if (lessonIndex !== -1) {
          state.currentCourse.lessons[lessonIndex].quizResult = quizResult;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.allCourses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my courses
      .addCase(fetchMyCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.myCourses = action.payload;
      })
      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setLoading, 
  setCurrentCourse, 
  updateEnrolledCourses, 
  updateLessonProgress, 
  updateQuizResult 
} = courseSlice.actions;

// Selectors
export const selectAllCourses = (state) => state.courses.allCourses;
export const selectMyCourses = (state) => state.courses.myCourses;
export const selectEnrolledCourses = (state) => state.courses.enrolledCourses;
export const selectCurrentCourse = (state) => state.courses.currentCourse;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesError = (state) => state.courses.error;

export default courseSlice.reducer;
