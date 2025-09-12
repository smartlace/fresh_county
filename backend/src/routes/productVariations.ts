import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { requirePermission, Permission } from '../middleware/rbac';
import {
  getVariationTypes,
  getVariationTypeSuggestions,
  getVariationOptions,
  createVariationType,
  createVariationOption,
  getProductVariations,
  createProductVariation,
  updateProductVariation,
  deleteProductVariation,
  createProductWithVariations,
  updateProductWithVariations
} from '../controllers/productVariationController';

const router = express.Router();

// Get all variation types
router.get('/types', 
  authenticate, 
  requirePermission(Permission.VIEW_PRODUCTS),
  getVariationTypes
);

// Get variation type suggestions
router.get('/types/suggestions', 
  authenticate, 
  requirePermission(Permission.VIEW_PRODUCTS),
  getVariationTypeSuggestions
);

// Get variation options for a specific type
router.get('/types/:typeId/options', [
  param('typeId').isInt().withMessage('Type ID must be a valid integer')
], authenticate, requirePermission(Permission.VIEW_PRODUCTS), getVariationOptions);

// Create new variation type
router.post('/types', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('display_name').trim().isLength({ min: 1 }).withMessage('Display name is required'),
  body('description').optional().trim(),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
], authenticate, requirePermission(Permission.CREATE_PRODUCTS), createVariationType);

// Create new variation option
router.post('/options', [
  body('variation_type_id').isInt().withMessage('Variation type ID must be a valid integer'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('display_name').trim().isLength({ min: 1 }).withMessage('Display name is required'),
  body('color_hex').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer')
], authenticate, requirePermission(Permission.CREATE_PRODUCTS), createVariationOption);

// Get variations for a specific product
router.get('/products/:productId', [
  param('productId').isUUID().withMessage('Product ID must be a valid UUID')
], authenticate, requirePermission(Permission.VIEW_PRODUCTS), getProductVariations);

// Create new product variation
router.post('/products/:productId/variations', [
  param('productId').isUUID().withMessage('Product ID must be a valid UUID'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('dimensions').optional().isObject().withMessage('Dimensions must be an object'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('is_default').optional().isBoolean().withMessage('is_default must be a boolean'),
  body('variation_options').isArray().withMessage('Variation options must be an array'),
  body('variation_options.*').isInt().withMessage('Each variation option must be a valid integer')
], authenticate, requirePermission(Permission.CREATE_PRODUCTS), createProductVariation);

// Update product variation
router.put('/variations/:variationId', [
  param('variationId').isUUID().withMessage('Variation ID must be a valid UUID'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('dimensions').optional().isObject().withMessage('Dimensions must be an object'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('is_default').optional().isBoolean().withMessage('is_default must be a boolean'),
  body('variation_options').optional().isArray().withMessage('Variation options must be an array'),
  body('variation_options.*').optional().isInt().withMessage('Each variation option must be a valid integer')
], authenticate, requirePermission(Permission.EDIT_PRODUCTS), updateProductVariation);

// Delete product variation
router.delete('/variations/:variationId', [
  param('variationId').isUUID().withMessage('Variation ID must be a valid UUID')
], authenticate, requirePermission(Permission.DELETE_PRODUCTS), deleteProductVariation);

// Create product with inline variations
router.post('/products-with-variations', [
  // Product validation - relaxed to match edit validation
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('description').optional().trim(),
  body('short_description').optional().trim(),
  body('sku').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('category_id').optional().custom((value) => {
    if (value === '' || value === null) return true; // Allow empty
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }).withMessage('Category ID must be a valid UUID or empty'),
  body('featured_image').optional().trim(), // Accept any string, not just URLs
  body('gallery').optional().isArray().withMessage('Gallery must be an array'),
  body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('meta_title').optional().trim(),
  body('meta_description').optional().trim(),
  // Variable product validation - simplified to match edit validation
  body('variable_type').optional().trim(),
  body('variables').optional().isArray().withMessage('Variables must be an array')
], authenticate, requirePermission(Permission.CREATE_PRODUCTS), createProductWithVariations);

// Update product with inline variations
router.put('/products-with-variations/:productId', [
  param('productId').isUUID().withMessage('Product ID must be a valid UUID'),
  // Product validation - relaxed for editing
  body('name').trim().isLength({ min: 1 }).withMessage('Product name is required'),
  body('description').optional().trim(),
  body('short_description').optional().trim(),
  body('sku').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sale_price').optional().isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('category_id').optional().custom((value) => {
    if (value === '' || value === null) return true; // Allow empty
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }).withMessage('Category ID must be a valid UUID or empty'),
  body('featured_image').optional().trim(), // Accept any string, not just URLs
  body('gallery').optional().isArray().withMessage('Gallery must be an array'),
  body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Invalid status'),
  body('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  body('meta_title').optional().trim(),
  body('meta_description').optional().trim(),
  // Variable product validation - simplified
  body('variable_type').optional().trim(),
  body('variables').optional().isArray().withMessage('Variables must be an array')
], authenticate, requirePermission(Permission.EDIT_PRODUCTS), updateProductWithVariations);

export default router;