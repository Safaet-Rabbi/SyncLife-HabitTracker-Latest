import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markAttendance, setSelectedStudentId } from '../../features/tuition/tuitionSlice';
import { toast } from 'react-toastify';
import { UserRound, GraduationCap, MapPin, CalendarDays, DollarSign, CheckCircle, XCircle, Pencil, Trash2, Calendar, UserPlus } from 'lucide-react';
import { format, getDaysInMonth, isSameDay } from 'date-fns';

const StudentCard = ({ student }) => {
  const dispatch = useDispatch();
  const { isLoading, selectedDate, selectedStudentId } = useSelector((state) => state.tuition);

  const today = new Date();
  const joinedDateFormatted = format(new Date(student.joinedDate), 'MMM d, yyyy');

  // Check if attendance is marked for the selectedDate
  const attendanceRecord = student.attendanceRecords.find(record =>
    isSameDay(new Date(record.date), new Date(selectedDate))
  );
  const isPresent = attendanceRecord ? attendanceRecord.status : false;

  const handleMarkToday = async () => {
    // Determine the status to send: toggle current status or default to true if no record
    const newStatus = attendanceRecord ? !isPresent : true;
    try {
      await dispatch(markAttendance({ studentId: student._id, date: today.toISOString(), status: newStatus })).unwrap();
      toast.success(`Attendance for ${student.name} marked ${newStatus ? 'Present' : 'Absent'} for today!`);
    } catch (error) {
      toast.error(`Failed to mark attendance: ${error}`);
    }
  };

  const handleSelectStudent = () => {
    dispatch(setSelectedStudentId(student._id));
  };

  // Calculate total days in current month for progress bar
  const totalDaysInCurrentMonth = getDaysInMonth(new Date());
  const monthlyAttendancePercentage = student.monthlyPresentDays > 0
    ? ((student.monthlyPresentDays / totalDaysInCurrentMonth) * 100).toFixed(0)
    : 0;

  return (
    <div
      className={`bg-white/95 dark:bg-gray-800 backdrop-blur-md rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative ${
        student._id === selectedStudentId
          ? 'border-2 border-blue-600 dark:border-blue-400 shadow-xl' // Highlighted style
          : 'border border-transparent' // Default style
      }`}
      onClick={handleSelectStudent}
    >
      {/* Edit/Delete Icons */}
      <div className="absolute top-3 right-3 flex space-x-2">
        <button className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
          <Pencil size={18} />
        </button>
        <button className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Header - Name and Profile Icon */}
      <div className="flex items-center mb-4">
        <UserRound className="mr-3 text-blue-500 dark:text-blue-400" size={24} />
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 text-transparent bg-clip-text">
          {student.name}
        </h3>
      </div>

      {/* Details Body */}
      <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm mb-4">
        <p className="flex items-center">
          <GraduationCap className="mr-2 text-gray-500 dark:text-gray-400" size={16} />
          {student.className} ({student.subjectCount} Subjects)
        </p>
        <p className="flex items-center">
          <MapPin className="mr-2 text-gray-500 dark:text-gray-400" size={16} />
          {student.location}
        </p>
        {student.monthlyFee && (
          <p className="flex items-center text-green-600 dark:text-green-400 font-semibold">
            <DollarSign className="mr-2" size={16} />
            ${student.monthlyFee}
          </p>
        )}
        <p className="flex items-center">
          <CalendarDays className="mr-2 text-gray-500 dark:text-gray-400" size={16} />
          Joined: {joinedDateFormatted}
        </p>
      </div>

      {/* Attendance Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:space-x-4 items-start sm:items-center text-sm text-gray-700 dark:text-gray-300 mb-2">
          <p className="flex items-center flex-shrink-0 mb-1 sm:mb-0">
            <CheckCircle className="mr-1 text-green-500" size={16} /> Total Present: <span className="font-bold ml-1">{student.totalPresentDays}</span>
          </p>
          <p className="flex items-center flex-shrink-0">
            <Calendar className="mr-1 text-blue-500" size={16} />
            <span className="whitespace-nowrap">This Month: <span className="font-bold ml-1">{student.monthlyPresentDays}</span></span>
          </p>
        </div>
        {/* Monthly Attendance Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${monthlyAttendancePercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {monthlyAttendancePercentage}% attendance this month
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card's onClick from firing
            handleMarkToday();
          }}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center ${
            isPresent
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isPresent ? (
            <>
              <CheckCircle className="mr-2" size={20} /> Present Today
            </>
          ) : (
            <>
              <UserPlus className="mr-2" size={20} /> Mark Present Today
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentCard;