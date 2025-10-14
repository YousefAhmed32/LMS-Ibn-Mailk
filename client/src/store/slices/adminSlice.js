import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Course Management
export const createCourse = createAsyncThunk(
  'admin/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await adminService.createCourse(courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'admin/updateCourse',
  async ({ courseId, courseData }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateCourse(courseId, courseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'admin/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteCourse(courseId);
      return { courseId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllCourses = createAsyncThunk(
  'admin/fetchAllCourses',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllCourses(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// User Management
export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUserRole(userId, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteUser(userId);
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportUsers = createAsyncThunk(
  'admin/exportUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.exportUsers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await adminService.createUser(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUser(userId, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Payment Management
export const confirmPayment = createAsyncThunk(
  'admin/confirmPayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await adminService.confirmPayment(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectPayment = createAsyncThunk(
  'admin/rejectPayment',
  async ({ paymentId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminService.rejectPayment(paymentId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Additional Admin Functions
export const fetchAdminAnalytics = createAsyncThunk(
  'admin/fetchAdminAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAnalytics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllUsers(filters);
      // Backend returns { success: true, data: users, pagination: {...} }
      // We need to return the users array from the data field
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get user by ID
export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserById(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get user courses
export const fetchUserCourses = createAsyncThunk(
  'admin/fetchUserCourses',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserCourses(userId);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get user grades
export const fetchUserGrades = createAsyncThunk(
  'admin/fetchUserGrades',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserGrades(userId);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get user activities
export const fetchUserActivities = createAsyncThunk(
  'admin/fetchUserActivities',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.getUserActivities(userId);
      return { userId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllPayments = createAsyncThunk(
  'admin/fetchAllPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllPayments(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  analytics: null,
  users: [],
  courses: [],
  payments: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalytics: (state) => {
      state.analytics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Course Management
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we're adding the course data correctly
        if (action.payload && action.payload.data) {
          state.courses.push(action.payload.data);
        } else if (action.payload) {
          state.courses.push(action.payload);
        }
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both direct payload and nested data structure
        const updatedCourse = action.payload?.data || action.payload;
        if (updatedCourse && updatedCourse._id) {
          const courseIndex = state.courses.findIndex(course => course._id === updatedCourse._id);
          if (courseIndex !== -1) {
            state.courses[courseIndex] = updatedCourse;
          } else {
            // If course not found in state, add it
            state.courses.push(updatedCourse);
          }
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = state.courses.filter(course => course._id !== action.payload.courseId);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // User Management
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const userIndex = state.users.findIndex(user => user._id === action.payload._id);
        if (userIndex !== -1) {
          state.users[userIndex] = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user._id !== action.payload.userId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Payment Management
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Update payment status if needed
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(rejectPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Update payment status if needed
      })
      .addCase(rejectPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin Analytics
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearAnalytics } = adminSlice.actions;
export default adminSlice.reducer;

// Selectors
export const selectAnalytics = (state) => state.admin.analytics;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;
export const selectUsers = (state) => state.admin.users;
export const selectCourses = (state) => state.admin.courses;
export const selectPayments = (state) => state.admin.payments;
