import express from 'express';
import { body, query, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { requirePermission, Permission } from '../middleware/rbac';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponStats
} from '../controllers/couponController';

const router = express.Router();

// All coupon routes require authentication
router.use(authenticate);

// Get all coupons
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term cannot exceed 100 characters'),
  query('type').optional().isIn(['percentage', 'fixed_amount']).withMessage('Invalid coupon type'),
  query('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  query('sort_by').optional().isIn(['created_at', 'code', 'name', 'discount_value', 'used_count', 'expires_at']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC')
], requirePermission(Permission.VIEW_COUPONS), getAllCoupons);

// Get coupon statistics
router.get('/stats', [
  query('period').optional().isInt({ min: 1, max: 365 }).withMessage('Period must be between 1 and 365 days')
], requirePermission(Permission.VIEW_COUPONS), getCouponStats);

// Validate coupon
router.post('/validate', [
  body('code').trim().isLength({ min: 1, max: 50 }).withMessage('Coupon code must be between 1 and 50 characters'),
  body('order_amount').isFloat({ min: 0 }).withMessage('Order amount must be a positive number'),
  body('user_id').isUUID().withMessage('User ID must be a valid UUID')
], validateCoupon);

// Get single coupon by ID
router.get('/:id', [
  param('id').isUUID().withMessage('Coupon ID must be a valid UUID')
], requirePermission(Permission.VIEW_COUPONS), getCouponById);

// Create new coupon
router.post('/', [
  body('code')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon code must be between 3 and 50 characters')
    .matches(/^[A-Z0-9_-]+$/)
    .withMessage('Coupon code can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Name must be between 1 and 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('type').isIn(['percentage', 'fixed_amount']).withMessage('Type must be percentage or fixed_amount'),
  body('discount_value').isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('minimum_order_amount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be a positive number'),
  body('maximum_discount_amount').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Maximum discount amount must be a positive number'),
  body('usage_limit').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Usage limit must be a positive integer'),
  body('usage_limit_per_customer').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Usage limit per customer must be a positive integer'),
  body('starts_at').isISO8601().withMessage('Start date is required and must be a valid ISO date'),
  body('expires_at').isISO8601().withMessage('Expiry date is required and must be a valid ISO date'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], requirePermission(Permission.CREATE_COUPONS), createCoupon);

// Update coupon
router.put('/:id', [
  param('id').isUUID().withMessage('Coupon ID must be a valid UUID')
], requirePermission(Permission.EDIT_COUPONS), updateCoupon);

// Delete coupon
router.delete('/:id', [
  param('id').isUUID().withMessage('Coupon ID must be a valid UUID')
], requirePermission(Permission.DELETE_COUPONS), deleteCoupon);

export default router;