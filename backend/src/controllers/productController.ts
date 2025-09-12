import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { ApiResponse, PaginatedResponse, Product } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { getFileUrl, deleteFile, getFilenameFromUrl } from '../middleware/upload';

/**
 * Generate product slug from name
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
 * Generate unique SKU for product
 */
const generateSKU = async (name: string, categoryId?: string): Promise<string> => {
  // Get category abbreviation if category exists
  let categoryCode = 'GEN'; // Default to 'GEN' for General
  
  if (categoryId) {
    try {
      const [categories] = await pool.execute(
        'SELECT name FROM categories WHERE id = ?',
        [categoryId]
      ) as any[];
      
      if (categories.length > 0) {
        const categoryName = categories[0].name;
        // Create 3-letter abbreviation from category name
        categoryCode = categoryName
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 3)
          .padEnd(3, 'X'); // Pad with X if less than 3 chars
      }
    } catch (error) {
      console.log('Could not fetch category for SKU generation, using default');
    }
  }
  
  // Create product code from name (first 3 letters)
  const productCode = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3)
    .padEnd(3, 'X'); // Pad with X if less than 3 chars
  
  // Generate timestamp-based suffix for uniqueness
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits
  
  let baseSKU = `${categoryCode}-${productCode}-${timestamp}`;
  let finalSKU = baseSKU;
  let counter = 1;
  
  // Ensure SKU is unique by checking database
  while (true) {
    try {
      const [existingSKUs] = await pool.execute(
        'SELECT id FROM products WHERE sku = ?',
        [finalSKU]
      ) as any[];
      
      if (existingSKUs.length === 0) {
        break; // SKU is unique
      }
      
      // If SKU exists, add counter suffix
      finalSKU = `${baseSKU}-${counter.toString().padStart(2, '0')}`;
      counter++;
      
      // Prevent infinite loop (though highly unlikely)
      if (counter > 99) {
        finalSKU = `${baseSKU}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        break;
      }
    } catch (error) {
      console.error('Error checking SKU uniqueness:', error);
      // Fallback to random suffix
      finalSKU = `${baseSKU}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      break;
    }
  }
  
  return finalSKU;
};

