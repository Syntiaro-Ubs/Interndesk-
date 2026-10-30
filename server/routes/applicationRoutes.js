import express from 'express';
import {
  applyForInternship,
  getStudentApplications,
  getCompanyApplications,
  updateApplicationStatus,
  deleteApplication,
  getApplicationMessages,
  sendApplicationMessage,
  uploadResume,
  getApplicationResume,
  streamApplicationResume,
  downloadOwnedResume
} from '../controllers/applicationController.js';

const router = express.Router();

router.get('/', getStudentApplications);
router.get('/company', getCompanyApplications);
router.post('/apply/:id', applyForInternship);
router.post('/resumes', uploadResume);
router.get('/resumes/:key', downloadOwnedResume);
router.get('/:id/resume', getApplicationResume);
router.get('/:id/resume/stream', streamApplicationResume);
router.patch('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);
router.get('/:id/messages', getApplicationMessages);
router.post('/:id/messages', sendApplicationMessage);

export default router;
