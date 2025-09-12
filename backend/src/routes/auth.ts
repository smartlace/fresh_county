import express from 'express';
import { body } from 'express-validator';
import { authLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import {
  register,
  login,
  adminLogin,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getProfile,
  changePassword,
  checkEmailExists
} from '../controllers/authController';

const router = express.Router();

// Check if email exists (for frontend validation)
router.post('/check-email',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  checkEmailExists
);

// Register route with validation
router.post('/register', 
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name is required'),
    body('mobile').optional().isMobilePhone('any').withMessage('Valid mobile number is required'),
  ],
  register
);

// Login route with validation
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Admin login route with validation - only for admin, manager, staff roles
router.post('/admin-login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  adminLogin
);

// Refresh token route
router.post('/refresh', refreshToken);

// Logout route
router.post('/logout', logout);

// Forgot password route
router.post('/forgot-password',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  forgotPassword
);

// Reset password route
router.post('/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  resetPassword
);

// Email verification route
router.get('/verify-email/:token', verifyEmail);

// Get current user profile (protected route)
router.get('/profile', authenticate, getProfile);

// Change password route (protected)
router.put('/change-password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  changePassword
);

export default router;