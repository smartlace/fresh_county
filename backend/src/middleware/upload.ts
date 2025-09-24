import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
const productsDir = path.join(uploadsDir, 'products');
const categoriesDir = path.join(uploadsDir, 'categories');
const blogDir = path.join(uploadsDir, 'blog');

[uploadsDir, productsDir, categoriesDir, blogDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage for products
const productStorage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, productsDir);
  },
  filename: function (req: any, file: any, cb: any) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `product-${uniqueSuffix}-${originalName}`);
  }
});

// Configure multer storage for categories
const categoryStorage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, categoriesDir);
  },
  filename: function (req: any, file: any, cb: any) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `category-${uniqueSuffix}-${originalName}`);
  }
});

// Configure multer storage for blog
const blogStorage = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, blogDir);
  },
  filename: function (req: any, file: any, cb: any) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `blog-${uniqueSuffix}-${originalName}`);
  }
});

// File filter to only allow images
const fileFilter = (req: any, file: any, cb: any) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    // Allowed image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.'));
    }
  } else {
    cb(new Error('Only image files are allowed.'));
  }
};

// Configure multer for products
const productUpload = multer({
  storage: productStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    files: 5 // Maximum 5 files per upload
  }
});

// Configure multer for categories
const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    files: 1 // Single file upload for categories
  }
});

// Configure multer for blog
const blogUpload = multer({
  storage: blogStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    files: 1 // Single file upload for blog
  }
});

// Middleware for single product image upload
export const uploadProductImage = productUpload.single('featured_image');

// Middleware for multiple product images upload
export const uploadProductImages = productUpload.array('product_images', 5);

// Middleware for single category image upload
export const uploadCategoryImage = categoryUpload.single('featured_image');

// Middleware for single blog image upload
export const uploadBlogImage = blogUpload.single('featured_image');

// Helper function to get product file URL
export const getFileUrl = (filename: string): string => {
  return `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/products/${filename}`;
};

// Helper function to get category file URL
export const getCategoryFileUrl = (filename: string): string => {
  return `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/categories/${filename}`;
};

// Helper function to get blog file URL
export const getBlogFileUrl = (filename: string): string => {
  return `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/blog/${filename}`;
};

// Helper function to delete product file
export const deleteFile = (filename: string): boolean => {
  try {
    const filePath = path.join(productsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to delete category file
export const deleteCategoryFile = (filename: string): boolean => {
  try {
    const filePath = path.join(categoriesDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to extract filename from URL
export const getFilenameFromUrl = (url: string): string | null => {
  try {
    const urlPath = new URL(url).pathname;
    return path.basename(urlPath);
  } catch (error) {
    // If URL parsing fails, try to extract filename from path
    return path.basename(url);
  }
};

export default productUpload;