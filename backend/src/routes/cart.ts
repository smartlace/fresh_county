import express from 'express';
import { body, param } from 'express-validator';
import { optionalAuth } from '../middleware/auth';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  calculateTotals
} from '../controllers/cartController';

const router = express.Router();

// Session middleware to handle guest carts
const sessionMiddleware = (req: any, res: any, next: any) => {
  // Generate session ID for guest users if not authenticated
  if (!req.user && !req.session_id) {
    req.session_id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session ID in cookie for 24 hours
    res.cookie('guest_session_id', req.session_id, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  } else if (!req.user && req.cookies?.guest_session_id) {
    req.session_id = req.cookies.guest_session_id;
  }
  
  next();
};

// Apply session middleware to all cart routes
router.use(sessionMiddleware);

// Get cart contents
router.get('/', optionalAuth, getCart);

// Add item to cart
router.post('/add', optionalAuth, [
  body('product_id').isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('quantity').optional().isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100'),
  body('attributes').optional().isObject().withMessage('Attributes must be an object')
], addToCart);

// Update cart item quantity
router.put('/items/:id', optionalAuth, [
  param('id').isInt({ min: 1 }).withMessage('Cart item ID must be a positive integer'),
  body('quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100')
], updateCartItem);

// Remove item from cart
router.delete('/items/:id', optionalAuth, [
  param('id').isInt({ min: 1 }).withMessage('Cart item ID must be a positive integer')
], removeFromCart);

// Clear entire cart
router.delete('/clear', optionalAuth, clearCart);

// Apply coupon to cart
router.post('/coupon', optionalAuth, [
  body('coupon_code').trim().isLength({ min: 3, max: 50 }).withMessage('Coupon code must be between 3 and 50 characters')
], applyCoupon);

// Calculate cart totals for provided items (no auth required for public cart calculations)
router.post('/calculate-totals', [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.price').isNumeric().withMessage('Item price must be numeric'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be a positive integer')
], calculateTotals);

export default router;