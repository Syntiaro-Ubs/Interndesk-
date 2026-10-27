import express from 'express';
import { getAllCompanies, getCompanyById, updateCompanyProfile, getCompanyAnalytics } from '../controllers/companyController.js';

const router = express.Router();

router.get('/analytics', getCompanyAnalytics);
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompanyProfile);
router.put('/', updateCompanyProfile);

export default router;
