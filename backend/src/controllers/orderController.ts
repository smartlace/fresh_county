import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { ApiResponse, Order, OrderItem } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { emailService, OrderEmailData, AdminNotificationData } from '../services/emailService';
import { generateOrderNumber } from '../utils/auth';

/**
 * Calculate order totals including tax and shipping
 */
const calculateOrderTotals = async (cartItems: any[], couponCode?: string, customShippingCost?: number) => {
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

  // Use custom shipping cost from frontend, or fall back to system settings
  let finalShippingCost = 0;
  
  if (customShippingCost !== undefined) {
    finalShippingCost = customShippingCost;
  } else {
    // Get shipping cost from system settings (fallback)
    const [shippingSettings] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = "shipping_cost_standard"'
    ) as any[];
    
    const shippingCost = shippingSettings.length > 0 ? parseFloat(shippingSettings[0].setting_value) : 1500;

    // Check for free shipping threshold
    const [freeShippingSettings] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = "free_shipping_threshold"'
    ) as any[];
    
    const freeShippingThreshold = freeShippingSettings.length > 0 ? parseFloat(freeShippingSettings[0].setting_value) : 50000;
    finalShippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  }

  // Apply coupon discount if provided
  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const [coupons] = await pool.execute(`
      SELECT * FROM coupons 
      WHERE code = ? AND is_active = TRUE 
      AND (starts_at IS NULL OR starts_at <= NOW()) 
      AND (expires_at IS NULL OR expires_at >= NOW())
    `, [couponCode]) as any[];

    if (coupons.length > 0) {
      const coupon = coupons[0];
      
      // Check usage limits
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        // Coupon has reached its usage limit
        return {
          subtotal: Math.round(subtotal * 100) / 100,
          tax_amount: Math.round(taxAmount * 100) / 100,
          shipping_cost: Math.round(finalShippingCost * 100) / 100,
          discount_amount: 0,
          total_amount: Math.round((subtotal + taxAmount + finalShippingCost) * 100) / 100,
          applied_coupon: null,
          coupon_error: 'Coupon usage limit reached'
        };
      }
      
      // Check minimum amount requirement
      if (coupon.minimum_order_amount <= subtotal) {
        if (coupon.type === 'percentage') {
          discountAmount = (subtotal * coupon.discount_value) / 100;
          if (coupon.maximum_discount_amount && discountAmount > coupon.maximum_discount_amount) {
            discountAmount = coupon.maximum_discount_amount;
          }
        } else if (coupon.type === 'fixed_amount') {
          discountAmount = Math.min(coupon.discount_value, subtotal);
        }
        
        appliedCoupon = coupon;
      } else {
        return {
          subtotal: Math.round(subtotal * 100) / 100,
          tax_amount: Math.round(taxAmount * 100) / 100,
          shipping_cost: Math.round(finalShippingCost * 100) / 100,
          discount_amount: 0,
          total_amount: Math.round((subtotal + taxAmount + finalShippingCost) * 100) / 100,
          applied_coupon: null,
          coupon_error: `Minimum order amount of ₦${coupon.minimum_order_amount} required`
        };
      }
    } else {
      return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax_amount: Math.round(taxAmount * 100) / 100,
        shipping_cost: Math.round(finalShippingCost * 100) / 100,
        discount_amount: 0,
        total_amount: Math.round((subtotal + taxAmount + finalShippingCost) * 100) / 100,
        applied_coupon: null,
        coupon_error: 'Invalid or inactive coupon code'
      };
    }
  }

  const totalAmount = subtotal + taxAmount + finalShippingCost - discountAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax_amount: Math.round(taxAmount * 100) / 100,
    shipping_cost: Math.round(finalShippingCost * 100) / 100,
    discount_amount: Math.round(discountAmount * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
    applied_coupon: appliedCoupon
  };
};

