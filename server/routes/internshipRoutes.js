import express from 'express';
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  closeInternship,
  deleteInternship,
  getCompanyInternships,
  getInternshipFilters
} from '../controllers/internshipController.js';

const router = express.Router();

router.get('/', getAllInternships);
router.get('/filters', getInternshipFilters);
router.get('/company', getCompanyInternships);
router.get('/:id', getInternshipById);
router.post('/', createInternship);
router.put('/:id', updateInternship);
router.post('/:id/close', closeInternship);
router.delete('/:id', deleteInternship);

export default router;
