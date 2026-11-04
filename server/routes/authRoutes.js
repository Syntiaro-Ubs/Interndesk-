import express from 'express';
import { register, login, me, verifyEmail, logout, sendOtp, verifyOtpCode, getProfile, updateProfile, getPublicProfile } from '../controllers/authController.js';
import { uploadSingleImage, handlePhotoUpload } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.post('/verify-email', verifyEmail);
router.post('/logout', logout);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtpCode);

// Per-user profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-photo', uploadSingleImage, handlePhotoUpload);
router.get('/public-profile/:id', getPublicProfile);

export default router;
