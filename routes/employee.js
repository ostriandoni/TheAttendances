const router = require('express').Router();
const passportConfig = require('../config/passport');
const employeeController = require('../controllers/employee');

router.use(passportConfig.isAuthenticated);
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/:id', employeeController.editEmployeeById);
router.post('/:id/password', employeeController.editEmployeePasswordById);
router.post('/:id/delete', employeeController.deleteEmployeeById);
router.post('/:id/clockin', employeeController.clockIn);
router.post('/:id/clockout', employeeController.clockOut);
router.get('/:id/attendance', employeeController.getEmployeeAttendance);

module.exports = router;
