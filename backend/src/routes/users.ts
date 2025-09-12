import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  getUserOrders, 
  getOrderDetails 
} from '../controllers/userController';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, getProfile);

// Update user profile
router.put('/profile', [
  authenticate,
  body('full_name').trim().isLength({ min: 1 }).withMessage('Full name is required'),
  body('mobile').optional().trim().matches(/^\+234\d{10}$|^$/).withMessage('Mobile number must be in format +234xxxxxxxxxx (10 digits after +234)'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('postal_code').optional().trim()
], updateProfile);

// Change password
router.put('/password', [
  authenticate,
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], changePassword);

// Get user orders
router.get('/orders', authenticate, getUserOrders);

// Get single order details
router.get('/orders/:orderId', authenticate, getOrderDetails);

export default router;