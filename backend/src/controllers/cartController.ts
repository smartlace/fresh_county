import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { ApiResponse, CartItem } from '../types';
import { CustomError } from '../middleware/errorHandler';

/**
 * Calculate cart totals including tax and shipping
 */
const calculateCartTotals = async (cartItems: any[]) => {
  let subtotal = 0;
  
  cartItems.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  // Get tax rate from system settings (default 7.5% VAT for Nigeria)
  const [taxSettings] = await pool.execute(
    'SELECT setting_value FROM system_settings WHERE setting_key = "tax_rate"'
  ) as any[];
  
  const taxRate = taxSettings.length > 0 ? parseFloat(taxSettings[0].setting_value) : 7.5;
  const taxAmount = (subtotal * taxRate) / 100;

  // Get shipping cost from system settings
  const [shippingSettings] = await pool.execute(
    'SELECT setting_value FROM system_settings WHERE setting_key = "shipping_cost_standard"'
  ) as any[];
  
  const shippingCost = shippingSettings.length > 0 ? parseFloat(shippingSettings[0].setting_value) : 1500;

  // Check for free shipping threshold
  const [freeShippingSettings] = await pool.execute(
    'SELECT setting_value FROM system_settings WHERE setting_key = "free_shipping_threshold"'
  ) as any[];
  
  const freeShippingThreshold = freeShippingSettings.length > 0 ? parseFloat(freeShippingSettings[0].setting_value) : 50000;
  const finalShippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCost;

  const totalAmount = subtotal + taxAmount + finalShippingCost;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(taxAmount * 100) / 100,
    tax_rate: taxRate,
    shipping_cost: Math.round(finalShippingCost * 100) / 100,
    discount_amount: 0, // Will be calculated when coupons are applied
    total_amount: Math.round(totalAmount * 100) / 100
  };
};

/**
 * Get cart contents for authenticated user or guest session
 */
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;
    const sessionId = req.session_id;

    if (!userId && !sessionId) {
      const error: CustomError = new Error('User authentication or session required');
      error.statusCode = 401;
      return next(error);
    }

    // Build query based on user type
    let whereClause = '';
    let queryParams: any[] = [];

    if (userId) {
      whereClause = 'ci.user_id = ?';
      queryParams.push(userId);
    } else {
      whereClause = 'ci.session_id = ?';
      queryParams.push(sessionId);
    }

    // Get cart items with product information
    const [cartItems] = await pool.execute(`
      SELECT 
        ci.*,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.featured_image as product_image,
        p.stock_quantity,
        p.stock_status,
        p.price as current_price,
        p.sale_price as current_sale_price,
        CASE 
          WHEN p.sale_price IS NOT NULL AND p.sale_price > 0 
          THEN p.sale_price 
          ELSE p.price 
        END as effective_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ${whereClause} AND p.status = 'active'
      ORDER BY ci.created_at ASC
    `, queryParams) as any[];

    // Parse attributes JSON
    const formattedCartItems = cartItems.map((item: any) => ({
      ...item,
      attributes: item.attributes ? JSON.parse(item.attributes) : {},
      line_total: item.price * item.quantity
    }));

    // Calculate totals
    const totals = await calculateCartTotals(formattedCartItems);
    const itemCount = formattedCartItems.reduce((total: number, item: any) => total + item.quantity, 0);

    const response: ApiResponse = {
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        items: formattedCartItems,
        totals,
        item_count: itemCount
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { product_id, quantity = 1, attributes = {} } = req.body;
    const userId = req.user?.user_id;
    const sessionId = req.session_id;

    if (!userId && !sessionId) {
      const error: CustomError = new Error('User authentication or session required');
      error.statusCode = 401;
      return next(error);
    }

    // Verify product exists and is active
    const [products] = await pool.execute(`
      SELECT id, name, price, sale_price, stock_quantity, stock_status, manage_stock
      FROM products 
      WHERE id = ? AND status = 'active'
    `, [product_id]) as any[];

    if (products.length === 0) {
      const error: CustomError = new Error('Product not found or inactive');
      error.statusCode = 404;
      return next(error);
    }

    const product = products[0];

    // Check stock availability
    if (product.manage_stock && product.stock_status === 'out_of_stock') {
      const error: CustomError = new Error('Product is out of stock');
      error.statusCode = 400;
      return next(error);
    }

    if (product.manage_stock && product.stock_quantity < quantity) {
      const error: CustomError = new Error(`Only ${product.stock_quantity} items available in stock`);
      error.statusCode = 400;
      return next(error);
    }

    // Determine current price
    const currentPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.price;

    // Check if item already exists in cart
    let whereClause = '';
    let queryParams: any[] = [];

    if (userId) {
      whereClause = 'user_id = ? AND product_id = ?';
      queryParams = [userId, product_id];
    } else {
      whereClause = 'session_id = ? AND product_id = ?';
      queryParams = [sessionId, product_id];
    }

    const [existingItems] = await pool.execute(
      `SELECT id, quantity FROM cart_items WHERE ${whereClause}`,
      queryParams
    ) as any[];

    if (existingItems.length > 0) {
      // Update existing item quantity
      const newQuantity = existingItems[0].quantity + quantity;
      
      // Check stock for new quantity
      if (product.manage_stock && product.stock_quantity < newQuantity) {
        const error: CustomError = new Error(`Only ${product.stock_quantity} items available. You already have ${existingItems[0].quantity} in cart.`);
        error.statusCode = 400;
        return next(error);
      }

      await pool.execute(
        'UPDATE cart_items SET quantity = ?, price = ?, attributes = ? WHERE id = ?',
        [newQuantity, currentPrice, JSON.stringify(attributes), existingItems[0].id]
      );

      const response: ApiResponse = {
        success: true,
        message: 'Cart item updated successfully',
        data: {
          item_id: existingItems[0].id,
          quantity: newQuantity,
          action: 'updated'
        }
      };

      return res.status(200).json(response);
    } else {
      // Add new item to cart
      const [result] = await pool.execute(`
        INSERT INTO cart_items (user_id, session_id, product_id, quantity, attributes, price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId || null, sessionId || null, product_id, quantity, JSON.stringify(attributes), currentPrice]) as any;

      const response: ApiResponse = {
        success: true,
        message: 'Item added to cart successfully',
        data: {
          item_id: result.insertId,
          quantity,
          action: 'added'
        }
      };

      return res.status(201).json(response);
    }

  } catch (error: any) {
    next(error);
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.user_id;
    const sessionId = req.session_id;

    if (!userId && !sessionId) {
      const error: CustomError = new Error('User authentication or session required');
      error.statusCode = 401;
      return next(error);
    }

    // Verify cart item exists and belongs to user/session
    let whereClause = '';
    let queryParams: any[] = [];

    if (userId) {
      whereClause = 'ci.id = ? AND ci.user_id = ?';
      queryParams = [id, userId];
    } else {
      whereClause = 'ci.id = ? AND ci.session_id = ?';
      queryParams = [id, sessionId];
    }

    const [cartItems] = await pool.execute(`
      SELECT 
        ci.id, ci.product_id, ci.quantity,
        p.stock_quantity, p.stock_status, p.manage_stock, p.price, p.sale_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ${whereClause} AND p.status = 'active'
    `, queryParams) as any[];

    if (cartItems.length === 0) {
      const error: CustomError = new Error('Cart item not found');
      error.statusCode = 404;
      return next(error);
    }

    const cartItem = cartItems[0];

    // Check stock availability for new quantity
    if (cartItem.manage_stock && cartItem.stock_status === 'out_of_stock') {
      const error: CustomError = new Error('Product is out of stock');
      error.statusCode = 400;
      return next(error);
    }

    if (cartItem.manage_stock && cartItem.stock_quantity < quantity) {
      const error: CustomError = new Error(`Only ${cartItem.stock_quantity} items available in stock`);
      error.statusCode = 400;
      return next(error);
    }

    // Update current price
    const currentPrice = cartItem.sale_price && cartItem.sale_price > 0 ? cartItem.sale_price : cartItem.price;

    // Update cart item
    await pool.execute(
      'UPDATE cart_items SET quantity = ?, price = ? WHERE id = ?',
      [quantity, currentPrice, id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Cart item updated successfully',
      data: {
        item_id: id,
        quantity,
        price: currentPrice
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;
    const sessionId = req.session_id;

    if (!userId && !sessionId) {
      const error: CustomError = new Error('User authentication or session required');
      error.statusCode = 401;
      return next(error);
    }

    // Verify cart item exists and belongs to user/session
    let whereClause = '';
    let queryParams: any[] = [];

    if (userId) {
      whereClause = 'id = ? AND user_id = ?';
      queryParams = [id, userId];
    } else {
      whereClause = 'id = ? AND session_id = ?';
      queryParams = [id, sessionId];
    }

    const [result] = await pool.execute(
      `DELETE FROM cart_items WHERE ${whereClause}`,
      queryParams
    ) as any;

    if (result.affectedRows === 0) {
      const error: CustomError = new Error('Cart item not found');
      error.statusCode = 404;
      return next(error);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Item removed from cart successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;
    const sessionId = req.session_id;

    if (!userId && !sessionId) {
      const error: CustomError = new Error('User authentication or session required');
      error.statusCode = 401;
      return next(error);
    }

    // Clear cart items
    let whereClause = '';
    let queryParams: any[] = [];

    if (userId) {
      whereClause = 'user_id = ?';
      queryParams = [userId];
    } else {
      whereClause = 'session_id = ?';
      queryParams = [sessionId];
    }

    await pool.execute(
      `DELETE FROM cart_items WHERE ${whereClause}`,
      queryParams
    );

    const response: ApiResponse = {
      success: true,
      message: 'Cart cleared successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Apply coupon to cart
 */
export const applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { coupon_code } = req.body;
    const userId = req.user?.user_id;
    const sessionId = req.session_id;

    if (!userId && !sessionId) {
      const error: CustomError = new Error('User authentication or session required');
      error.statusCode = 401;
      return next(error);
    }

    if (!coupon_code) {
      const error: CustomError = new Error('Coupon code is required');
      error.statusCode = 400;
      return next(error);
    }

    // Verify coupon exists and is valid
    const [coupons] = await pool.execute(`
      SELECT * FROM coupons 
      WHERE code = ? AND is_active = TRUE 
      AND valid_from <= NOW() AND valid_until >= NOW()
    `, [coupon_code]) as any[];

    if (coupons.length === 0) {
      const error: CustomError = new Error('Invalid or expired coupon code');
      error.statusCode = 400;
      return next(error);
    }

    const coupon = coupons[0];

    // Check usage limits
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      const error: CustomError = new Error('Coupon usage limit exceeded');
      error.statusCode = 400;
      return next(error);
    }

    // Check user-specific usage limit (if user is authenticated)
    if (userId && coupon.usage_limit_per_user) {
      const [userUsage] = await pool.execute(
        'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ? AND user_id = ?',
        [coupon.id, userId]
      ) as any[];

      if (userUsage[0].count >= coupon.usage_limit_per_user) {
        const error: CustomError = new Error('You have already used this coupon the maximum number of times');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Get current cart totals
    const cartData = await getCartData(userId, sessionId);
    
    if (cartData.items.length === 0) {
      const error: CustomError = new Error('Cart is empty');
      error.statusCode = 400;
      return next(error);
    }

    const cartTotals = await calculateCartTotals(cartData.items);

    // Check minimum amount requirement
    if (coupon.minimum_amount > 0 && cartTotals.subtotal < coupon.minimum_amount) {
      const error: CustomError = new Error(`Minimum order amount of ₦${coupon.minimum_amount} required for this coupon`);
      error.statusCode = 400;
      return next(error);
    }

    // Calculate discount
    let discountAmount = 0;
    
    if (coupon.type === 'percentage') {
      discountAmount = (cartTotals.subtotal * coupon.value) / 100;
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = coupon.maximum_discount;
      }
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = Math.min(coupon.value, cartTotals.subtotal);
    } else if (coupon.type === 'free_shipping') {
      discountAmount = cartTotals.shipping_cost;
    }

    const finalTotalAmount = cartTotals.subtotal + cartTotals.tax_amount + cartTotals.shipping_cost - discountAmount;

    const response: ApiResponse = {
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description
        },
        discount_amount: Math.round(discountAmount * 100) / 100,
        updated_totals: {
          ...cartTotals,
          discount_amount: Math.round(discountAmount * 100) / 100,
          total_amount: Math.round(finalTotalAmount * 100) / 100
        }
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Calculate totals for provided cart items
 */
export const calculateTotals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      const error: CustomError = new Error('Cart items array is required');
      error.statusCode = 400;
      return next(error);
    }

    // Calculate totals using the same logic as getCart
    const totals = await calculateCartTotals(items);
    const itemCount = items.reduce((total: number, item: any) => total + item.quantity, 0);

    const response: ApiResponse = {
      success: true,
      message: 'Cart totals calculated successfully',
      data: {
        totals,
        item_count: itemCount
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Helper function to get cart data
 */
const getCartData = async (userId?: number, sessionId?: string) => {
  let whereClause = '';
  let queryParams: any[] = [];

  if (userId) {
    whereClause = 'ci.user_id = ?';
    queryParams.push(userId);
  } else if (sessionId) {
    whereClause = 'ci.session_id = ?';
    queryParams.push(sessionId);
  } else {
    throw new Error('User ID or session ID required');
  }

  const [cartItems] = await pool.execute(`
    SELECT 
      ci.*,
      p.name as product_name,
      p.price as current_price,
      p.sale_price as current_sale_price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ${whereClause} AND p.status = 'active'
  `, queryParams) as any[];

  return {
    items: cartItems.map((item: any) => ({
      ...item,
      attributes: item.attributes ? JSON.parse(item.attributes) : {}
    }))
  };
};