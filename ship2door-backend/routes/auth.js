const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);
router.post('/push-token', authenticate, authController.savePushToken);
router.get('/customers', authenticate, authorizeAdmin, authController.getAllCustomers);

module.exports = router;
