import { configureStore } from '@reduxjs/toolkit';
import tuitionReducer from '../features/tuition/tuitionSlice';

export const store = configureStore({
  reducer: {
    tuition: tuitionReducer,
    // Add other reducers here if you have them
  },
});