import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validateCoupon } from '../controllers/couponController';

const router = express.Router();

// Public coupon validation - requires authentication but not admin
router.post('/validate', [
  authenticate,
  body('code').trim().isLength({ min: 1, max: 50 }).withMessage('Coupon code must be between 1 and 50 characters'),
  body('order_amount').isFloat({ min: 0 }).withMessage('Order amount must be a positive number'),
  body('user_id').isUUID().withMessage('User ID must be a valid UUID')
], validateCoupon);

export default router;