import { configureStore } from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    courses: courseReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
