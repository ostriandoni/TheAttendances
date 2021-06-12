const router = require('express').Router();
const passportConfig = require('../config/passport');
const userController = require('../controllers/user');

router.get('/', passportConfig.isAuthenticated, userController.getAccount);
router.get('/verify', passportConfig.isAuthenticated, userController.getVerifyEmail);
router.get('/verify/:token', passportConfig.isAuthenticated, userController.getVerifyEmailToken);
router.post('/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
router.post('/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
router.post('/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
router.get('/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

module.exports = router;
