import express from 'express';
import { getActiveShippingZones } from '../controllers/shippingZonesController';

const router = express.Router();

// Public route to get active shipping zones (no authentication required)
router.get('/', getActiveShippingZones);

export default router;