import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { format } from 'date-fns';

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
      // 'date' is now a 'yyyy-MM-dd' string (local date) from the frontend.
      // Convert it to a UTC ISO string that represents the start of that local day.
      // Example: '2026-02-23' in UTC+6 should become '2026-02-22T18:00:00.000Z'
      // This ensures the backend receives a UTC timestamp that corresponds to the local date.
      const dateForBackend = new Date(date).toISOString(); // This parses 'YYYY-MM-DD' as local, then converts to UTC ISO string.

      const response = await axios.put(`${API_URL}/mark-attendance`, { studentId, date: dateForBackend, status });
      return response.data.student; // Return the updated student
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'tuition/deleteStudent',
  async (studentId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/delete-student/${studentId}`);
      return studentId; // Return the ID of the deleted student
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateStudent = createAsyncThunk(
  'tuition/updateStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/update-student/${studentData._id}`, studentData);
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
    selectedDate: format(new Date(), 'yyyy-MM-dd'), // For attendance calendar, initialized to local YYYY-MM-DD
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
      // Delete Student
      .addCase(deleteStudent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = state.students.filter(student => student._id !== action.payload);
        state.dashboardStats.totalStudents = Math.max(0, state.dashboardStats.totalStudents - 1);
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Student
      .addCase(updateStudent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedStudent = action.payload;
        state.students = state.students.map(student =>
          student._id === updatedStudent._id ? updatedStudent : student
        );
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark Attendance
      .addCase(markAttendance.pending, (state, action) => {
        state.isLoading = true;
        state.error = null; // Clear previous errors
        const { studentId, date, status } = action.meta.arg;

        const studentToUpdate = state.students.find(s => s._id === studentId);
        if (studentToUpdate) {
          // Normalize both record.date (UTC ISO string) and date (local YYYY-MM-DD string)
          // to local YYYY-MM-DD strings for comparison.
          const formattedIncomingDate = format(new Date(date), 'yyyy-MM-dd'); // date from action.meta.arg is already local YYYY-MM-DD
          
          const existingRecordIndex = studentToUpdate.attendanceRecords.findIndex(record => {
            const recordDateObject = new Date(record.date); // record.date is UTC ISO string
            const formattedRecordDate = format(recordDateObject, 'yyyy-MM-dd');
            return formattedRecordDate === formattedIncomingDate;
          });

          // Optimistically update counts
          let monthlyChange = 0;
          let totalChange = 0;

          if (existingRecordIndex !== -1) {
            // Record exists, toggling status
            const oldStatus = studentToUpdate.attendanceRecords[existingRecordIndex].status;
            if (oldStatus !== status) { // Only if status is actually changing
              if (status === true) { // Was absent, now present
                monthlyChange = 1;
                totalChange = 1;
              } else { // Was present, now absent
                monthlyChange = -1;
                totalChange = -1;
              }
            }
            // Update the existing record
            studentToUpdate.attendanceRecords[existingRecordIndex].status = status;
          } else {
            // No existing record, adding a new one
            if (status === true) { // Marking present for the first time on this date
              studentToUpdate.attendanceRecords.push({ date, status: true });
              monthlyChange = 1;
              totalChange = 1;
            } else { // Marking absent for the first time on this date (not typical, but handled)
              // If marking absent for a date that was previously unrecorded, we still need to add the record
              // but it won't change counts.
              studentToUpdate.attendanceRecords.push({ date, status: false });
            }
          }

          // Apply changes to counts
          studentToUpdate.monthlyPresentDays = Math.max(0, (studentToUpdate.monthlyPresentDays || 0) + monthlyChange);
          studentToUpdate.totalPresentDays = Math.max(0, (studentToUpdate.totalPresentDays || 0) + totalChange);
        }
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedStudent = action.payload;
        state.students = state.students.map(student =>
          student._id === updatedStudent._id ? updatedStudent : student
        );
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
