import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { ApiResponse, Category } from '../types';
import { CustomError } from '../middleware/errorHandler';

/**
 * Generate category slug from name
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Get all categories with optional filtering
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('getCategories called with query:', req.query);
    const { 
      include_products = 'false',
      parent_id,
      status = 'active'
    } = req.query;

    let whereConditions = ['c.is_active = ?'];
    let queryParams: any[] = [status === 'active' ? 1 : 0];

    if (parent_id) {
      whereConditions.push('c.parent_id = ?');
      queryParams.push(parent_id === 'null' ? null : parent_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const baseQuery = `
      SELECT 
        c.*,
        parent.name as parent_name,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `;

    console.log('Executing query:', baseQuery);
    console.log('With params:', queryParams);

    const [categories] = await pool.execute(baseQuery, queryParams) as any[];

    let result = categories.map((category: any) => ({
      ...category,
      product_count: parseInt(category.product_count),
      is_active: Boolean(category.is_active)
    }));

    // Include products if requested
    if (include_products === 'true') {
      for (let category of result) {
        const [products] = await pool.execute(`
          SELECT 
            id, name, slug, price, sale_price, featured_image, stock_status
          FROM products 
          WHERE category_id = ? AND status = 'active'
          ORDER BY featured DESC, created_at DESC
          LIMIT 10
        `, [category.id]) as any[];

        category.products = products;
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories: result }
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error in getCategories:', error);
    next(error);
  }
};

/**
 * Get a single category by ID or slug
 */