/**
 * Create a new order
 */
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();
  
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
      shipping_address,
      billing_address,
      payment_method = 'paystack',
      coupon_code,
      delivery_type,
      delivery_cost,
      shipping_zone_id,
      notes,
      cart_items
    } = req.body;

    console.log('🔍 Full request body:', JSON.stringify(req.body, null, 2));
    console.log('📦 Cart items received:', JSON.stringify(cart_items, null, 2));

    const userId = req.user?.user_id;
    const sessionId = req.session_id;

    // Ensure user is authenticated
    if (!userId) {
      const error: CustomError = new Error('Authentication required to place orders');
      error.statusCode = 401;
      return next(error);
    }

    // Check if cart items are provided
    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      const error: CustomError = new Error('Cart items are required');
      error.statusCode = 400;
      return next(error);
    }

    await connection.beginTransaction();

    // Validate and enrich cart items with product data
    const enrichedCartItems = [];
    for (const item of cart_items) {
      const [productData] = await connection.execute(`
        SELECT 
          id,
          name,
          price,
          sale_price,
          stock_quantity,
          status
        FROM products 
        WHERE id = ? AND status = 'active'
      `, [item.product_id]) as any[];

      if (productData.length === 0) {
        const error: CustomError = new Error(`Product not found: ${item.product_id}`);
        error.statusCode = 400;
        return next(error);
      }

      const product = productData[0];
      enrichedCartItems.push({
        ...item,
        product_name: product.name,
        current_price: product.price,
        current_sale_price: product.sale_price,
        stock_quantity: product.stock_quantity,
        // Use the price from frontend (which should match current product price)
        price: item.price
      });
    }

    const cartItems = enrichedCartItems;

    // Validate stock availability
    for (const item of cartItems) {
      if (item.stock_quantity < item.quantity) {
        const error: CustomError = new Error(`Insufficient stock for ${item.product_name}. Only ${item.stock_quantity} available.`);
        error.statusCode = 400;
        return next(error);
      }
    }

    // Calculate order totals
    const totals = await calculateOrderTotals(cartItems, coupon_code, delivery_cost);
    
    // Get shipping zone name if shipping_zone_id is provided
    let shipping_zone_name = null;
    if (shipping_zone_id) {
      try {
        const [shippingZone] = await pool.execute(
          'SELECT name FROM shipping_zones WHERE id = ?',
          [shipping_zone_id]
        ) as any[];
        if (shippingZone.length > 0) {
          shipping_zone_name = shippingZone[0].name;
        }
      } catch (error) {
        console.warn('Failed to get shipping zone name:', error);
      }
    }
    
    // Generate order number and UUID
    const orderNumber = generateOrderNumber();
    const { v4: uuidv4 } = require('uuid');
    const orderId = uuidv4();

    // Create order
    await connection.execute(`
      INSERT INTO orders (
        id, user_id, order_status, payment_status, payment_method,
        total_amount, discount_amount, coupon_id, coupon_code,
        shipping_address, delivery_type, delivery_cost, shipping_zone_id, shipping_zone_name, payment_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      userId,
      'pending',
      'pending',
      payment_method,
      totals.total_amount,
      totals.discount_amount,
      totals.applied_coupon ? totals.applied_coupon.id : null,
      coupon_code || null,
      JSON.stringify(shipping_address),
      delivery_type || 'home',
      delivery_cost || 0,
      shipping_zone_id || null,
      shipping_zone_name || null,
      orderNumber // Store order number in payment_reference for now
    ]);

    // Create order items
    for (const item of cartItems) {
      console.log('💾 Creating order item:', {
        product_id: item.product_id,
        variation_id: item.variation_id,
        variation_name: item.variation_name,
        product_name: item.product_name
      });
      
      await connection.execute(`
        INSERT INTO order_items (
          order_id, product_id, quantity, price, variation_id, variation_name
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
        item.variation_id || null,
        item.variation_name || null
      ]);

      // Update product stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Record coupon usage if applied
    if (totals.applied_coupon && userId) {
      await connection.execute(`
        INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
        VALUES (?, ?, ?, ?)
      `, [totals.applied_coupon.id, userId, orderId, totals.discount_amount]);

      // Update coupon usage count
      await connection.execute(
        'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
        [totals.applied_coupon.id]
      );
    }

    // Create initial order status history entry
    await connection.execute(`
      INSERT INTO order_status_history (order_id, status, notes, changed_by)
      VALUES (?, 'pending', 'Order created', ?)
    `, [orderId, userId || null]);

    // Cart is managed by frontend, no need to clear database cart

    await connection.commit();

    // Get created order with items
    const [orders] = await pool.execute(`
      SELECT 
        o.*,
        u.email as user_email,
        u.first_name,
        u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]) as any[];

    const [orderItems] = await pool.execute(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.slug as product_slug,
        p.featured_image as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]) as any[];

    const order = {
      ...orders[0],
      order_number: orderNumber, // Use generated order number
      subtotal: totals.subtotal,
      tax_amount: totals.tax_amount,
      shipping_cost: totals.shipping_cost,
      items: orderItems.map((item: any) => ({
        ...item,
        attributes: item.attributes ? JSON.parse(item.attributes) : {}
      })),
      shipping_address: typeof orders[0].shipping_address === 'string' ? JSON.parse(orders[0].shipping_address) : orders[0].shipping_address,
      billing_address: typeof orders[0].shipping_address === 'string' ? JSON.parse(orders[0].shipping_address) : orders[0].shipping_address
    };

    // Send admin notification for new order
    try {
      const adminNotification: AdminNotificationData = {
        type: 'new_order',
        title: 'New Order Received',
        message: `New order #${orderNumber} received from ${orders[0].first_name} ${orders[0].last_name}. Total: ₦${totals.total_amount.toLocaleString()}. Payment pending - requires attention.`,
        data: {
          orderNumber: orderNumber,
          customerEmail: orders[0].user_email,
          customerName: `${orders[0].first_name} ${orders[0].last_name}`.trim(),
          amount: `₦${totals.total_amount.toLocaleString()}`,
          status: 'pending',
          paymentStatus: 'pending'
        },
        timestamp: new Date().toISOString()
      };

      await emailService.sendAdminNotification(adminNotification);
      console.log(`✅ Admin notification sent for new order ${orderNumber}`);
    } catch (error) {
      console.error(`❌ Failed to send admin notification for new order ${orderNumber}:`, error);
      // Don't fail the order creation if notification fails
    }

    // Note: Order confirmation email will be sent when payment is confirmed by admin
    // This prevents sending confirmations for pending orders that may not be paid

    const response: ApiResponse = {
      success: true,
      message: 'Order created successfully',
      data: { order }
    };

    res.status(201).json(response);

  } catch (error: any) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get orders for authenticated user
 */
