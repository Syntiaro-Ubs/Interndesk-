import express from 'express';
import {
  requireAdmin,
  getDashboardStats,
  getAllJobs,
  updateJobStatus,
  getAllCompanies,
  getAllStudents,
  updateCompanyVerification,
  seedAdmin,
  getAdminNotifications,
  getAdminSettings,
  updateAdminSettings
} from '../controllers/adminController.js';

const router = express.Router();

// ── Public: seed first admin (secret key protected) ──────────────
router.post('/seed', seedAdmin);

// ── All other routes require admin auth ─────────────────────────
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/jobs', getAllJobs);
router.patch('/jobs/:id/status', updateJobStatus);
router.get('/companies', getAllCompanies);
router.patch('/companies/:id/verify', updateCompanyVerification);
router.get('/students', getAllStudents);
router.get('/notifications', getAdminNotifications);
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);

export default router;
