const express = require('express');
const router = express.Router();
//const controller = require('../controllers/attendance');
/*
router.get('/', controller.getAllAttendance);
router.get('/:id', controller.getAttendanceById);
router.post('/', controller.createAttendance);
router.put('/:id', controller.updateAttendance);
router.delete('/:id', controller.deleteAttendance);
*/
const attendanceController = require('../controllers/attendance'); // Ensure this line exists and the path is correct

router.get('/', attendanceController.getAttendance);
router.get('/:id', attendanceController.getAttendanceById);
router.get('/employee/:id_empleado/month/:month', attendanceController.getAttendanceByEmployeeAndMonth);
router.post('/', attendanceController.createAttendance);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;