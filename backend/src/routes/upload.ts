import express from 'express';
import { uploadProductImage, uploadProductImages, uploadCategoryImage, uploadBlogImage } from '../controllers/uploadController';
import { uploadProductImage as uploadProductMiddleware, uploadProductImages as uploadMultipleMiddleware, uploadCategoryImage as uploadCategoryMiddleware, uploadBlogImage as uploadBlogMiddleware } from '../middleware/upload';
import { requireAdminAuthAPI } from '../middleware/adminAuth';

const router = express.Router();

// Upload single product image
router.post('/product-image', requireAdminAuthAPI, uploadProductMiddleware, uploadProductImage);

// Upload multiple product images
router.post('/product-images', requireAdminAuthAPI, uploadMultipleMiddleware, uploadProductImages);

// Upload category image
router.post('/category-image', requireAdminAuthAPI, uploadCategoryMiddleware, uploadCategoryImage);

// Upload blog image
router.post('/blog-image', requireAdminAuthAPI, uploadBlogMiddleware, uploadBlogImage);

export default router;