/**
 * Get all products with filtering, sorting, and pagination
 */
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 12,
      category_id,
      category_slug,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      featured,
      status = 'active',
      min_price,
      max_price,
      in_stock
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build WHERE conditions
    let whereConditions = ['p.status = ?'];
    let queryParams: any[] = [status];

    if (category_id) {
      whereConditions.push('p.category_id = ?');
      queryParams.push(category_id);
    }

    if (category_slug) {
      whereConditions.push('c.slug = ?');
      queryParams.push(category_slug);
    }

    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (featured === 'true') {
      whereConditions.push('p.featured = TRUE');
    }

    if (min_price) {
      whereConditions.push('p.price >= ?');
      queryParams.push(Number(min_price));
    }

    if (max_price) {
      whereConditions.push('p.price <= ?');
      queryParams.push(Number(max_price));
    }

    if (in_stock === 'true') {
      whereConditions.push('p.stock_status = "in_stock" AND p.stock_quantity > 0');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort_by to prevent SQL injection
    const allowedSortFields = ['created_at', 'name', 'price', 'stock_quantity', 'featured'];
    const sortField = allowedSortFields.includes(sort_by as string) ? sort_by : 'created_at';
    const sortDirection = sort_order === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;

    const [countResult] = await pool.execute(countQuery, queryParams) as any[];
    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / Number(limit));

    // Get products with category information
    // Temporary fix: use template literals instead of parameters for enum values
    let finalWhereClause = whereClause.replace('p.status = ?', `p.status = '${status}'`);
    let finalQueryParams = queryParams.slice(1); // Remove the status parameter

    // Add other query conditions manually if needed
    if (category_id) {
      finalQueryParams = finalQueryParams.slice(1); // Remove category_id too
      finalWhereClause = finalWhereClause.replace('p.category_id = ?', `p.category_id = '${category_id}'`);
    }

    if (category_slug) {
      finalQueryParams = finalQueryParams.slice(1); // Remove category_slug too
      finalWhereClause = finalWhereClause.replace('c.slug = ?', `c.slug = '${category_slug}'`);
    }

    if (search) {
      const searchReplacements = ['?', '?', '?'];
      let searchIndex = 0;
      finalWhereClause = finalWhereClause.replace(/\?/g, () => {
        if (searchIndex < 3) {
          searchIndex++;
          return `'%${search}%'`;
        }
        return '?';
      });
      finalQueryParams = finalQueryParams.slice(3); // Remove search parameters
    }

    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${finalWhereClause}
      ORDER BY p.${sortField} ${sortDirection}
      LIMIT ${Number(limit)} OFFSET ${offset}
    `;

    // console.log('Products Query:', productsQuery);
    const [products] = await pool.execute(productsQuery, []) as any[];

    // Parse JSON fields
    const formattedProducts = products.map((product: any) => {
      let parsedImages = [];
      if (product.images) {
        try {
          // Check if it's already an object/array (MySQL might return it parsed)
          if (typeof product.images === 'string') {
            parsedImages = JSON.parse(product.images);
          } else {
            parsedImages = product.images;
          }
        } catch (error) {
          console.error(`Error parsing images for product ${product.id}:`, error);
          console.error('Raw images data:', product.images);
          parsedImages = [];
        }
      }
      
      return {
        ...product,
        images: parsedImages,
      };
    });

    const response: ApiResponse<PaginatedResponse<Product>> = {
      success: true,
      message: 'Products retrieved successfully',
      data: {
        items: formattedProducts,
        pagination: {
          current_page: Number(page),
          items_per_page: Number(limit),
          total_items: totalProducts,
          total_pages: totalPages
        }
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get a single product by ID or slug
 */
export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Try to find product by ID first, then by slug
    // This handles both UUID and custom ID formats
    let query = 'p.id = ?';
    let searchValue = id;

    // Try to find by ID first
    let [products] = await pool.execute(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
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
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = 'active'
    `, [id]) as any[];

    // If not found by ID, try by slug
    if (products.length === 0) {
      [products] = await pool.execute(`
        SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug,
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
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ? AND p.status = 'active'
      `, [id]) as any[];
    }

    if (products.length === 0) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    const product = products[0];

    // Parse JSON fields
    try {
      if (product.images) {
        if (typeof product.images === 'string') {
          product.images = JSON.parse(product.images);
        }
      } else {
        product.images = [];
      }
    } catch (error) {
      console.error(`Error parsing images for product ${product.id}:`, error);
      console.error('Raw images data:', product.images);
      product.images = [];
    }

    // Get related products (same category)
    const [relatedProducts] = await pool.execute(`
      SELECT id, name, slug, price, sale_price, featured_image, stock_status
      FROM products 
      WHERE category_id = ? AND id != ? AND status = 'active' 
      ORDER BY featured DESC, created_at DESC 
      LIMIT 6
    `, [product.category_id, product.id]) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Product retrieved successfully',
      data: product
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Create a new product (Admin only)
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const {
      name,
      description,
      short_description,
      sku,
      price,
      sale_price,
      stock_quantity,
      category_id,
      featured_image,
      gallery = [],
      status = 'active',
      featured = false,
      meta_title,
      meta_description
    } = req.body;

    // Generate slug
    const slug = generateSlug(name);

    // Check if slug already exists
    const [existingSlugs] = await pool.execute(
      'SELECT id FROM products WHERE slug = ?',
      [slug]
    ) as any[];

    let finalSlug = slug;
    if (existingSlugs.length > 0) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Generate SKU if not provided
    let finalSKU = sku;
    if (!sku || sku.trim() === '') {
      finalSKU = await generateSKU(name, category_id);
      console.log(`Auto-generated SKU for product "${name}": ${finalSKU}`);
    }

    // Determine stock status
    let stockStatus = 'in_stock';
    if (stock_quantity <= 0) {
      stockStatus = 'out_of_stock';
    } else if (stock_quantity <= 5) { // Use default low stock threshold of 5
      stockStatus = 'low_stock';
    }

    // Insert product - use only columns that exist in the database
    // Convert undefined values to null for MySQL compatibility
    const [result] = await pool.execute(`
      INSERT INTO products (
        name, slug, description, short_description, sku, price, sale_price,
        stock_quantity, stock_status, category_id, featured_image, images,
        status, featured, meta_title, meta_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, 
      finalSlug, 
      description || null, 
      short_description || null, 
      finalSKU || null, 
      price, 
      sale_price || null,
      stock_quantity, 
      stockStatus, 
      category_id || null, 
      featured_image || null, 
      JSON.stringify(gallery || []),
      status, 
      featured, 
      meta_title || null, 
      meta_description || null
    ]) as any;

    const productId = result.insertId;

    // Get the created product
    const [createdProduct] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Product created successfully',
      data: {
        product: {
          ...createdProduct[0],
          images: (() => {
            try {
              const images = createdProduct[0].images;
              if (images) {
                return typeof images === 'string' ? JSON.parse(images) : images;
              }
              return [];
            } catch (error) {
              console.error('Error parsing images in created product:', error);
              return [];
            }
          })()
        }
      }
    };

    res.status(201).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Update a product (Admin only)
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if product exists
    const [existingProducts] = await pool.execute(
      'SELECT id, slug FROM products WHERE id = ?',
      [id]
    ) as any[];

    if (existingProducts.length === 0) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    // Generate new slug if name is being updated
    if (updates.name) {
      const newSlug = generateSlug(updates.name);
      if (newSlug !== existingProducts[0].slug) {
        // Check if new slug already exists
        const [slugExists] = await pool.execute(
          'SELECT id FROM products WHERE slug = ? AND id != ?',
          [newSlug, id]
        ) as any[];

        if (slugExists.length > 0) {
          updates.slug = `${newSlug}-${Date.now()}`;
        } else {
          updates.slug = newSlug;
        }
      }
    }

    // Handle stock status update
    if (updates.stock_quantity !== undefined) {
      const stockQuantity = updates.stock_quantity;
      
      if (stockQuantity <= 0) {
        updates.stock_status = 'out_of_stock';
      } else if (stockQuantity <= 5) {
        updates.stock_status = 'low_stock';
      } else {
        updates.stock_status = 'in_stock';
      }
    }

    // Serialize JSON fields
    if (updates.images) {
      updates.images = JSON.stringify(updates.images);
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
      `UPDATE products SET ${setClause} WHERE id = ?`,
      updateValues
    );

    // Get updated product
    const [updatedProduct] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Product updated successfully',
      data: {
        product: {
          ...updatedProduct[0],
          images: (() => {
            try {
              const images = updatedProduct[0].images;
              if (images) {
                return typeof images === 'string' ? JSON.parse(images) : images;
              }
              return [];
            } catch (error) {
              console.error('Error parsing images in updated product:', error);
              return [];
            }
          })()
        }
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete a product (Admin only)
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const [existingProducts] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [id]
    ) as any[];

    if (existingProducts.length === 0) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    // Soft delete by updating status
    await pool.execute(
      'UPDATE products SET status = "inactive" WHERE id = ?',
      [id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Product deleted successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 8 } = req.query;

    const [products] = await pool.execute(`
      SELECT 
        p.id, p.name, p.slug, p.price, p.sale_price, p.featured_image, 
        p.short_description, p.stock_status,
        c.name as category_name,
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
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.featured = TRUE AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [Number(limit)]) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Featured products retrieved successfully',
      data: { products }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Search products
 */
export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || (q as string).trim().length < 2) {
      const error: CustomError = new Error('Search query must be at least 2 characters long');
      error.statusCode = 400;
      return next(error);
    }

    const searchTerm = `%${q}%`;

    const [products] = await pool.execute(`
      SELECT 
        p.id, p.name, p.slug, p.price, p.sale_price, p.featured_image,
        p.short_description, p.stock_status,
        c.name as category_name,
        MATCH(p.name, p.description, p.short_description) AGAINST(? IN BOOLEAN MODE) as relevance
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' 
        AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)
      ORDER BY relevance DESC, p.featured DESC, p.created_at DESC
      LIMIT ?
    `, [q, searchTerm, searchTerm, searchTerm, Number(limit)]) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Search completed successfully',
      data: { 
        products,
        query: q,
        total_results: products.length
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get product variations for a specific product (Public endpoint)
 */
export const getProductVariations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: productId } = req.params;

    // Get all variations for the product
    const [variations] = await pool.execute(`
      SELECT pv.*, p.name as product_name
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.product_id = ? AND pv.is_active = TRUE AND p.status = 'active'
      ORDER BY pv.is_default DESC, pv.created_at ASC
    `, [productId]) as any[];

    // Get variation combinations for each variation
    for (let variation of variations) {
      const [combinations] = await pool.execute(`
        SELECT pvc.*, pvo.name, pvo.display_name, pvo.color_hex,
               pvt.name as type_name, pvt.display_name as type_display_name
        FROM product_variation_combinations pvc
        JOIN product_variation_options pvo ON pvc.variation_option_id = pvo.id
        JOIN product_variation_types pvt ON pvo.variation_type_id = pvt.id
        WHERE pvc.product_variation_id = ?
        ORDER BY pvt.sort_order ASC, pvo.sort_order ASC
      `, [variation.id]) as any[];

      variation.combinations = combinations;
      
      // Parse JSON fields
      if (variation.dimensions) {
        variation.dimensions = JSON.parse(variation.dimensions);
      }
      if (variation.images) {
        variation.images = JSON.parse(variation.images);
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Product variations retrieved successfully',
      data: variations
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
