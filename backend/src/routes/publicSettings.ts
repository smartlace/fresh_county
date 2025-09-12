import { Router } from 'express';
import { getPublicBankDetails } from '../controllers/publicSettingsController';

const router = Router();

// Get bank details for payment modal - no authentication required
router.get('/bank-details', getPublicBankDetails);

export default router;