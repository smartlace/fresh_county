import express from 'express';
import { body, param } from 'express-validator';
import { requirePermission, Permission } from '../middleware/rbac';
import {
  getAllSubscriptions,
  getSubscriptionStats,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  bulkUpdateStatus,
  exportSubscriptions,
  publicSubscribe
} from '../controllers/newsletterController';

const router = express.Router();

// Public newsletter subscription (no auth required)
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required')
], publicSubscribe);

// Get all newsletter subscriptions with search and filters
router.get('/', [
  // Query parameter validation is optional as we have defaults
], requirePermission(Permission.VIEW_NEWSLETTERS), getAllSubscriptions);

// Get newsletter subscription statistics
router.get('/stats', [
  // No additional validation needed
], requirePermission(Permission.VIEW_NEWSLETTERS), getSubscriptionStats);

// Export newsletter subscriptions to CSV
router.get('/export', [
  // Query parameters are optional
], requirePermission(Permission.VIEW_NEWSLETTERS), exportSubscriptions);

// Get specific newsletter subscription
router.get('/:id', [
  param('id').isUUID().withMessage('Valid subscription ID is required')
], requirePermission(Permission.VIEW_NEWSLETTERS), getSubscriptionById);

// Create new newsletter subscription
router.post('/', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email address is required'),
  body('first_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
  body('last_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
  body('subscription_source').optional().isIn(['website', 'admin', 'import', 'api']).withMessage('Invalid subscription source')
], requirePermission(Permission.CREATE_NEWSLETTERS), createSubscription);

// Update newsletter subscription
router.put('/:id', [
  param('id').isUUID().withMessage('Valid subscription ID is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email address is required'),
  body('first_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
  body('last_name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
  body('status').optional().isIn(['active', 'unsubscribed', 'bounced', 'spam_complaint']).withMessage('Invalid status'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
], requirePermission(Permission.EDIT_NEWSLETTERS), updateSubscription);

// Delete newsletter subscription
router.delete('/:id', [
  param('id').isUUID().withMessage('Valid subscription ID is required')
], requirePermission(Permission.DELETE_NEWSLETTERS), deleteSubscription);

// Bulk update subscription status
router.post('/bulk-status', [
  body('subscription_ids').isArray({ min: 1 }).withMessage('subscription_ids must be a non-empty array'),
  body('subscription_ids.*').isUUID().withMessage('All subscription IDs must be valid UUIDs'),
  body('status').isIn(['active', 'unsubscribed', 'bounced', 'spam_complaint']).withMessage('Invalid status')
], requirePermission(Permission.EDIT_NEWSLETTERS), bulkUpdateStatus);

export default router;