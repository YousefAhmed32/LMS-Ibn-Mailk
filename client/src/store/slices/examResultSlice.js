import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async thunks
export const submitExamResult = createAsyncThunk(
  'examResult/submitExamResult',
  async (examData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/exam-results/submit', examData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getStudentCourseResults = createAsyncThunk(
  'examResult/getStudentCourseResults',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/exam-results/course/${courseId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getStudentPerformance = createAsyncThunk(
  'examResult/getStudentPerformance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/exam-results/performance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getExamResult = createAsyncThunk(
  'examResult/getExamResult',
  async (resultId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/exam-results/${resultId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateExamResult = createAsyncThunk(
  'examResult/updateExamResult',
  async ({ resultId, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/exam-results/${resultId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteExamResult = createAsyncThunk(
  'examResult/deleteExamResult',
  async (resultId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/exam-results/${resultId}`);
      return { resultId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getParentDashboardData = createAsyncThunk(
  'examResult/getParentDashboardData',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/exam-results/parent/${studentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  results: [],
  performance: null,
  parentDashboardData: null,
  loading: false,
  submitting: false,
  error: null,
  success: null
};

const examResultSlice = createSlice({
  name: 'examResult',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit exam result
      .addCase(submitExamResult.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(submitExamResult.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = action.payload.message;
        
        // Add or update the result in the results array
        const existingIndex = state.results.findIndex(
          result => result.examId === action.payload.data.examId && 
                   result.courseId === action.payload.data.courseId
        );
        
        if (existingIndex !== -1) {
          state.results[existingIndex] = action.payload.data;
        } else {
          state.results.push(action.payload.data);
        }
      })
      .addCase(submitExamResult.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Get student course results
      .addCase(getStudentCourseResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentCourseResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
      })
      .addCase(getStudentCourseResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get student performance
      .addCase(getStudentPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.performance = action.payload.data;
      })
      .addCase(getStudentPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get exam result
      .addCase(getExamResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExamResult.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific result in the results array
        const index = state.results.findIndex(result => result._id === action.payload.data._id);
        if (index !== -1) {
          state.results[index] = action.payload.data;
        } else {
          state.results.push(action.payload.data);
        }
      })
      .addCase(getExamResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update exam result
      .addCase(updateExamResult.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateExamResult.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = action.payload.message;
        
        // Update the result in the results array
        const index = state.results.findIndex(result => result._id === action.payload.data._id);
        if (index !== -1) {
          state.results[index] = action.payload.data;
        }
      })
      .addCase(updateExamResult.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Delete exam result
      .addCase(deleteExamResult.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteExamResult.fulfilled, (state, action) => {
        state.submitting = false;
        state.success = action.payload.message;
        
        // Remove the result from the results array
        state.results = state.results.filter(result => result._id !== action.payload.resultId);
      })
      .addCase(deleteExamResult.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Get parent dashboard data
      .addCase(getParentDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getParentDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.parentDashboardData = action.payload.data;
      })
      .addCase(getParentDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, clearMessages } = examResultSlice.actions;

// Selectors
export const selectExamResults = (state) => state.examResult.results;
export const selectExamPerformance = (state) => state.examResult.performance;
export const selectParentDashboardData = (state) => state.examResult.parentDashboardData;
export const selectExamResultLoading = (state) => state.examResult.loading;
export const selectExamResultSubmitting = (state) => state.examResult.submitting;
export const selectExamResultError = (state) => state.examResult.error;
export const selectExamResultSuccess = (state) => state.examResult.success;

// Helper selectors
export const selectExamResultByExamId = (examId) => (state) => 
  state.examResult.results.find(result => result.examId === examId);

export const selectExamResultsByCourseId = (courseId) => (state) => 
  state.examResult.results.filter(result => result.courseId === courseId);

export default examResultSlice.reducer;

