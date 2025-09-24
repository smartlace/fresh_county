import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { ApiResponse, PaginatedResponse } from '../types';
import { CustomError } from '../middleware/errorHandler';

/**
 * Generate unique SKU for product variation
 */
const generateVariationSKU = async (productId: string, variationOptions: number[]): Promise<string> => {
  try {
    // Get product information
    const [products] = await pool.execute(`
      SELECT p.name, p.sku, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [productId]) as any[];

    if (products.length === 0) {
      throw new Error('Product not found');
    }

    const product = products[0];
    
    // Get variation options information
    const placeholders = variationOptions.map(() => '?').join(',');
    const [options] = await pool.execute(`
      SELECT pvo.name, pvt.name as type_name
      FROM product_variation_options pvo
      JOIN product_variation_types pvt ON pvo.variation_type_id = pvt.id
      WHERE pvo.id IN (${placeholders})
      ORDER BY pvt.sort_order ASC, pvo.sort_order ASC
    `, variationOptions) as any[];

    // Create base SKU from product SKU or generate from product info
    let baseSKU = '';
    if (product.sku && product.sku.trim() !== '') {
      baseSKU = product.sku;
    } else {
      // Generate base SKU like the product controller does
      let categoryCode = 'GEN';
      if (product.category_name) {
        categoryCode = product.category_name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 3)
          .padEnd(3, 'X');
      }
      
      const productCode = product.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 3)
        .padEnd(3, 'X');
      
      baseSKU = `${categoryCode}-${productCode}`;
    }

    // Add variation suffix based on selected options
    const variationSuffix = options
      .map((opt: any) => {
        // Take first 2 characters of type name and first 2 of option name
        const typeCode = opt.type_name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 2);
        const optionCode = opt.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 2);
        return `${typeCode}${optionCode}`;
      })
      .join('-');

    // Generate timestamp for uniqueness
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits
    
    let variationSKU = `${baseSKU}-${variationSuffix}-${timestamp}`;
    let counter = 1;

    // Ensure SKU is unique by checking both products and variations tables
    while (true) {
      try {
        const [existingProducts] = await pool.execute(
          'SELECT id FROM products WHERE sku = ?',
          [variationSKU]
        ) as any[];
        
        const [existingVariations] = await pool.execute(
          'SELECT id FROM product_variations WHERE sku = ?',
          [variationSKU]
        ) as any[];

        if (existingProducts.length === 0 && existingVariations.length === 0) {
          break; // SKU is unique
        }

        // If SKU exists, add counter suffix
        variationSKU = `${baseSKU}-${variationSuffix}-${timestamp}-${counter.toString().padStart(2, '0')}`;
        counter++;

        // Prevent infinite loop
        if (counter > 99) {
          variationSKU = `${baseSKU}-${variationSuffix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          break;
        }
      } catch (error) {
        console.error('Error checking variation SKU uniqueness:', error);
        // Fallback to random suffix
        variationSKU = `${baseSKU}-${variationSuffix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        break;
      }
    }

    return variationSKU;
  } catch (error) {
    console.error('Error generating variation SKU:', error);
    // Fallback SKU
    const fallbackTimestamp = Date.now().toString().slice(-6);
    return `VAR-${fallbackTimestamp}`;
  }
};

// Get all variation types
export const getVariationTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [types] = await pool.execute(`
      SELECT * FROM product_variation_types 
      WHERE is_active = TRUE 
      ORDER BY sort_order ASC, name ASC
    `) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Variation types retrieved successfully',
      data: types
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get variable type suggestions
export const getVariationTypeSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    
    // Common variation type suggestions
    const defaultSuggestions = [
      'Size', 'Color', 'Flavor', 'Cup Size', 'Weight', 'Material', 'Style', 'Capacity', 'Volume', 'Length'
    ];

    let suggestions = defaultSuggestions;

    // If query provided, get existing types that match + filter defaults
    if (query && typeof query === 'string' && query.length > 0) {
      // Get existing types that match the query
      const [existingTypes] = await pool.execute(`
        SELECT DISTINCT name FROM product_variation_types 
        WHERE name LIKE ? AND is_active = TRUE 
        ORDER BY name ASC
        LIMIT 5
      `, [`%${query}%`]) as any[];

      const existingNames = existingTypes.map((type: any) => type.name);
      
      // Filter default suggestions that match query
      const filteredDefaults = defaultSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      );

      // Combine and remove duplicates, prioritize existing types
      suggestions = [
        ...existingNames,
        ...filteredDefaults.filter(suggestion => !existingNames.includes(suggestion))
      ];
    }

    const response: ApiResponse = {
      success: true,
      message: 'Variation type suggestions retrieved successfully',
      data: suggestions.slice(0, 10) // Limit to 10 suggestions
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get variation options for a specific type
export const getVariationOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { typeId } = req.params;

    const [options] = await pool.execute(`
      SELECT pvo.*, pvt.name as type_name, pvt.display_name as type_display_name
      FROM product_variation_options pvo
      JOIN product_variation_types pvt ON pvo.variation_type_id = pvt.id
      WHERE pvo.variation_type_id = ? AND pvo.is_active = TRUE
      ORDER BY pvo.sort_order ASC, pvo.name ASC
    `, [typeId]) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Variation options retrieved successfully',
      data: options
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Create new variation type
export const createVariationType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { name, display_name, description, sort_order = 0 } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const [result] = await pool.execute(`
      INSERT INTO product_variation_types (name, slug, display_name, description, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `, [name, slug, display_name, description, sort_order]) as any;

    const [createdType] = await pool.execute(
      'SELECT * FROM product_variation_types WHERE id = ?',
      [result.insertId]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Variation type created successfully',
      data: createdType[0]
    };

    res.status(201).json(response);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      const error: CustomError = new Error('Variation type with this name already exists');
      error.statusCode = 400;
      return next(error);
    }
    next(error);
  }
};

// Create new variation option
export const createVariationOption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { variation_type_id, name, display_name, color_hex, sort_order = 0 } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const [result] = await pool.execute(`
      INSERT INTO product_variation_options (variation_type_id, name, slug, display_name, color_hex, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [variation_type_id, name, slug, display_name, color_hex || null, sort_order]) as any;

    const [createdOption] = await pool.execute(`
      SELECT pvo.*, pvt.name as type_name, pvt.display_name as type_display_name
      FROM product_variation_options pvo
      JOIN product_variation_types pvt ON pvo.variation_type_id = pvt.id
      WHERE pvo.id = ?
    `, [result.insertId]) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Variation option created successfully',
      data: createdOption[0]
    };

    res.status(201).json(response);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      const error: CustomError = new Error('Variation option with this name already exists for this type');
      error.statusCode = 400;
      return next(error);
    }
    next(error);
  }
};

// Get product variations for a specific product
export const getProductVariations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    // Get all variations for the product
    const [variations] = await pool.execute(`
      SELECT pv.*, p.name as product_name
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.product_id = ? AND pv.is_active = TRUE
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

// Create product variation
export const createProductVariation = async (req: Request, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    await connection.beginTransaction();

    const {
      product_id,
      price,
      sale_price,
      stock_quantity = 0,
      weight,
      dimensions,
      images = [],
      is_default = false,
      variation_options = [] // Array of variation option IDs
    } = req.body;

    // Generate SKU automatically
    const generatedSKU = await generateVariationSKU(product_id, variation_options);

    // Determine stock status
    let stock_status = 'in_stock';
    if (stock_quantity <= 0) {
      stock_status = 'out_of_stock';
    } else if (stock_quantity <= 5) {
      stock_status = 'low_stock';
    }

    // If this is set as default, unset other defaults for this product
    if (is_default) {
      await connection.execute(
        'UPDATE product_variations SET is_default = FALSE WHERE product_id = ?',
        [product_id]
      );
    }

    // Create the variation
    const variationId = uuidv4();
    const [variationResult] = await connection.execute(`
      INSERT INTO product_variations (
        id, product_id, sku, price, sale_price, stock_quantity, stock_status,
        weight, dimensions, images, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      variationId,
      product_id,
      generatedSKU,
      price,
      sale_price || null,
      stock_quantity,
      stock_status,
      weight || null,
      dimensions ? JSON.stringify(dimensions) : null,
      images.length > 0 ? JSON.stringify(images) : null,
      is_default
    ]) as any;

    // Use the generated UUID (no need to query database)
    // const [insertedVariation] = await connection.execute(
    //   'SELECT id FROM product_variations WHERE sku = ?',
    //   [generatedSKU]
    // ) as any[];
    
    // const variationId = insertedVariation[0].id; // Use the generated UUID instead

    // Create variation combinations
    for (const optionId of variation_options) {
      await connection.execute(`
        INSERT INTO product_variation_combinations (product_variation_id, variation_option_id)
        VALUES (?, ?)
      `, [variationId, optionId]);
    }

    await connection.commit();

    // Get the created variation with full details
    const [createdVariation] = await pool.execute(`
      SELECT pv.*, p.name as product_name
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.id = ?
    `, [variationId]) as any[];

    // Get combinations
    const [combinations] = await pool.execute(`
      SELECT pvc.*, pvo.name, pvo.display_name, pvo.color_hex,
             pvt.name as type_name, pvt.display_name as type_display_name
      FROM product_variation_combinations pvc
      JOIN product_variation_options pvo ON pvc.variation_option_id = pvo.id
      JOIN product_variation_types pvt ON pvo.variation_type_id = pvt.id
      WHERE pvc.product_variation_id = ?
      ORDER BY pvt.sort_order ASC, pvo.sort_order ASC
    `, [variationId]) as any[];

    const variation = createdVariation[0];
    variation.combinations = combinations;
    
    // Parse JSON fields
    if (variation.dimensions) {
      variation.dimensions = JSON.parse(variation.dimensions);
    }
    if (variation.images) {
      variation.images = JSON.parse(variation.images);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Product variation created successfully',
      data: variation
    };

    res.status(201).json(response);

  } catch (error: any) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      const error: CustomError = new Error('Product variation with this SKU already exists');
      error.statusCode = 400;
      return next(error);
    }
    next(error);
  } finally {
    connection.release();
  }
};

