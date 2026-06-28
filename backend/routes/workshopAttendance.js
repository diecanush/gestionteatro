import express from 'express';
import {
  getAttendanceByWorkshop,
  getStudentAttendance,
  recordAttendance,
  updateAttendance,
  deleteAttendance,
  getClassDays,
  getAttendanceSummary,
} from '../controllers/workshopAttendanceController.js';

const router = express.Router({ mergeParams: true });

// Base path: /api/workshops/:workshopId/attendance

// Get class days for a workshop
router.get('/class-days', getClassDays);

// Get attendance summary
router.get('/summary', getAttendanceSummary);

// Get attendance for a specific student
router.get('/student/:studentId', getStudentAttendance);

// Get all attendance (main endpoint)
router.get('/', getAttendanceByWorkshop);

// Record attendance for a date
router.post('/', recordAttendance);

// Update a specific attendance record
router.put('/record/:attendanceId', updateAttendance);

// Delete an attendance record
router.delete('/record/:attendanceId', deleteAttendance);

export default router;
