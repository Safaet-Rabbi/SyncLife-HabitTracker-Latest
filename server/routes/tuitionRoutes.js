const express = require('express');
const {
  addStudent,
  getStudents,
  markAttendance,
  getDashboardStats,
} = require('../controllers/tuitionController');

const router = express.Router();

router.post('/add-student', addStudent);
router.get('/get-students', getStudents);
router.put('/mark-attendance', markAttendance);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
