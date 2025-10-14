import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice';
import adminReducer from './slices/adminSlice';
import paymentReducer from './slices/paymentSlice';
import paymentsReducer from './slices/paymentsSlice';
import examResultReducer from './slices/examResultSlice';

export const store = configureStore({
  reducer: {
    courses: courseReducer,
    admin: adminReducer,
    payment: paymentReducer,
    payments: paymentsReducer,
    examResult: examResultReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