export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;
    const { 
      page = 1, 
      limit = 10 
    } = req.query;

    if (!userId) {
      const error: CustomError = new Error('User authentication required');
      error.statusCode = 401;
      return next(error);
    }

    const pageNum = parseInt(String(page)) || 1;
    const limitNum = parseInt(String(limit)) || 10;
    const offset = (pageNum - 1) * limitNum;

    // MySQL doesn't support parameters for LIMIT/OFFSET, so we use safe string interpolation
    // but keep WHERE clause parameterized for security
    const query = `
      SELECT 
        o.id, 
        COALESCE(o.payment_reference, CONCAT('FC-', LEFT(o.id, 8))) as order_number, 
        o.order_status as status, 
        o.payment_status, 
        o.payment_method,
        o.total_amount,
        o.discount_amount,
        o.coupon_code,
        o.created_at, 
        o.updated_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`;
    const [countResult] = await pool.execute(countQuery, [userId]) as any[];
    const totalOrders = countResult[0].total;

    const [orders] = await pool.execute(query, [userId]) as any[];

    // Add item counts for each order
    for (let i = 0; i < orders.length; i++) {
      const [itemCount] = await pool.execute(`
        SELECT COUNT(*) as item_count FROM order_items WHERE order_id = ?
      `, [orders[i].id]) as any[];
      orders[i].item_count = itemCount[0].item_count;
      // discount_amount is already fetched from the main query, no need to override
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalOrders / limitNum);

    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_orders: totalOrders,
          per_page: limitNum,
          has_next: pageNum < totalPages,
          has_previous: pageNum > 1
        }
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('❌ getUserOrders Error:', error);
    next(error);
  }
};

/**
 * Get a specific order by ID
 */
export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;

    if (!userId) {
      const error: CustomError = new Error('User authentication required');
      error.statusCode = 401;
      return next(error);
    }

    // Get order details
    const [orders] = await pool.execute(`
      SELECT 
        o.*,
        o.order_status as status,
        COALESCE(o.payment_reference, CONCAT('FC-', LEFT(o.id, 8))) as order_number,
        u.email as user_email,
        u.first_name,
        u.last_name,
        u.phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, userId]) as any[];

    if (orders.length === 0) {
      const error: CustomError = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    // Get order items with variation details
    const [orderItems] = await pool.execute(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.slug as product_slug,
        p.featured_image as product_image,
        p.sku as product_sku,
        pv.sku as variation_sku,
        pv.dimensions as variation_dimensions
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variations pv ON oi.variation_id = pv.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `, [id]) as any[];

    // Get order status history with user information
    const [statusHistory] = await pool.execute(`
      SELECT 
        osh.*,
        u.first_name as changed_by_first_name,
        u.last_name as changed_by_last_name,
        u.email as changed_by_email
      FROM order_status_history osh
      LEFT JOIN users u ON osh.changed_by = u.id
      WHERE osh.order_id = ? 
      ORDER BY osh.created_at ASC
    `, [id]) as any[];

    // Process shipping address safely
    let parsedShippingAddress = {};
    try {
      const rawAddress = orders[0].shipping_address;
      
      if (rawAddress) {
        // Check if it's already an object or a JSON string
        if (typeof rawAddress === 'object') {
          parsedShippingAddress = rawAddress;
        } else if (typeof rawAddress === 'string') {
          parsedShippingAddress = JSON.parse(rawAddress);
        }
      }
    } catch (error) {
      console.error('🏠 Backend - Error processing shipping address:', error);
    }

    const order = {
      ...orders[0],
      items: orderItems.map((item: any) => {
        // Process variation dimensions if available
        let parsedDimensions: any = {};
        if (item.variation_dimensions) {
          try {
            parsedDimensions = JSON.parse(item.variation_dimensions);
          } catch (e) {
            console.error('Error parsing variation dimensions:', e);
            parsedDimensions = {};
          }
        }

        // Build variation display name from available data
        let variationDisplayName = item.variation_name;
        if (!variationDisplayName && parsedDimensions && Object.keys(parsedDimensions).length > 0) {
          const dimensionParts = [];
          if (parsedDimensions.size) dimensionParts.push(`Size: ${parsedDimensions.size}`);
          if (parsedDimensions.color) dimensionParts.push(`Color: ${parsedDimensions.color}`);
          if (parsedDimensions.material) dimensionParts.push(`Material: ${parsedDimensions.material}`);
          if (dimensionParts.length > 0) {
            variationDisplayName = dimensionParts.join(', ');
          }
        }

        return {
          ...item,
          variation_name: variationDisplayName,
          attributes: item.attributes ? JSON.parse(item.attributes) : {},
          variation_details: parsedDimensions
        };
      }),
      shipping_address: parsedShippingAddress,
      billing_address: parsedShippingAddress, // Use shipping address as billing address
      status_history: statusHistory
    };

    const response: ApiResponse = {
      success: true,
      message: 'Order retrieved successfully',
      data: { order }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Cancel an order (if in pending status)
 */
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      const error: CustomError = new Error('User authentication required');
      error.statusCode = 401;
      return next(error);
    }

    await connection.beginTransaction();

    // Get order details
    const [orders] = await connection.execute(`
      SELECT * FROM orders 
      WHERE id = ? AND user_id = ?
    `, [id, userId]) as any[];

    if (orders.length === 0) {
      const error: CustomError = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    const order = orders[0];

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      const error: CustomError = new Error('Order cannot be cancelled in current status');
      error.statusCode = 400;
      return next(error);
    }

    // Update order status
    await connection.execute(`
      UPDATE orders 
      SET order_status = 'cancelled', cancellation_reason = ?, updated_at = NOW()
      WHERE id = ?
    `, [reason || 'Cancelled by customer', id]);

    // Restore product stock
    const [orderItems] = await connection.execute(`
      SELECT oi.product_id, oi.quantity
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]) as any[];

    for (const item of orderItems) {
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Add to status history
    await connection.execute(`
      INSERT INTO order_status_history (order_id, status, notes, changed_by)
      VALUES (?, 'cancelled', ?, ?)
    `, [id, reason || 'Cancelled by customer', userId]);

    await connection.commit();

    const response: ApiResponse = {
      success: true,
      message: 'Order cancelled successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes, tracking_number } = req.body;

    // Get current order with user information
    const [orders] = await pool.execute(`
      SELECT 
        o.*,
        u.email as user_email,
        u.first_name,
        u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]) as any[];

    if (orders.length === 0) {
      const error: CustomError = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    const updateData: any = { status };
    if (tracking_number) updateData.tracking_number = tracking_number;

    // Update order
    await pool.execute(`
      UPDATE orders 
      SET order_status = ?, tracking_number = ?, updated_at = NOW()
      WHERE id = ?
    `, [status, tracking_number || null, id]);

    // Add to status history
    await pool.execute(`
      INSERT INTO order_status_history (order_id, status, notes, changed_by)
      VALUES (?, ?, ?, ?)
    `, [id, status, notes || null, req.user?.user_id || null]);

    // Send status update email to customer
    const order = orders[0];
    if (order.user_email && ['shipped', 'delivered', 'cancelled'].includes(status.toLowerCase())) {
      try {
        // Get order items for email
        const [orderItems] = await pool.execute(`
          SELECT 
            oi.quantity, oi.price,
            p.name as product_name,
            p.featured_image as product_image
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [id]) as any[];

        // Parse shipping address JSON
        const shippingAddress = typeof order.shipping_address === 'string' 
          ? JSON.parse(order.shipping_address) 
          : order.shipping_address;

        const orderEmailData: OrderEmailData = {
          customerName: order.first_name ? `${order.first_name} ${order.last_name}` : 'Valued Customer',
          orderNumber: order.payment_reference,
          orderDate: new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          orderTotal: `₦${parseFloat(order.total_amount).toLocaleString()}`,
          orderStatus: status,
          items: orderItems.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: `₦${parseFloat(item.price).toLocaleString()}`,
            total: `₦${(parseFloat(item.price) * item.quantity).toLocaleString()}`,
            image: item.product_image
          })),
          shippingAddress: {
            name: order.first_name ? `${order.first_name} ${order.last_name}` : 'Customer',
            street: shippingAddress?.address_line_1 || shippingAddress?.line_1 || '',
            city: shippingAddress?.city || '',
            state: shippingAddress?.state || '',
            country: shippingAddress?.country || '',
            zipCode: shippingAddress?.zip_code || ''
          },
          subtotal: `₦${parseFloat(order.subtotal || order.total_amount).toLocaleString()}`,
          taxAmount: `₦${parseFloat(order.tax_amount || '0').toLocaleString()}`,
          shippingCost: `₦${parseFloat(order.shipping_cost || '0').toLocaleString()}`,
          trackingNumber: tracking_number || undefined,
          estimatedDelivery: status === 'shipped' ? new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined
        };

        await emailService.sendOrderStatusUpdate(order.user_email, orderEmailData);
      } catch (emailError) {
        console.error('Failed to send order status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    const response: ApiResponse = {
      success: true,
      message: 'Order status updated successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get all orders (Admin only)
 */
/**
 * Get order details for admin
 */
export const getOrderForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get order details
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.order_status as status,
        o.payment_status,
        o.payment_method,
        o.payment_reference,
        o.total_amount,
        o.shipping_address,
        o.delivery_type,
        o.delivery_cost,
        o.created_at,
        o.updated_at,
        u.email as user_email,
        u.first_name,
        u.last_name,
        u.phone,
        u.address,
        u.city,
        u.state,
        u.country,
        u.zip_code
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]) as any[];

    if (orders.length === 0) {
      const error: CustomError = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    // Get order items
    const [orderItems] = await pool.execute(`
      SELECT 
        oi.id,
        oi.quantity,
        oi.price,
        oi.variation_id,
        oi.variation_name,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.featured_image as product_image,
        p.sku as product_sku
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id ASC
    `, [id]) as any[];

    // Get order status history with user information for admin
    const [statusHistory] = await pool.execute(`
      SELECT 
        osh.*,
        u.first_name as changed_by_first_name,
        u.last_name as changed_by_last_name,
        u.email as changed_by_email
      FROM order_status_history osh
      LEFT JOIN users u ON osh.changed_by = u.id
      WHERE osh.order_id = ? 
      ORDER BY osh.created_at ASC
    `, [id]) as any[];

    // Calculate cost breakdown for admin display
    const items = orderItems.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      line_total: item.quantity * item.price,
      variation_id: item.variation_id,
      variation_name: item.variation_name,
      product: {
        id: item.product_id,
        name: item.product_name,
        slug: item.product_slug,
        image: item.product_image,
        sku: item.product_sku
      }
    }));

    // Calculate subtotal from items
    const subtotal = items.reduce((sum: number, item: any) => sum + item.line_total, 0);

    // Get tax rate from system settings
    const [taxSettings] = await pool.execute(
      'SELECT setting_value FROM system_settings WHERE setting_key = "tax_rate"'
    ) as any[];
    const taxRate = taxSettings.length > 0 ? parseFloat(taxSettings[0].setting_value) : 7.5;
    const taxAmount = (subtotal * taxRate) / 100;

    // Use the actual delivery cost from the order (not calculated from system settings)
    const actualDeliveryCost = parseFloat(orders[0].delivery_cost || '0');
    const deliveryType = orders[0].delivery_type || 'home';

    // Get actual discount amount and coupon code from coupon usage table
    const [couponUsage] = await pool.execute(`
      SELECT cu.discount_amount, c.code as coupon_code
      FROM coupon_usage cu
      JOIN coupons c ON cu.coupon_id = c.id
      WHERE cu.order_id = ?
    `, [id]) as any[];
    
    const actualDiscountAmount = couponUsage.length > 0 ? parseFloat(couponUsage[0].discount_amount) : 0;
    const appliedCouponCode = couponUsage.length > 0 ? couponUsage[0].coupon_code : null;

    const order = {
      ...orders[0],
      order_number: orders[0].payment_reference,
      items,
      shipping_address: typeof orders[0].shipping_address === 'string' ? JSON.parse(orders[0].shipping_address) : orders[0].shipping_address,
      subtotal: subtotal,
      tax_amount: taxAmount,
      shipping_cost: actualDeliveryCost,
      delivery_type: deliveryType,
      discount_amount: actualDiscountAmount,
      coupon_code: appliedCouponCode,
      status_history: statusHistory.map((history: any) => ({
        ...history,
        changed_by_name: history.changed_by_first_name && history.changed_by_last_name 
          ? `${history.changed_by_first_name} ${history.changed_by_last_name}`
          : history.changed_by_email || 'System'
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Order retrieved successfully',
      data: { order }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      payment_status,
      search
    } = req.query;


    const offset = (Number(page) - 1) * Number(limit);
    
    // Build WHERE conditions
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Status filter
    if (status && status !== '') {
      whereConditions.push('o.order_status = ?');
      queryParams.push(status);
    }

    // Payment status filter
    if (payment_status && payment_status !== '') {
      whereConditions.push('o.payment_status = ?');
      queryParams.push(payment_status);
    }

    // Search filter
    if (search && search !== '') {
      whereConditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR COALESCE(o.payment_reference, CONCAT("FC-", LEFT(o.id, 8))) LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get orders with filters
    const [orders] = await pool.execute(`
      SELECT 
        o.id, 
        COALESCE(o.payment_reference, CONCAT('FC-', LEFT(o.id, 8))) as order_number,
        o.order_status as status, 
        o.payment_status, 
        o.payment_method,
        o.total_amount,
        o.discount_amount,
        o.coupon_code,
        o.created_at, 
        u.email as user_email,
        u.first_name,
        u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC 
      LIMIT ${Number(limit)} OFFSET ${offset}
    `, queryParams) as any[];

    // Get item counts for each order
    const ordersWithCounts = [];
    for (const order of orders) {
      const [itemCount] = await pool.execute(`
        SELECT COUNT(*) as item_count FROM order_items WHERE order_id = ?
      `, [order.id]) as any[];
      
      ordersWithCounts.push({
        ...order,
        discount_amount: order.discount_amount || 0,
        item_count: itemCount[0].item_count,
        shipping_address: order.shipping_address || {}
      });
    }

    // Get total count with same filters
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
    `, queryParams) as any[];

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: ordersWithCounts,
        pagination: {
          current_page: Number(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: Number(limit)
        }
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get order status history (Admin only)
 */
export const getOrderStatusHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verify order exists
    const [orders] = await pool.execute(
      "SELECT id FROM orders WHERE id = ?",
      [id]
    ) as any[];

    if (orders.length === 0) {
      const error: CustomError = new Error("Order not found");
      error.statusCode = 404;
      return next(error);
    }

    // Get status history with user information
    const [statusHistory] = await pool.execute(`
      SELECT 
        osh.id,
        osh.order_id,
        osh.status,
        osh.notes,
        osh.created_at,
        osh.changed_by,
        u.first_name as changed_by_first_name,
        u.last_name as changed_by_last_name,
        u.email as changed_by_email
      FROM order_status_history osh
      LEFT JOIN users u ON osh.changed_by = u.id
      WHERE osh.order_id = ? 
      ORDER BY osh.created_at DESC
    `, [id]) as any[];

    const formattedHistory = statusHistory.map((history: any) => ({
      id: history.id,
      order_id: history.order_id,
      status: history.status,
      notes: history.notes,
      created_at: history.created_at,
      changed_by_name: history.changed_by_first_name && history.changed_by_last_name 
        ? `${history.changed_by_first_name} ${history.changed_by_last_name}`
        : history.changed_by_email || "System",
      changed_by_id: history.changed_by
    }));

    const response: ApiResponse = {
      success: true,
      message: "Order status history retrieved successfully",
      data: {
        order_id: id,
        history: formattedHistory,
        total_changes: formattedHistory.length
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

// Confirm order payment and send confirmation email
export const confirmOrderPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get current order with user information and verify payment is pending
    const [orders] = await pool.execute(`
      SELECT 
        o.*,
        u.email as user_email,
        u.first_name,
        u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.payment_status = 'pending'
    `, [id]) as any[];

    if (orders.length === 0) {
      const error: CustomError = new Error('Order not found or payment already confirmed');
      error.statusCode = 404;
      return next(error);
    }

    const order = orders[0];

    // Update payment status to paid and order status to confirmed
    await pool.execute(`
      UPDATE orders 
      SET payment_status = 'paid', order_status = 'processing', updated_at = NOW()
      WHERE id = ?
    `, [id]);

    // Add to status history
    await pool.execute(`
      INSERT INTO order_status_history (order_id, status, notes, changed_by)
      VALUES (?, 'processing', ?, ?)
    `, [id, notes || 'Payment confirmed by admin', req.user?.user_id || null]);

    // Get order items for email
    const [orderItems] = await pool.execute(`
      SELECT 
        oi.quantity, oi.price,
        p.name as product_name,
        p.featured_image as product_image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]) as any[];

    // Send order confirmation email
    if (order.user_email) {
      try {
        const orderEmailData: OrderEmailData = {
          customerName: order.first_name ? `${order.first_name} ${order.last_name}` : 'Valued Customer',
          orderNumber: order.payment_reference,
          orderDate: new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          orderTotal: `₦${parseFloat(order.total_amount).toLocaleString()}`,
          orderStatus: 'confirmed',
          items: orderItems.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: `₦${parseFloat(item.price).toLocaleString()}`,
            total: `₦${(parseFloat(item.price) * item.quantity).toLocaleString()}`,
            image: item.product_image
          })),
          shippingAddress: {
            name: order.first_name ? `${order.first_name} ${order.last_name}` : 'Customer',
            street: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address).address_line_1 : order.shipping_address.address_line_1,
            city: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address).city : order.shipping_address.city,
            state: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address).state : order.shipping_address.state,
            country: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address).country : order.shipping_address.country,
            zipCode: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address).zip_code : order.shipping_address.zip_code
          },
          subtotal: `₦${parseFloat(order.subtotal || order.total_amount).toLocaleString()}`,
          taxAmount: `₦${parseFloat(order.tax_amount || '0').toLocaleString()}`,
          shippingCost: `₦${parseFloat(order.shipping_cost || '0').toLocaleString()}`,
          discount: order.discount_amount ? `₦${parseFloat(order.discount_amount).toLocaleString()}` : undefined,
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        };

        await emailService.sendOrderConfirmation(order.user_email, orderEmailData);
        console.log(`✅ Order confirmation email sent for payment confirmation of order ${id}`);
      } catch (emailError) {
        console.error('Failed to send order confirmation email after payment confirmation:', emailError);
        // Don't fail the payment confirmation if email fails
      }
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully. Order confirmation email sent to customer.',
      data: { orderId: id, paymentStatus: 'paid', orderStatus: 'confirmed' }
    });

  } catch (error: any) {
    console.error('Payment confirmation failed:', error);
    const errorResponse: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Payment confirmation failed'
    };
    res.status(500).json(errorResponse);
  }
};
