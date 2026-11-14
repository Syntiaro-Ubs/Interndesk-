import express from 'express';
import {
  createResumePaymentOrder,
  handlePayUCallback,
  checkResumeEntitlement,
  authorizeResumeDownload,
  getMyPayments,
  getAdminPayments,
  updateAdminResumePrice
} from '../controllers/paymentController.js';

const router = express.Router();

// Order creation
router.post('/create-order', createResumePaymentOrder);

// PayU Webhook / Callback (receives POST form-data from PayU)
router.post('/payu-callback', express.urlencoded({ extended: true }), handlePayUCallback);

// Entitlement check for resume draft
router.get('/resume-entitlement/:draftId', checkResumeEntitlement);

// Authorization for PDF download
router.get('/download-auth/:draftId', authorizeResumeDownload);

// Student payment history
router.get('/my-payments', getMyPayments);

// Admin payments & revenue
router.get('/admin/all', getAdminPayments);

// Admin update ATS resume plan fee live
router.put('/admin/price', updateAdminResumePrice);

export default router;

