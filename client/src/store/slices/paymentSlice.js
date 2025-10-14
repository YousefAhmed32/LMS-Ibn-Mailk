import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

// Async thunks
export const uploadPaymentProof = createAsyncThunk(
  'payment/uploadPaymentProof',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentService.uploadPaymentProof(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchStudentPayments = createAsyncThunk(
  'payment/fetchStudentPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.getStudentPayments(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payment/fetchPaymentById',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentById(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchStudentPaymentStats = createAsyncThunk(
  'payment/fetchStudentPaymentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getStudentPaymentStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createPayPalPayment = createAsyncThunk(
  'payment/createPayPalPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPayPalPayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createStripePayment = createAsyncThunk(
  'payment/createStripePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentService.createStripePayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'payment/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.getPaymentMethods();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const verifyPaymentStatus = createAsyncThunk(
  'payment/verifyPaymentStatus',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await paymentService.verifyPaymentStatus(paymentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  // Student payments
  studentPayments: [],
  currentPayment: null,
  paymentStats: null,
  
  // Payment methods
  paymentMethods: [],
  
  // Gateway payments
  paypalPayment: null,
  stripePayment: null,
  
  // UI state
  loading: false,
  uploading: false,
  error: null,
  
  // Pagination
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  }
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUploading: (state, action) => {
      state.uploading = action.payload;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    clearGatewayPayments: (state) => {
      state.paypalPayment = null;
      state.stripePayment = null;
    },
    updatePaymentStatus: (state, action) => {
      const { paymentId, status } = action.payload;
      const payment = state.studentPayments.find(p => p._id === paymentId);
      if (payment) {
        payment.status = status;
      }
      if (state.currentPayment && state.currentPayment._id === paymentId) {
        state.currentPayment.status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload payment proof
      .addCase(uploadPaymentProof.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadPaymentProof.fulfilled, (state, action) => {
        state.uploading = false;
        state.studentPayments.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(uploadPaymentProof.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      
      // Fetch student payments
      .addCase(fetchStudentPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.studentPayments = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchStudentPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch payment by ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch student payment stats
      .addCase(fetchStudentPaymentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentPaymentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStats = action.payload;
      })
      .addCase(fetchStudentPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create PayPal payment
      .addCase(createPayPalPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayPalPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paypalPayment = action.payload;
      })
      .addCase(createPayPalPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Stripe payment
      .addCase(createStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStripePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.stripePayment = action.payload;
      })
      .addCase(createStripePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch payment methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Verify payment status
      .addCase(verifyPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update payment status in the list
        const payment = state.studentPayments.find(p => p._id === action.payload.paymentId);
        if (payment) {
          payment.status = action.payload.status;
        }
        if (state.currentPayment && state.currentPayment._id === action.payload.paymentId) {
          state.currentPayment.status = action.payload.status;
        }
      })
      .addCase(verifyPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setLoading,
  setUploading,
  clearCurrentPayment,
  clearGatewayPayments,
  updatePaymentStatus
} = paymentSlice.actions;

// Selectors
export const selectStudentPayments = (state) => state.payment.studentPayments;
export const selectCurrentPayment = (state) => state.payment.currentPayment;
export const selectPaymentStats = (state) => state.payment.paymentStats;
export const selectPaymentMethods = (state) => state.payment.paymentMethods;
export const selectPayPalPayment = (state) => state.payment.paypalPayment;
export const selectStripePayment = (state) => state.payment.stripePayment;
export const selectPaymentLoading = (state) => state.payment.loading;
export const selectPaymentUploading = (state) => state.payment.uploading;
export const selectPaymentError = (state) => state.payment.error;
export const selectPaymentPagination = (state) => state.payment.pagination;

export default paymentSlice.reducer;