export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { include_products = 'false', products_limit = 20 } = req.query;

    // Check if the parameter is numeric (ID) or string (slug)
    const isNumeric = /^\d+$/.test(id);
    const query = isNumeric ? 'c.id = ?' : 'c.slug = ?';

    const [categories] = await pool.execute(`
      SELECT 
        c.*,
        parent.name as parent_name,
        parent.slug as parent_slug,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE ${query} AND c.is_active = 1
      GROUP BY c.id
    `, [id]) as any[];

    if (categories.length === 0) {
      const error: CustomError = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    const category = {
      ...categories[0],
      product_count: parseInt(categories[0].product_count),
      is_active: Boolean(categories[0].is_active)
    };

    // Get subcategories
    const [subcategories] = await pool.execute(`
      SELECT 
        id, name, slug, description, image, sort_order,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.parent_id = ? AND c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `, [category.id]) as any[];

    category.subcategories = subcategories.map((sub: any) => ({
      ...sub,
      product_count: parseInt(sub.product_count)
    }));

    // Include products if requested
    if (include_products === 'true') {
      const [products] = await pool.execute(`
        SELECT 
          p.id, p.name, p.slug, p.price, p.sale_price, p.featured_image, 
          p.short_description, p.stock_status,
          CASE 
            WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 
            THEN p.sale_price 
            ELSE p.price 
          END as effective_price,
          CASE 
            WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 
            THEN ROUND(((p.price - p.sale_price) / p.price) * 100, 2)
            ELSE 0 
          END as discount_percentage
        FROM products p
        WHERE p.category_id = ? AND p.status = 'active'
        ORDER BY p.featured DESC, p.created_at DESC
        LIMIT ?
      `, [category.id, Number(products_limit)]) as any[];

      category.products = products;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Category retrieved successfully',
      data: { category }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Create a new category (Admin only)
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Creating category with data:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const {
      name,
      description,
      image,
      parent_id,
      sort_order = 0,
      is_active = true,
      meta_title,
      meta_description
    } = req.body;

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug already exists
    const [existingSlugs] = await pool.execute(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    ) as any[];

    let finalSlug = slug;
    if (existingSlugs.length > 0) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // If parent_id is provided, verify it exists
    if (parent_id) {
      const [parentCategory] = await pool.execute(
        'SELECT id FROM categories WHERE id = ? AND is_active = 1',
        [parent_id]
      ) as any[];

      if (parentCategory.length === 0) {
        const error: CustomError = new Error('Parent category not found');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Generate UUID for category
    const { v4: uuidv4 } = require('uuid');
    const categoryId = uuidv4();

    // Insert category
    const [result] = await pool.execute(`
      INSERT INTO categories (
        id, name, slug, description, image, parent_id, sort_order, 
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      categoryId, name, finalSlug, description, image, parent_id || null, 
      sort_order, is_active
    ]) as any;

    // Get the created category
    const [createdCategory] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    ) as any[];

    if (createdCategory.length === 0) {
      const error: CustomError = new Error('Failed to retrieve created category');
      error.statusCode = 500;
      return next(error);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Category created successfully',
      data: {
        category: {
          ...createdCategory[0],
          is_active: Boolean(createdCategory[0].is_active)
        }
      }
    };

    res.status(201).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Update a category (Admin only)
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if category exists
    const [existingCategories] = await pool.execute(
      'SELECT id, slug FROM categories WHERE id = ?',
      [id]
    ) as any[];

    if (existingCategories.length === 0) {
      const error: CustomError = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    // Generate new slug if name is being updated
    if (updates.name) {
      const newSlug = generateSlug(updates.name);
      if (newSlug !== existingCategories[0].slug) {
        // Check if new slug already exists
        const [slugExists] = await pool.execute(
          'SELECT id FROM categories WHERE slug = ? AND id != ?',
          [newSlug, id]
        ) as any[];

        if (slugExists.length > 0) {
          updates.slug = `${newSlug}-${Date.now()}`;
        } else {
          updates.slug = newSlug;
        }
      }
    }

    // If parent_id is being updated, handle validation
    if ('parent_id' in updates) {
      if (updates.parent_id) {
        // Validate parent exists if setting a parent
        const [parentCategory] = await pool.execute(
          'SELECT id FROM categories WHERE id = ? AND is_active = 1',
          [updates.parent_id]
        ) as any[];

        if (parentCategory.length === 0) {
          const error: CustomError = new Error('Parent category not found');
          error.statusCode = 400;
          return next(error);
        }

        // Prevent setting self as parent
        if (updates.parent_id == id) {
          const error: CustomError = new Error('Category cannot be its own parent');
          error.statusCode = 400;
          return next(error);
        }
      } else {
        // Allow setting parent_id to null to remove parent
        updates.parent_id = null;
      }
    }

    // Build update query dynamically
    const updateFields = Object.keys(updates);
    const updateValues = Object.values(updates);
    
    if (updateFields.length === 0) {
      const error: CustomError = new Error('No fields to update');
      error.statusCode = 400;
      return next(error);
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    updateValues.push(id);

    await pool.execute(
      `UPDATE categories SET ${setClause} WHERE id = ?`,
      updateValues
    );

    // Get updated category
    const [updatedCategory] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Category updated successfully',
      data: {
        category: {
          ...updatedCategory[0],
          is_active: Boolean(updatedCategory[0].is_active)
        }
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete a category (Admin only)
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existingCategories] = await pool.execute(
      'SELECT id FROM categories WHERE id = ?',
      [id]
    ) as any[];

    if (existingCategories.length === 0) {
      const error: CustomError = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if category has products
    const [productsInCategory] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    ) as any[];

    if (productsInCategory[0].count > 0) {
      const error: CustomError = new Error('Cannot delete category that contains products');
      error.statusCode = 400;
      return next(error);
    }

    // Check if category has subcategories
    const [subcategories] = await pool.execute(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [id]
    ) as any[];

    if (subcategories[0].count > 0) {
      const error: CustomError = new Error('Cannot delete category that has subcategories');
      error.statusCode = 400;
      return next(error);
    }

    // Soft delete by updating is_active
    await pool.execute(
      'UPDATE categories SET is_active = 0 WHERE id = ?',
      [id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Category deleted successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get category tree (hierarchical structure)
 */
export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all active categories
    const [categories] = await pool.execute(`
      SELECT 
        c.*,
        parent.name as parent_name,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `) as any[];

    // Build hierarchical structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create category objects and map them
    categories.forEach((category: any) => {
      categoryMap.set(category.id, {
        ...category,
        product_count: parseInt(category.product_count),
        is_active: Boolean(category.is_active),
        children: []
      });
    });

    // Second pass: build hierarchy
    categories.forEach((category: any) => {
      const categoryObj = categoryMap.get(category.id);
      
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryObj);
        }
      } else {
        rootCategories.push(categoryObj);
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Category tree retrieved successfully',
      data: { categories: rootCategories }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};