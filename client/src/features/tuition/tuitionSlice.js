import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tuition'; // Assuming your backend runs on port 5000

// Async Thunks
export const fetchStudents = createAsyncThunk(
  'tuition/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/get-students`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addStudent = createAsyncThunk(
  'tuition/addStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/add-student`, studentData);
      return response.data.student;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markAttendance = createAsyncThunk(
  'tuition/markAttendance',
  async ({ studentId, date, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/mark-attendance`, { studentId, date, status });
      return response.data.student; // Return the updated student
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'tuition/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/dashboard-stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const tuitionSlice = createSlice({
  name: 'tuition',
  initialState: {
    students: [],
    dashboardStats: {
      totalStudents: 0,
      totalTeachingDaysThisMonth: 0,
    },
    isLoading: false,
    error: null,
    selectedStudentId: null, // To manage which student's attendance is being viewed/edited
    selectedDate: new Date().toISOString(), // For attendance calendar
  },
  reducers: {
    setSelectedStudentId: (state, action) => {
      state.selectedStudentId = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add Student
      .addCase(addStudent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students.push(action.payload); // Add new student to the list
        // Optionally, update total students stat immediately
        state.dashboardStats.totalStudents += 1;
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark Attendance
      .addCase(markAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        // Find and update the student in the state
        const updatedStudent = action.payload;
        const index = state.students.findIndex(s => s._id === updatedStudent._id);
        if (index !== -1) {
          state.students[index] = updatedStudent;
        }
        // No direct update to teaching days here, as it's a monthly aggregate
        // It will be updated when fetchDashboardStats is called.
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedStudentId, setSelectedDate } = tuitionSlice.actions;

export default tuitionSlice.reducer;
