import express from 'express';
import { body, param } from 'express-validator';
import { requirePermission, Permission } from '../middleware/rbac';
import {
  getAllPages,
  getPageStats,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  getFAQItems,
  getFAQItemById,
  createFAQItem,
  updateFAQItem,
  deleteFAQItem,
  incrementFAQViewCount,
  voteFAQItem,
  getPublicFAQs,
  getPublicPage
} from '../controllers/websitePagesController';

const router = express.Router();

// Public FAQ items endpoint (no auth required)
router.get('/public', getPublicFAQs);

// Public website page endpoint (no auth required)
router.get('/public/:identifier', getPublicPage);

// Get all website pages with search and filters
router.get('/', [
  // Query parameter validation is optional as we have defaults
], requirePermission(Permission.VIEW_WEBSITE_PAGES), getAllPages);

// Get website page statistics
router.get('/stats', [
  // No additional validation needed
], requirePermission(Permission.VIEW_WEBSITE_PAGES), getPageStats);

// Get FAQ items with search and pagination
router.get('/faq', [
  // No additional validation needed for query parameters
], requirePermission(Permission.VIEW_WEBSITE_PAGES), getFAQItems);

// Get specific website page
router.get('/:id', [
  param('id').isUUID().withMessage('Valid page ID is required')
], requirePermission(Permission.VIEW_WEBSITE_PAGES), getPageById);

// Create new website page
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be 1-255 characters'),
  body('slug').trim().isLength({ min: 1, max: 255 }).matches(/^[a-z0-9-]+$/).withMessage('Slug is required and must contain only lowercase letters, numbers, and hyphens'),
  body('page_type').optional().isIn(['privacy_policy', 'terms_of_service', 'cancellation_policy']).withMessage('Invalid page type'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('meta_title').optional().trim().isLength({ max: 255 }).withMessage('Meta title must be max 255 characters'),
  body('meta_description').optional().trim().isLength({ max: 500 }).withMessage('Meta description must be max 500 characters'),
  body('meta_keywords').optional().trim().isLength({ max: 500 }).withMessage('Meta keywords must be max 500 characters'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
  body('template').optional().trim().isLength({ max: 100 }).withMessage('Template must be max 100 characters')
], requirePermission(Permission.CREATE_WEBSITE_PAGES), createPage);

// Update website page
router.put('/:id', [
  param('id').isUUID().withMessage('Valid page ID is required'),
  body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be 1-255 characters'),
  body('slug').optional().trim().isLength({ min: 1, max: 255 }).matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('page_type').optional().isIn(['privacy_policy', 'terms_of_service', 'cancellation_policy']).withMessage('Invalid page type'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('meta_title').optional().trim().isLength({ max: 255 }).withMessage('Meta title must be max 255 characters'),
  body('meta_description').optional().trim().isLength({ max: 500 }).withMessage('Meta description must be max 500 characters'),
  body('meta_keywords').optional().trim().isLength({ max: 500 }).withMessage('Meta keywords must be max 500 characters'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
  body('template').optional().trim().isLength({ max: 100 }).withMessage('Template must be max 100 characters')
], requirePermission(Permission.EDIT_WEBSITE_PAGES), updatePage);

// Delete website page
router.delete('/:id', [
  param('id').isUUID().withMessage('Valid page ID is required')
], requirePermission(Permission.DELETE_WEBSITE_PAGES), deletePage);

// Get specific FAQ item
router.get('/faq/items/:id', [
  param('id').isUUID().withMessage('Valid FAQ item ID is required')
], requirePermission(Permission.VIEW_WEBSITE_PAGES), getFAQItemById);

// Create FAQ item
router.post('/faq/items', [
  body('question').trim().isLength({ min: 1, max: 1000 }).withMessage('Question is required and must be 1-1000 characters'),
  body('answer').trim().isLength({ min: 1 }).withMessage('Answer is required'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], requirePermission(Permission.CREATE_WEBSITE_PAGES), createFAQItem);

// Update FAQ item
router.put('/faq/items/:id', [
  param('id').isUUID().withMessage('Valid FAQ item ID is required'),
  body('question').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Question must be 1-1000 characters'),
  body('answer').optional().trim().isLength({ min: 1 }).withMessage('Answer cannot be empty'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
], requirePermission(Permission.EDIT_WEBSITE_PAGES), updateFAQItem);

// Delete FAQ item
router.delete('/faq/items/:id', [
  param('id').isUUID().withMessage('Valid FAQ item ID is required')
], requirePermission(Permission.DELETE_WEBSITE_PAGES), deleteFAQItem);

// Increment FAQ view count
router.post('/faq/items/:id/view', [
  param('id').isUUID().withMessage('Valid FAQ item ID is required')
], requirePermission(Permission.VIEW_WEBSITE_PAGES), incrementFAQViewCount);

// Vote on FAQ helpfulness
router.post('/faq/items/:id/vote', [
  param('id').isUUID().withMessage('Valid FAQ item ID is required'),
  body('helpful').isBoolean().withMessage('helpful must be a boolean')
], requirePermission(Permission.VIEW_WEBSITE_PAGES), voteFAQItem);

export default router;