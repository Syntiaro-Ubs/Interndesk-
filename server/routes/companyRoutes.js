import express from 'express';
import { getAllCompanies, getCompanyById, updateCompanyProfile } from '../controllers/companyController.js';

const router = express.Router();

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompanyProfile);
router.put('/', updateCompanyProfile);

export default router;
