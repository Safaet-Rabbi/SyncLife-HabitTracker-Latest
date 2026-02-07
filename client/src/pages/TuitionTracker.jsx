import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, fetchDashboardStats } from '../features/tuition/tuitionSlice';
import StatsWidget from '../components/tuition/StatsWidget';
import StudentForm from '../components/tuition/StudentForm';
import StudentCard from '../components/tuition/StudentCard';
import AttendanceCalendar from '../components/tuition/AttendanceCalendar';
import { PlusCircle } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TuitionTracker = () => {
  const dispatch = useDispatch();
  const { students, isLoading, error, selectedStudentId, selectedDate } = useSelector((state) => state.tuition);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500 dark:text-red-400">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <main className="container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />

      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">Tuition Tracker System</h2>

      <StatsWidget />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List and Add Student */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Students</h2>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="btn-primary"
            >
              <PlusCircle className="mr-2" size={20} /> Add Student
            </button>
          </div>

          {isLoading && students.length === 0 ? (
            <div className="text-center p-4">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center p-4 text-gray-600 dark:text-gray-300">No students added yet. Click "Add Student" to begin.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>
          )}
        </div>

        {/* Attendance Calendar */}
        <div>
          <AttendanceCalendar />
        </div>
      </div>

      <StudentForm isOpen={showAddStudentModal} onClose={() => setShowAddStudentModal(false)} />
    </main>
  );
};

export default TuitionTracker;
