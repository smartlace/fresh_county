import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { getFileUrl, getCategoryFileUrl, getBlogFileUrl } from '../middleware/upload';

/**
 * Upload product image
 */
export const uploadProductImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const error: CustomError = new Error('No image file provided');
      error.statusCode = 400;
      return next(error);
    }

    // Get the uploaded file URL
    const imageUrl = getFileUrl(req.file.filename);

    const response: ApiResponse = {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        original_name: req.file.originalname,
        url: imageUrl,
        size: req.file.size,
        mime_type: req.file.mimetype
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Upload multiple product images
 */
export const uploadProductImages = async (req: any, res: Response, next: NextFunction) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      const error: CustomError = new Error('No image files provided');
      error.statusCode = 400;
      return next(error);
    }

    // Process each uploaded file
    const uploadedImages = files.map((file: any) => ({
      filename: file.filename,
      original_name: file.originalname,
      url: getFileUrl(file.filename),
      size: file.size,
      mime_type: file.mimetype
    }));

    const response: ApiResponse = {
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      data: {
        images: uploadedImages,
        count: uploadedImages.length
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Upload category image
 */
export const uploadCategoryImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const error: CustomError = new Error('No image file provided');
      error.statusCode = 400;
      return next(error);
    }

    // Get the uploaded file URL
    const imageUrl = getCategoryFileUrl(req.file.filename);

    const response: ApiResponse = {
      success: true,
      message: 'Category image uploaded successfully',
      data: {
        filename: req.file.filename,
        original_name: req.file.originalname,
        url: imageUrl,
        size: req.file.size,
        mime_type: req.file.mimetype
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Upload blog image
 */
export const uploadBlogImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const error: CustomError = new Error('No image file provided');
      error.statusCode = 400;
      return next(error);
    }

    // Get the uploaded file URL
    const imageUrl = getBlogFileUrl(req.file.filename);

    const response: ApiResponse = {
      success: true,
      message: 'Blog image uploaded successfully',
      data: {
        filename: req.file.filename,
        original_name: req.file.originalname,
        url: imageUrl,
        size: req.file.size,
        mime_type: req.file.mimetype
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};
