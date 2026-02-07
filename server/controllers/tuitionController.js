const Student = require('../models/Student');
const { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } = require('date-fns');

// @desc    Add a new student
// @route   POST /api/tuition/add-student
// @access  Private (You might add authentication later)
exports.addStudent = async (req, res) => {
  try {
    const { name, className, subjectCount, location, monthlyFee, joinedDate } = req.body;

    const student = new Student({
      name,
      className,
      subjectCount,
      location,
      monthlyFee,
      joinedDate: joinedDate || Date.now(), // Use provided date or current date
    });

    await student.save();
    res.status(201).json({ message: 'Student added successfully', student });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Fetch all students with attendance stats
// @route   GET /api/tuition/get-students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    let students = await Student.find({});

    // Calculate total present days for each student
    students = students.map(student => {
      const totalPresentDays = student.attendanceRecords.filter(
        record => record.status === true
      ).length;

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const endOfCurrentMonth = endOfMonth(now);

      const monthlyPresentDays = student.attendanceRecords.filter(
        record => record.status === true &&
                  new Date(record.date) >= startOfCurrentMonth &&
                  new Date(record.date) <= endOfCurrentMonth
      ).length;

      return { ...student._doc, totalPresentDays, monthlyPresentDays }; // Attach both
    });

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle attendance for a specific student on a specific date
// @route   PUT /api/tuition/mark-attendance
// @access  Private
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body; // status is optional, if not provided, toggle

    if (!studentId || !date) {
      return res.status(400).json({ message: 'Student ID and date are required.' });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const attendanceDate = new Date(date);
    let recordFound = false;

    // Find and update the attendance record for the given date
    student.attendanceRecords = student.attendanceRecords.map(record => {
      if (isSameDay(new Date(record.date), attendanceDate)) {
        recordFound = true;
        return { ...record._doc, status: status !== undefined ? status : !record.status }; // Toggle or set status
      }
      return record;
    });

    // If no record found for the date, add a new one
    if (!recordFound) {
      student.attendanceRecords.push({
        date: attendanceDate,
        status: status !== undefined ? status : true, // Default to present if adding new
      });
    }

    await student.save();
    res.status(200).json({ message: 'Attendance updated successfully', student });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Calculate Total Students, Total Teaching Days this month
// @route   GET /api/tuition/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // Find all attendance records within the current month that are marked as true (present)
    const attendanceThisMonth = await Student.aggregate([
      { $unwind: '$attendanceRecords' },
      {
        $match: {
          'attendanceRecords.date': { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
          'attendanceRecords.status': true,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$attendanceRecords.date' } }, // Group by unique date string
        },
      },
    ]);

    const totalTeachingDaysThisMonth = attendanceThisMonth.length;

    res.status(200).json({
      totalStudents,
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
