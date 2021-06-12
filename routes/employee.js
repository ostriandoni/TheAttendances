const router = require('express').Router();
const passportConfig = require('../config/passport');
const employeeController = require('../controllers/employee');

router.get('/', passportConfig.isAuthenticated, employeeController.getAllEmployees);
router.get('/:id', passportConfig.isAuthenticated, employeeController.getEmployeeById);
router.post('/:id', passportConfig.isAuthenticated, employeeController.editEmployeeById);
router.post('/:id/password', passportConfig.isAuthenticated, employeeController.editEmployeePasswordById);
router.post('/:id/delete', passportConfig.isAuthenticated, employeeController.deleteEmployeeById);
router.post('/:id/clockin', passportConfig.isAuthenticated, employeeController.clockIn);
router.post('/:id/clockout', passportConfig.isAuthenticated, employeeController.clockOut);
router.get('/:id/attendance', passportConfig.isAuthenticated, employeeController.getEmployeeAttendance);

module.exports = router;
