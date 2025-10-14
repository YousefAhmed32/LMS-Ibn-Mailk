import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async thunks for payment operations

// Submit payment proof
export const submitPayment = createAsyncThunk(
  'payments/submitPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('courseId', paymentData.courseId);
      formData.append('studentName', paymentData.studentName);
      formData.append('studentPhone', paymentData.studentPhone);
      formData.append('amount', paymentData.amount);
      if (paymentData.transactionId) {
        formData.append('transactionId', paymentData.transactionId);
      }
      formData.append('screenshot', paymentData.screenshot);

      const response = await axiosInstance.post('/api/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to submit payment');
    }
  }
);

// Get all payments (Admin)
export const fetchAllPayments = createAsyncThunk(
  'payments/fetchAllPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await axiosInstance.get(`/api/admin/all?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch payments');
    }
  }
);

// Get student's payments
export const fetchStudentPayments = createAsyncThunk(
  'payments/fetchStudentPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);

      const response = await axiosInstance.get(`/api/my-payments?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch student payments');
    }
  }
);

// Accept payment (Admin)
export const acceptPayment = createAsyncThunk(
  'payments/acceptPayment',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/${paymentId}/accept`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to accept payment');
    }
  }
);

// Reject payment (Admin)
export const rejectPayment = createAsyncThunk(
  'payments/rejectPayment',
  async ({ paymentId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/${paymentId}/reject`, {
        rejectionReason: rejectionReason || 'Payment rejected by admin'
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reject payment');
    }
  }
);

// Get payment statistics (Admin)
export const fetchPaymentStats = createAsyncThunk(
  'payments/fetchPaymentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch payment stats');
    }
  }
);

// Initial state
const initialState = {
  // All payments (Admin view)
  allPayments: [],
  allPaymentsLoading: false,
  allPaymentsError: null,
  
  // Student payments
  studentPayments: [],
  studentPaymentsLoading: false,
  studentPaymentsError: null,
  
  // Payment statistics
  stats: {
    totalPayments: 0,
    totalAmount: 0,
    acceptedAmount: 0,
    pendingAmount: 0,
    rejectedAmount: 0
  },
  statsLoading: false,
  statsError: null,
  
  // Submit payment
  submitLoading: false,
  submitError: null,
  submitSuccess: false,
  
  // Action states
  actionLoading: {},
  actionError: {},
  
  // Pagination
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },
  
  // Filters
  filters: {
    status: 'all',
    search: ''
  }
};

// Payment slice
const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.allPaymentsError = null;
      state.studentPaymentsError = null;
      state.statsError = null;
      state.submitError = null;
      state.actionError = {};
    },
    
    // Clear submit success
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        search: ''
      };
    },
    
    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Clear action loading
    clearActionLoading: (state, action) => {
      if (action.payload) {
        delete state.actionLoading[action.payload];
      } else {
        state.actionLoading = {};
      }
    },
    
    // Clear action error
    clearActionError: (state, action) => {
      if (action.payload) {
        delete state.actionError[action.payload];
      } else {
        state.actionError = {};
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit payment
      .addCase(submitPayment.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitPayment.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        state.submitError = null;
        // Add to student payments
        state.studentPayments.unshift(action.payload.data);
      })
      .addCase(submitPayment.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
        state.submitSuccess = false;
      })
      
      // Fetch all payments
      .addCase(fetchAllPayments.pending, (state) => {
        state.allPaymentsLoading = true;
        state.allPaymentsError = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.allPaymentsLoading = false;
        state.allPayments = action.payload.data;
        state.pagination = action.payload.pagination;
        state.allPaymentsError = null;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.allPaymentsLoading = false;
        state.allPaymentsError = action.payload;
      })
      
      // Fetch student payments
      .addCase(fetchStudentPayments.pending, (state) => {
        state.studentPaymentsLoading = true;
        state.studentPaymentsError = null;
      })
      .addCase(fetchStudentPayments.fulfilled, (state, action) => {
        state.studentPaymentsLoading = false;
        state.studentPayments = action.payload.data;
        state.studentPaymentsError = null;
      })
      .addCase(fetchStudentPayments.rejected, (state, action) => {
        state.studentPaymentsLoading = false;
        state.studentPaymentsError = action.payload;
      })
      
      // Accept payment
      .addCase(acceptPayment.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = 'accepting';
        state.actionError[action.meta.arg] = null;
      })
      .addCase(acceptPayment.fulfilled, (state, action) => {
        const paymentId = action.meta.arg;
        delete state.actionLoading[paymentId];
        delete state.actionError[paymentId];
        
        // Update payment in all payments list
        const paymentIndex = state.allPayments.findIndex(p => p._id === paymentId);
        if (paymentIndex !== -1) {
          state.allPayments[paymentIndex] = action.payload.data;
        }
        
        // Update payment in student payments list
        const studentPaymentIndex = state.studentPayments.findIndex(p => p._id === paymentId);
        if (studentPaymentIndex !== -1) {
          state.studentPayments[studentPaymentIndex] = action.payload.data;
        }
      })
      .addCase(acceptPayment.rejected, (state, action) => {
        const paymentId = action.meta.arg;
        delete state.actionLoading[paymentId];
        state.actionError[paymentId] = action.payload;
      })
      
      // Reject payment
      .addCase(rejectPayment.pending, (state, action) => {
        state.actionLoading[action.meta.arg.paymentId] = 'rejecting';
        state.actionError[action.meta.arg.paymentId] = null;
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        const paymentId = action.meta.arg.paymentId;
        delete state.actionLoading[paymentId];
        delete state.actionError[paymentId];
        
        // Update payment in all payments list
        const paymentIndex = state.allPayments.findIndex(p => p._id === paymentId);
        if (paymentIndex !== -1) {
          state.allPayments[paymentIndex] = action.payload.data;
        }
        
        // Update payment in student payments list
        const studentPaymentIndex = state.studentPayments.findIndex(p => p._id === paymentId);
        if (studentPaymentIndex !== -1) {
          state.studentPayments[studentPaymentIndex] = action.payload.data;
        }
      })
      .addCase(rejectPayment.rejected, (state, action) => {
        const paymentId = action.meta.arg.paymentId;
        delete state.actionLoading[paymentId];
        state.actionError[paymentId] = action.payload;
      })
      
      // Fetch payment stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
        state.statsError = null;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  }
});

// Export actions
export const {
  clearErrors,
  clearSubmitSuccess,
  setFilters,
  clearFilters,
  setPagination,
  clearActionLoading,
  clearActionError
} = paymentsSlice.actions;

// Selectors
export const selectAllPayments = (state) => state.payments.allPayments;
export const selectStudentPayments = (state) => state.payments.studentPayments;
export const selectPaymentStats = (state) => state.payments.stats;
export const selectSubmitLoading = (state) => state.payments.submitLoading;
export const selectSubmitError = (state) => state.payments.submitError;
export const selectSubmitSuccess = (state) => state.payments.submitSuccess;
export const selectAllPaymentsLoading = (state) => state.payments.allPaymentsLoading;
export const selectStudentPaymentsLoading = (state) => state.payments.studentPaymentsLoading;
export const selectStatsLoading = (state) => state.payments.statsLoading;
export const selectActionLoading = (state) => state.payments.actionLoading;
export const selectActionError = (state) => state.payments.actionError;
export const selectPagination = (state) => state.payments.pagination;
export const selectFilters = (state) => state.payments.filters;

// Filtered payments selector
export const selectFilteredPayments = (state) => {
  const { allPayments, filters } = state.payments;
  
  if (!filters.search && filters.status === 'all') {
    return allPayments;
  }
  
  return allPayments.filter(payment => {
    const matchesSearch = !filters.search || 
      payment.studentName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.studentPhone?.includes(filters.search) ||
      payment.courseId?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || payment.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });
};

// Payment by ID selector
export const selectPaymentById = (state, paymentId) => {
  return state.payments.allPayments.find(payment => payment._id === paymentId) ||
         state.payments.studentPayments.find(payment => payment._id === paymentId);
};

// Student payment by course ID selector
export const selectStudentPaymentByCourseId = (state, courseId) => {
  return state.payments.studentPayments.find(payment => 
    payment.courseId?._id === courseId || payment.courseId === courseId
  );
};

export default paymentsSlice.reducer;
