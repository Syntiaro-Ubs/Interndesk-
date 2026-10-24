import express from 'express';
import { register, login, me, verifyEmail, logout, sendOtp, verifyOtpCode } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.post('/verify-email', verifyEmail);
router.post('/logout', logout);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpCode);

export default router;
