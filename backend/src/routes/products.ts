import express from 'express';
import { body, query } from 'express-validator';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { requirePermission, Permission } from '../middleware/rbac';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
  getProductVariations
} from '../controllers/productController';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree
} from '../controllers/categoryController';

const router = express.Router();

// ========== PRODUCT ROUTES ==========

// Search products (public) - Must be before /:id route
router.get('/search', [
  query('q').trim().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], searchProducts);

// Get featured products (public)
router.get('/featured', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], getFeaturedProducts);

// Get all products (public)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  query('category_slug').optional().isLength({ min: 1 }).withMessage('Category slug must not be empty'),
  query('sort_by').optional().isIn(['created_at', 'name', 'price', 'stock_quantity', 'featured']).withMessage('Invalid sort field'),
  query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
], getProducts);

// ========== CATEGORY ROUTES ==========
// NOTE: Category routes must come BEFORE the parameterized product routes
// to prevent /categories from being matched by /:id

// Get category tree (public)
router.get('/categories/tree', (req, res, next) => {
  console.log('Categories tree route hit!');
  getCategoryTree(req, res, next);
});

// Get all categories (public)
router.get('/categories', (req, res, next) => {
  console.log('Categories route hit!');
  getCategories(req, res, next);
});

// Get category by ID or slug (public)
router.get('/categories/:id', [
  query('include_products').optional().isBoolean().withMessage('Include products must be a boolean'),
  query('products_limit').optional().isInt({ min: 1, max: 50 }).withMessage('Products limit must be between 1 and 50'),
], getCategory);

// Create category (admin/manager)
router.post('/categories', authenticate, requirePermission(Permission.CREATE_CATEGORIES), [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Category name must be between 2 and 255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('image').optional({ values: 'falsy' }).isString().withMessage('Image must be a string'),
  body('parent_id').optional({ values: 'falsy' }).isUUID().withMessage('Parent ID must be a valid UUID'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
  body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
], createCategory);

// Update category (admin/manager)
router.put('/categories/:id', authenticate, requirePermission(Permission.EDIT_CATEGORIES), [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Category name must be between 2 and 255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('image').optional({ values: 'falsy' }).isString().withMessage('Image must be a string'),
  body('parent_id').optional({ values: 'falsy' }).isUUID().withMessage('Parent ID must be a valid UUID'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
  body('is_active').optional().isBoolean().withMessage('Is active must be a boolean'),
], updateCategory);

// Delete category (admin/manager)
router.delete('/categories/:id', authenticate, requirePermission(Permission.DELETE_CATEGORIES), deleteCategory);

// ========== PRODUCT ROUTES CONTINUED ==========
// NOTE: These parameterized routes must come AFTER category routes

// Get product by ID or slug (public)
router.get('/:id', getProduct);

// Get product variations by product ID (public)
router.get('/:id/variations', getProductVariations);

// Create product (admin/manager)
router.post('/', authenticate, requirePermission(Permission.CREATE_PRODUCTS), [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Product name must be between 2 and 255 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('category_id').notEmpty().withMessage('Category is required').isUUID().withMessage('Category ID must be a valid UUID'),
  body('featured_image').notEmpty().withMessage('Featured image is required').isString().withMessage('Featured image must be a string'),
  body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('manage_stock').optional().isBoolean().withMessage('Manage stock must be a boolean'),
], createProduct);

// Update product (admin/manager)
router.put('/:id', authenticate, requirePermission(Permission.EDIT_PRODUCTS), [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Product name must be between 2 and 255 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('cost_price').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('category_id').optional().isUUID().withMessage('Category ID must be a valid UUID'),
  body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('manage_stock').optional().isBoolean().withMessage('Manage stock must be a boolean'),
], updateProduct);

// Delete product (admin/manager)
router.delete('/:id', authenticate, requirePermission(Permission.DELETE_PRODUCTS), deleteProduct);

export default router;