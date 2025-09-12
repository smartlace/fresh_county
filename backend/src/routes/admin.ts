import express from 'express';
import { body, query, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { requirePermission, Permission } from '../middleware/rbac';
import {
  getDashboardStats,
  getAnalytics,
  getAllUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getSystemSettings,
  updateSystemSettings,
  getRecentActivity,
  getOrderStats,
  getUserStats
} from '../controllers/adminController';
import { getAllOrders, getOrderForAdmin, getOrderStatusHistory, updateOrderStatus, confirmOrderPayment } from '../controllers/orderController';

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);

// Dashboard stats
router.get('/dashboard', [
  query('period').optional().isInt({ min: 1, max: 365 }).withMessage('Period must be between 1 and 365 days')
], requirePermission(Permission.VIEW_DASHBOARD), getDashboardStats);

// Analytics
router.get('/analytics', [
  query('start_date').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('end_date').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('metric').optional().isIn(['revenue', 'orders', 'customers']).withMessage('Invalid metric'),
  query('group_by').optional().isIn(['day', 'week', 'month']).withMessage('Invalid group_by value')
], requirePermission(Permission.VIEW_ANALYTICS), getAnalytics);

// Get order statistics
router.get('/orders/stats', requirePermission(Permission.VIEW_ORDERS), getOrderStats);

// Get user statistics
router.get('/users/stats', requirePermission(Permission.VIEW_USERS), getUserStats);

// Get all orders (moved from order controller)
router.get('/orders', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  query('payment_status').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status'),
  query('sort_by').optional().isIn(['created_at', 'total_amount', 'status']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term cannot exceed 100 characters')
], requirePermission(Permission.VIEW_ORDERS), getAllOrders);

// Get single order details
router.get('/orders/:id', [
  param('id').isUUID().withMessage('Order ID must be a valid UUID')
], requirePermission(Permission.VIEW_ORDERS), getOrderForAdmin);

// Get order status history
router.get('/orders/:id/history', [
  param('id').isUUID().withMessage('Order ID must be a valid UUID')
], requirePermission(Permission.VIEW_ORDERS), getOrderStatusHistory);

// Update order status
router.put('/orders/:id/status', [
  param('id').isUUID().withMessage('Order ID must be a valid UUID'),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('tracking_number').optional().trim().isLength({ max: 100 }).withMessage('Tracking number cannot exceed 100 characters')
], requirePermission(Permission.UPDATE_ORDER_STATUS), updateOrderStatus);

// Confirm payment and send order confirmation email
router.put('/orders/:id/confirm-payment', [
  param('id').isUUID().withMessage('Order ID must be a valid UUID'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], requirePermission(Permission.UPDATE_ORDER_STATUS), confirmOrderPayment);

// Get all users
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['customer', 'staff', 'manager', 'admin']).withMessage('Invalid role'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term cannot exceed 100 characters'),
  query('sort_by').optional().isIn(['created_at', 'first_name', 'last_name', 'email']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC')
], requirePermission(Permission.VIEW_USERS), getAllUsers);

// Create user
router.post('/users', [
  body('first_name').trim().isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
  body('last_name').trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'staff', 'manager', 'admin']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], requirePermission(Permission.CREATE_USERS), createUser);

// Update user
router.put('/users/:id', [
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
  body('first_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
  body('last_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number must be max 20 characters'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'staff', 'manager', 'admin']).withMessage('Invalid role'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], requirePermission(Permission.EDIT_USERS), updateUser);

// Update user status
router.put('/users/:id/status', [
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('role').optional().isIn(['customer', 'staff', 'manager', 'admin']).withMessage('Invalid role')
], requirePermission(Permission.EDIT_USERS), updateUserStatus);

// Delete user
router.delete('/users/:id', [
  param('id').isUUID().withMessage('User ID must be a valid UUID')
], requirePermission(Permission.DELETE_USERS), deleteUser);

// System settings
router.get('/settings', requirePermission(Permission.VIEW_SETTINGS), getSystemSettings);

router.put('/settings', [
  body('settings').isObject().withMessage('Settings must be an object')
], requirePermission(Permission.EDIT_SETTINGS), updateSystemSettings);

// Recent activity
router.get('/activity', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], requirePermission(Permission.VIEW_DASHBOARD), getRecentActivity);

export default router;