const router = require('express').Router();
const userController = require('../controllers/user');

router.get('/', userController.dashboard);
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/logout', userController.logout);
router.get('/forgot', userController.getForgot);
router.post('/forgot', userController.postForgot);
router.get('/reset/:token', userController.getReset);
router.post('/reset/:token', userController.postReset);
router.get('/signup', userController.getSignup);
router.post('/signup', userController.postSignup);
router.use('/account', require('./user'));
router.use('/employees', require('./employee'));

module.exports = router;
