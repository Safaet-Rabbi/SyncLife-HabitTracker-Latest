import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { markAttendance } from '../../features/tuition/tuitionSlice';
import { toast } from 'react-toastify';

const AttendanceToggleModal = ({ isOpen, onClose, student, date }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.tuition);

  if (!isOpen || !student || !date) return null;

  const attendanceDate = new Date(date);
  const formattedDate = format(attendanceDate, 'MMM d, yyyy');

  // Find attendance record for the specific student and date
  const studentAttendanceRecord = student.attendanceRecords.find(record =>
    isSameDay(new Date(record.date), attendanceDate)
  );
  const isPresent = studentAttendanceRecord ? studentAttendanceRecord.status : false;

  const handleToggle = async (status) => {
    try {
      await dispatch(markAttendance({ studentId: student._id, date: attendanceDate.toISOString(), status: status })).unwrap();
      toast.success(`${student.name}'s attendance for ${formattedDate} marked ${status ? 'Present' : 'Absent'}!`);
      onClose();
    } catch (error) {
      toast.error(`Failed to update attendance: ${error}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-sm">
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Attendance for {student.name}
          </h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-200 mb-4">
            Date: <span className="font-medium">{formattedDate}</span>
          </p>
          <p className="text-gray-700 dark:text-gray-200 mb-6">
            Current Status:{" "}
            {isPresent ? (
              <span className="inline-flex items-center text-green-600 font-medium">
                <CheckCircle className="mr-1" size={16} /> Present
              </span>
            ) : (
              <span className="inline-flex items-center text-red-600 font-medium">
                <XCircle className="mr-1" size={16} /> Absent
              </span>
            )}
          </p>
          <div className="form-actions !justify-between"> {/* Override default justify-end for space-between */}
            <button
              onClick={() => handleToggle(true)}
              className="btn-primary flex-1 !bg-green-600 !hover:bg-green-700 mr-2"
              disabled={isLoading || isPresent}
            >
              <CheckCircle size={20} className="mr-2" /> Mark Present
            </button>
            <button
              onClick={() => handleToggle(false)}
              className="btn-secondary flex-1 !bg-red-600 !hover:bg-red-700 ml-2"
              disabled={isLoading || !isPresent}
            >
              <XCircle size={20} className="mr-2" /> Mark Absent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceToggleModal;