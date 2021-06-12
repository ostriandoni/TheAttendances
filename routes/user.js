const router = require('express').Router();
const passportConfig = require('../config/passport');
const userController = require('../controllers/user');

router.use(passportConfig.isAuthenticated);
router.get('/', userController.getAccount);
router.get('/verify', userController.getVerifyEmail);
router.get('/verify/:token', userController.getVerifyEmailToken);
router.post('/profile', userController.postUpdateProfile);
router.post('/password', userController.postUpdatePassword);
router.post('/delete', userController.postDeleteAccount);
router.get('/unlink/:provider', userController.getOauthUnlink);

module.exports = router;
