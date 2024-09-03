const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/create', loginController.create);
router.post('/login', loginController.login);
router.post('/login-mobile', loginController.loginMobile);

router.post('/google-login', loginController.googleLogin);
router.post('/google-login-mobile', loginController.googleLoginMobile);
router.post('/facebook-login', loginController.facebookLogin);

router.post('/change-password', loginController.changePassword);

router.post('/request-password-reset', loginController.requestPasswordReset);
router.post('/confirm-reset-code', loginController.confirmResetCode);
router.post('/reset-password', loginController.resetPassword);


router.post('/update-center', loginController.updateUserCenter);



module.exports = router;