// Update product variation
export const updateProductVariation = async (req: Request, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { variationId } = req.params;
    const {
      price,
      sale_price,
      stock_quantity,
      weight,
      dimensions,
      images,
      is_default,
      variation_options
    } = req.body;

    await connection.beginTransaction();

    // Check if variation exists
    const [existing] = await connection.execute(
      'SELECT * FROM product_variations WHERE id = ?',
      [variationId]
    ) as any[];

    if (existing.length === 0) {
      const error: CustomError = new Error('Product variation not found');
      error.statusCode = 404;
      return next(error);
    }

    // Determine stock status
    let stock_status = 'in_stock';
    if (stock_quantity <= 0) {
      stock_status = 'out_of_stock';
    } else if (stock_quantity <= 5) {
      stock_status = 'low_stock';
    }

    // If this is set as default, unset other defaults for this product
    if (is_default) {
      await connection.execute(
        'UPDATE product_variations SET is_default = FALSE WHERE product_id = ?',
        [existing[0].product_id]
      );
    }

    // Generate new SKU if variation options changed
    let updatedSKU = existing[0].sku; // Keep existing SKU by default
    if (variation_options && variation_options.length > 0) {
      // If variation options are being updated, generate a new SKU
      updatedSKU = await generateVariationSKU(existing[0].product_id, variation_options);
    }

    // Update the variation
    await connection.execute(`
      UPDATE product_variations SET
        sku = ?, price = ?, sale_price = ?, stock_quantity = ?, stock_status = ?,
        weight = ?, dimensions = ?, images = ?, is_default = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      updatedSKU,
      price,
      sale_price || null,
      stock_quantity,
      stock_status,
      weight || null,
      dimensions ? JSON.stringify(dimensions) : null,
      images && images.length > 0 ? JSON.stringify(images) : null,
      is_default,
      variationId
    ]);

    // Update variation combinations if provided
    if (variation_options && Array.isArray(variation_options)) {
      // Delete existing combinations
      await connection.execute(
        'DELETE FROM product_variation_combinations WHERE product_variation_id = ?',
        [variationId]
      );

      // Create new combinations
      for (const optionId of variation_options) {
        await connection.execute(`
          INSERT INTO product_variation_combinations (product_variation_id, variation_option_id)
          VALUES (?, ?)
        `, [variationId, optionId]);
      }
    }

    await connection.commit();

    // Get the updated variation with full details
    const [updatedVariation] = await pool.execute(`
      SELECT pv.*, p.name as product_name
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.id = ?
    `, [variationId]) as any[];

    // Get combinations
    const [combinations] = await pool.execute(`
      SELECT pvc.*, pvo.name, pvo.display_name, pvo.color_hex,
             pvt.name as type_name, pvt.display_name as type_display_name
      FROM product_variation_combinations pvc
      JOIN product_variation_options pvo ON pvc.variation_option_id = pvo.id
      JOIN product_variation_types pvt ON pvo.variation_type_id = pvt.id
      WHERE pvc.product_variation_id = ?
      ORDER BY pvt.sort_order ASC, pvo.sort_order ASC
    `, [variationId]) as any[];

    const variation = updatedVariation[0];
    variation.combinations = combinations;
    
    // Parse JSON fields
    if (variation.dimensions) {
      variation.dimensions = JSON.parse(variation.dimensions);
    }
    if (variation.images) {
      variation.images = JSON.parse(variation.images);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Product variation updated successfully',
      data: variation
    };

    res.status(200).json(response);

  } catch (error: any) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      const error: CustomError = new Error('Product variation with this SKU already exists');
      error.statusCode = 400;
      return next(error);
    }
    next(error);
  } finally {
    connection.release();
  }
};

// Delete product variation
export const deleteProductVariation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variationId } = req.params;

    // Check if variation exists
    const [existing] = await pool.execute(
      'SELECT * FROM product_variations WHERE id = ?',
      [variationId]
    ) as any[];

    if (existing.length === 0) {
      const error: CustomError = new Error('Product variation not found');
      error.statusCode = 404;
      return next(error);
    }

    // Soft delete by setting is_active to false
    await pool.execute(
      'UPDATE product_variations SET is_active = FALSE WHERE id = ?',
      [variationId]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Product variation deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Create product with inline variations
export const createProductWithVariations = async (req: Request, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors for createProductWithVariations:', errors.array());
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    await connection.beginTransaction();

    const {
      // Product data
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
      meta_description,
      // Variable product data
      variable_type,
      variables = [] // Array of { name, price, sale_price }
    } = req.body;

    // Generate slug for product
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists and modify if needed
    const [existingSlugs] = await connection.execute(
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
      // Generate base SKU like the product controller does
      let categoryCode = 'GEN';
      if (category_id) {
        try {
          const [categories] = await connection.execute(
            'SELECT name FROM categories WHERE id = ?',
            [category_id]
          ) as any[];
          
          if (categories.length > 0) {
            const categoryName = categories[0].name;
            categoryCode = categoryName
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .substring(0, 3)
              .padEnd(3, 'X');
          }
        } catch (error) {
          console.log('Could not fetch category for SKU generation, using default');
        }
      }
      
      const productCode = name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 3)
        .padEnd(3, 'X');
      
      const timestamp = Date.now().toString().slice(-6);
      finalSKU = `${categoryCode}-${productCode}-${timestamp}`;
    }

    // Determine stock status
    let stockStatus = 'in_stock';
    if (stock_quantity <= 0) {
      stockStatus = 'out_of_stock';
    } else if (stock_quantity <= 5) {
      stockStatus = 'low_stock';
    }

    // Create the product
    const [productResult] = await connection.execute(`
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
      finalSKU, 
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

    // Get the actual UUID that was generated for the product
    const [insertedProduct] = await connection.execute(
      'SELECT id FROM products WHERE sku = ?',
      [finalSKU]
    ) as any[];
    
    const productId = insertedProduct[0].id;

    // If variable_type and variables are provided, create variations
    if (variable_type && variables && variables.length > 0) {
      // Create or get the variation type
      let variationTypeId;
      const typeSlug = variable_type.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      // Check if variation type already exists
      const [existingTypes] = await connection.execute(
        'SELECT id FROM product_variation_types WHERE name = ? OR slug = ?',
        [variable_type, typeSlug]
      ) as any[];

      if (existingTypes.length > 0) {
        variationTypeId = existingTypes[0].id;
      } else {
        // Create new variation type
        const [typeResult] = await connection.execute(
          'INSERT INTO product_variation_types (name, slug, display_name) VALUES (?, ?, ?)',
          [variable_type, typeSlug, variable_type]
        ) as any;
        variationTypeId = typeResult.insertId;
      }

      // Create variation options and product variations
      for (let i = 0; i < variables.length; i++) {
        const variable = variables[i];
        const { name: varName, price: varPrice, sale_price: varSalePrice } = variable;

        // Create or get variation option
        let variationOptionId;
        const optionSlug = varName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        
        const [existingOptions] = await connection.execute(
          'SELECT id FROM product_variation_options WHERE variation_type_id = ? AND (name = ? OR slug = ?)',
          [variationTypeId, varName, optionSlug]
        ) as any[];

        if (existingOptions.length > 0) {
          variationOptionId = existingOptions[0].id;
        } else {
          // Create new variation option
          const [optionResult] = await connection.execute(
            'INSERT INTO product_variation_options (variation_type_id, name, slug, display_name, sort_order) VALUES (?, ?, ?, ?, ?)',
            [variationTypeId, varName, optionSlug, varName, i]
          ) as any;
          variationOptionId = optionResult.insertId;
        }

        // Generate variation SKU
        const variationSKU = await generateVariationSKU(productId, [variationOptionId]);

        // Determine variation stock status
        const varStockQuantity = parseInt(stock_quantity) || 0; // Use same stock as main product for now
        let varStockStatus = 'in_stock';
        if (varStockQuantity <= 0) {
          varStockStatus = 'out_of_stock';
        } else if (varStockQuantity <= 5) {
          varStockStatus = 'low_stock';
        }

        // Create product variation
        const variationId2 = uuidv4();
        const [variationResult] = await connection.execute(`
          INSERT INTO product_variations (
            id, product_id, sku, price, sale_price, stock_quantity, stock_status, is_default
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          variationId2,
          productId,
          variationSKU,
          parseFloat(varPrice),
          varSalePrice ? parseFloat(varSalePrice) : null,
          varStockQuantity,
          varStockStatus,
          i === 0 // First variation is default
        ]) as any;

        // Use the generated UUID (no need to query database)
        // const [insertedVariation] = await connection.execute(
        //   'SELECT id FROM product_variations WHERE sku = ?',
        //   [variationSKU]
        // ) as any[];
        
        // Use variationId2 that was generated above

        // Create variation combination
        await connection.execute(
          'INSERT INTO product_variation_combinations (product_variation_id, variation_option_id) VALUES (?, ?)',
          [variationId2, variationOptionId]
        );
      }
    }

    await connection.commit();

    // Get the created product with variations
    const [createdProduct] = await connection.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Product with variations created successfully',
      data: {
        product: {
          ...createdProduct[0],
          images: (() => {
            try {
              const images = createdProduct[0].images;
              return images && typeof images === 'string' ? JSON.parse(images) : (images || []);
            } catch (error) {
              return [];
            }
          })()
        }
      }
    };

    res.status(201).json(response);

  } catch (error: any) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// Update product with inline variations
export const updateProductWithVariations = async (req: Request, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors for updateProductWithVariations:', errors.array());
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    await connection.beginTransaction();

    const { productId } = req.params;
    const {
      // Product data
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
      meta_description,
      // Variable product data
      variable_type,
      variables = [] // Array of { name, price, sale_price }
    } = req.body;

    // Check if product exists
    const [existingProducts] = await connection.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    ) as any[];

    if (existingProducts.length === 0) {
      const error: CustomError = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    // Generate new slug if name is being updated
    let updateData: any = {
      name,
      description,
      short_description,
      sku,
      price,
      sale_price,
      stock_quantity,
      category_id,
      featured_image,
      images: JSON.stringify(gallery || []),
      status,
      featured,
      meta_title,
      meta_description
    };

    if (name && name !== existingProducts[0].name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug already exists
      const [slugExists] = await connection.execute(
        'SELECT id FROM products WHERE slug = ? AND id != ?',
        [slug, productId]
      ) as any[];

      if (slugExists.length > 0) {
        updateData.slug = `${slug}-${Date.now()}`;
      } else {
        updateData.slug = slug;
      }
    }

    // Handle stock status update
    if (stock_quantity !== undefined) {
      if (stock_quantity <= 0) {
        updateData.stock_status = 'out_of_stock';
      } else if (stock_quantity <= 5) {
        updateData.stock_status = 'low_stock';
      } else {
        updateData.stock_status = 'in_stock';
      }
    }

    // Build update query dynamically
    const updateFields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const updateValues = updateFields.map(field => updateData[field]);
    
    if (updateFields.length > 0) {
      const setClause = updateFields.map(field => `${field} = ?`).join(', ');
      updateValues.push(productId);

      await connection.execute(
        `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        updateValues
      );
    }

    // Handle variations
    if (variable_type && variables && variables.length > 0) {
      // Delete existing variations for this product (delete combinations first due to foreign key)
      await connection.execute(
        'DELETE pvc FROM product_variation_combinations pvc JOIN product_variations pv ON pvc.product_variation_id = pv.id WHERE pv.product_id = ?',
        [productId]
      );
      await connection.execute(
        'DELETE FROM product_variations WHERE product_id = ?',
        [productId]
      );

      // Create or get the variation type
      let variationTypeId;
      const typeSlug = variable_type.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const [existingTypes] = await connection.execute(
        'SELECT id FROM product_variation_types WHERE name = ? OR slug = ?',
        [variable_type, typeSlug]
      ) as any[];

      if (existingTypes.length > 0) {
        variationTypeId = existingTypes[0].id;
      } else {
        const [typeResult] = await connection.execute(
          'INSERT INTO product_variation_types (name, slug, display_name) VALUES (?, ?, ?)',
          [variable_type, typeSlug, variable_type]
        ) as any;
        variationTypeId = typeResult.insertId;
      }

      // Create variation options and product variations
      for (let i = 0; i < variables.length; i++) {
        const variable = variables[i];
        const { name: varName, price: varPrice, sale_price: varSalePrice } = variable;

        // Create or get variation option
        let variationOptionId;
        const optionSlug = varName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        
        const [existingOptions] = await connection.execute(
          'SELECT id FROM product_variation_options WHERE variation_type_id = ? AND (name = ? OR slug = ?)',
          [variationTypeId, varName, optionSlug]
        ) as any[];

        if (existingOptions.length > 0) {
          variationOptionId = existingOptions[0].id;
        } else {
          const [optionResult] = await connection.execute(
            'INSERT INTO product_variation_options (variation_type_id, name, slug, display_name, sort_order) VALUES (?, ?, ?, ?, ?)',
            [variationTypeId, varName, optionSlug, varName, i]
          ) as any;
          variationOptionId = optionResult.insertId;
        }

        // Generate variation SKU
        const variationSKU = await generateVariationSKU(productId, [variationOptionId]);

        // Determine variation stock status
        const varStockQuantity = parseInt(stock_quantity) || 0;
        let varStockStatus = 'in_stock';
        if (varStockQuantity <= 0) {
          varStockStatus = 'out_of_stock';
        } else if (varStockQuantity <= 5) {
          varStockStatus = 'low_stock';
        }

        // Create product variation
        const variationId3 = uuidv4();
        const [variationResult] = await connection.execute(`
          INSERT INTO product_variations (
            id, product_id, sku, price, sale_price, stock_quantity, stock_status, is_default
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          variationId3,
          productId,
          variationSKU,
          parseFloat(varPrice),
          varSalePrice ? parseFloat(varSalePrice) : null,
          varStockQuantity,
          varStockStatus,
          i === 0 // First variation is default
        ]) as any;

        // Use the generated UUID (no need to query database)
        // const [insertedVariation] = await connection.execute(
        //   'SELECT id FROM product_variations WHERE sku = ?',
        //   [variationSKU]
        // ) as any[];
        
        // Use variationId3 that was generated above

        // Create variation combination
        await connection.execute(
          'INSERT INTO product_variation_combinations (product_variation_id, variation_option_id) VALUES (?, ?)',
          [variationId3, variationOptionId]
        );
      }
    } else {
      // If no variables provided, delete existing variations (delete combinations first due to foreign key)
      await connection.execute(
        'DELETE pvc FROM product_variation_combinations pvc JOIN product_variations pv ON pvc.product_variation_id = pv.id WHERE pv.product_id = ?',
        [productId]
      );
      await connection.execute(
        'DELETE FROM product_variations WHERE product_id = ?',
        [productId]
      );
    }

    await connection.commit();

    // Get the updated product
    const [updatedProduct] = await connection.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Product with variations updated successfully',
      data: {
        product: {
          ...updatedProduct[0],
          images: (() => {
            try {
              const images = updatedProduct[0].images;
              return images && typeof images === 'string' ? JSON.parse(images) : (images || []);
            } catch (error) {
              return [];
            }
          })()
        }
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};