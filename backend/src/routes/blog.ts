import express from 'express';
import { body, param } from 'express-validator';
import { requirePermission, Permission } from '../middleware/rbac';
import {
  getAllPosts,
  getBlogStats,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getPublicPosts,
  getPublicPostBySlug,
  incrementPostViewCount,
  getBlogSettings,
  updateBlogSettings
} from '../controllers/blogController';

const router = express.Router();

// Public blog endpoints (no auth required)
router.get('/public/posts', getPublicPosts);
router.get('/public/posts/slug/:slug', getPublicPostBySlug);
router.post('/public/posts/:id/view', incrementPostViewCount);
router.get('/public/settings', getBlogSettings);

// Blog settings endpoints (admin auth required)
router.put('/settings', [
  body('blog_page_title').optional().isString().isLength({ min: 1, max: 200 }),
  body('blog_page_subtitle').optional().isString().isLength({ min: 1, max: 500 })
], requirePermission(Permission.EDIT_SETTINGS), updateBlogSettings);

// Get all blog posts with search and filters
router.get('/posts', [
  // Query parameter validation is optional as we have defaults
], requirePermission(Permission.VIEW_BLOG), getAllPosts);

// Get blog statistics
router.get('/stats', [
  // No additional validation needed
], requirePermission(Permission.VIEW_BLOG), getBlogStats);

// Get all blog categories
router.get('/categories', [
  // No additional validation needed
], requirePermission(Permission.VIEW_BLOG), getCategories);

// Get all blog tags
router.get('/tags', [
  // No additional validation needed
], requirePermission(Permission.VIEW_BLOG), getTags);

// Get specific blog post
router.get('/posts/:id', [
  param('id').isUUID().withMessage('Valid post ID is required')
], requirePermission(Permission.VIEW_BLOG), getPostById);

// Create new blog post
router.post('/posts', [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be 1-255 characters'),
  body('slug').trim().isLength({ min: 1, max: 255 }).matches(/^[a-z0-9-]+$/).withMessage('Slug is required and must contain only lowercase letters, numbers, and hyphens'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),
  body('featured_image').optional().trim().isLength({ max: 500 }).withMessage('Featured image path must be max 500 characters'),
  body('meta_title').optional().trim().isLength({ max: 255 }).withMessage('Meta title must be max 255 characters'),
  body('meta_description').optional().trim().isLength({ max: 500 }).withMessage('Meta description must be max 500 characters'),
  body('meta_keywords').optional().trim().isLength({ max: 500 }).withMessage('Meta keywords must be max 500 characters'),
  body('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).withMessage('Invalid status'),
  body('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean'),
  body('allow_comments').optional().isBoolean().withMessage('allow_comments must be a boolean'),
  body('reading_time').optional().isInt({ min: 1, max: 120 }).withMessage('Reading time must be between 1-120 minutes'),
  body('published_at').optional({ checkFalsy: true }).isISO8601().withMessage('Published date must be a valid ISO 8601 date'),
  body('scheduled_at').optional({ checkFalsy: true }).isISO8601().withMessage('Scheduled date must be a valid ISO 8601 date'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isUUID().withMessage('Each tag must be a valid UUID')
], requirePermission(Permission.CREATE_BLOG_POSTS), createPost);

// Update blog post
router.put('/posts/:id', [
  param('id').isUUID().withMessage('Valid post ID is required'),
  body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be 1-255 characters'),
  body('slug').optional().trim().isLength({ min: 1, max: 255 }).matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt must be max 500 characters'),
  body('featured_image').optional().trim().isLength({ max: 500 }).withMessage('Featured image path must be max 500 characters'),
  body('meta_title').optional().trim().isLength({ max: 255 }).withMessage('Meta title must be max 255 characters'),
  body('meta_description').optional().trim().isLength({ max: 500 }).withMessage('Meta description must be max 500 characters'),
  body('meta_keywords').optional().trim().isLength({ max: 500 }).withMessage('Meta keywords must be max 500 characters'),
  body('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).withMessage('Invalid status'),
  body('is_featured').optional().isBoolean().withMessage('is_featured must be a boolean'),
  body('allow_comments').optional().isBoolean().withMessage('allow_comments must be a boolean'),
  body('reading_time').optional().isInt({ min: 1, max: 120 }).withMessage('Reading time must be between 1-120 minutes'),
  body('published_at').optional({ checkFalsy: true }).isISO8601().withMessage('Published date must be a valid ISO 8601 date'),
  body('scheduled_at').optional({ checkFalsy: true }).isISO8601().withMessage('Scheduled date must be a valid ISO 8601 date'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isUUID().withMessage('Each tag must be a valid UUID')
], requirePermission(Permission.EDIT_BLOG_POSTS), updatePost);

// Delete blog post
router.delete('/posts/:id', [
  param('id').isUUID().withMessage('Valid post ID is required')
], requirePermission(Permission.DELETE_BLOG_POSTS), deletePost);

// Create blog category
router.post('/categories', [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Category name is required and must be 1-100 characters'),
  body('slug').trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Slug is required and must contain only lowercase letters, numbers, and hyphens'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex color'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
], requirePermission(Permission.MANAGE_BLOG_CATEGORIES), createCategory);

// Update blog category
router.put('/categories/:id', [
  param('id').isUUID().withMessage('Valid category ID is required'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Category name must be 1-100 characters'),
  body('slug').optional().trim().isLength({ min: 1, max: 100 }).matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex color'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
], requirePermission(Permission.MANAGE_BLOG_CATEGORIES), updateCategory);

// Delete blog category
router.delete('/categories/:id', [
  param('id').isUUID().withMessage('Valid category ID is required')
], requirePermission(Permission.MANAGE_BLOG_CATEGORIES), deleteCategory);

// Create blog tag
router.post('/tags', [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Tag name is required and must be 1-50 characters'),
  body('slug').trim().isLength({ min: 1, max: 50 }).matches(/^[a-z0-9-]+$/).withMessage('Slug is required and must contain only lowercase letters, numbers, and hyphens'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex color')
], requirePermission(Permission.MANAGE_BLOG_TAGS), createTag);

// Update blog tag
router.put('/tags/:id', [
  param('id').isUUID().withMessage('Valid tag ID is required'),
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Tag name must be 1-50 characters'),
  body('slug').optional().trim().isLength({ min: 1, max: 50 }).matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Color must be a valid hex color')
], requirePermission(Permission.MANAGE_BLOG_TAGS), updateTag);

// Delete blog tag
router.delete('/tags/:id', [
  param('id').isUUID().withMessage('Valid tag ID is required')
], requirePermission(Permission.MANAGE_BLOG_TAGS), deleteTag);

export default router;