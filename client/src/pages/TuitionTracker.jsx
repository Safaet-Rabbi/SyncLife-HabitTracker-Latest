import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, fetchDashboardStats, setSelectedStudentId } from '../features/tuition/tuitionSlice'; // Added setSelectedStudentId
import StatsWidget from '../components/tuition/StatsWidget';
import StudentForm from '../components/tuition/StudentForm';
import StudentCard from '../components/tuition/StudentCard';
import AttendanceCalendar from '../components/tuition/AttendanceCalendar';
import { FaPlus } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TuitionTracker = () => {
  const dispatch = useDispatch();
  const { students, isLoading, error, selectedStudentId, selectedDate } = useSelector((state) => state.tuition);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false); // New state for edit modal

  const selectedStudent = useSelector((state) =>
    state.tuition.students.find((student) => student._id === state.tuition.selectedStudentId)
  );

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        Error loading data: {error}
      </div>
    );
  }

  // Function to open edit modal
  const handleOpenEditModal = () => setShowEditStudentModal(true);

  return (
    <main className="container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />

      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tuition Tracker System</h2>

      {/* Stats Widget - Wrap in card style */}
      <div className="dashboard-card mb-6">
        <StatsWidget />
      </div>

      {/* Student List Section - Main Content Card */}
      <div className="tab-content active">
        <div className="habits-header mb-6">
          <h2>Students</h2>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="btn-primary"
          >
            <FaPlus className="mr-2" /> Add Student
          </button>
        </div>

        <div className="habits-list">
          {isLoading && students.length === 0 ? (
            <div className="empty-state">
              <h3>Loading students...</h3>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <h3>No students added yet.</h3>
              <p>Click "Add Student" to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <StudentCard key={student._id} student={student} onOpenEditModal={handleOpenEditModal} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Calendar - Wrap in card style */}
      <div className="dashboard-card mt-6">
        <AttendanceCalendar />
      </div>

      {/* StudentForm for adding */}
      <StudentForm isOpen={showAddStudentModal} onClose={() => setShowAddStudentModal(false)} />

      {/* StudentForm for editing */}
      {selectedStudent && (
        <StudentForm
          isOpen={showEditStudentModal}
          onClose={() => {
            setShowEditStudentModal(false);
            dispatch(setSelectedStudentId(null)); // Clear selected student when closing edit modal
          }}
          studentToEdit={selectedStudent}
        />
      )}
    </main>
  );
};

export default TuitionTracker;
