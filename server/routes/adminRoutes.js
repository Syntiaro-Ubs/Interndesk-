import express from 'express';
import {
  requireAdmin,
  getDashboardStats,
  getAllJobs,
  updateJobStatus,
  deleteJob,
  getAllCompanies,
  getAllStudents,
  deleteStudent,
  updateCompanyVerification,
  deleteCompany,
  seedAdmin,
  getAdminNotifications,
  markAllAdminNotificationsRead,
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
router.delete('/jobs/:id', deleteJob);
router.get('/companies', getAllCompanies);
router.patch('/companies/:id/verify', updateCompanyVerification);
router.delete('/companies/:id', deleteCompany);
router.get('/students', getAllStudents);
router.delete('/students/:id', deleteStudent);
router.get('/notifications', getAdminNotifications);
router.post('/notifications/mark-all-read', markAllAdminNotificationsRead);
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);

export default router;
