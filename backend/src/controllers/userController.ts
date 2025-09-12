import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { hashPassword, comparePassword } from '../utils/auth';
import { ApiResponse, UserProfile, Order } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';

// Get user profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;

    const [users] = await pool.execute(`
      SELECT 
        id, email, first_name, last_name, phone, 
        address, city, state, country, zip_code,
        role, created_at, updated_at
      FROM users 
      WHERE id = ? AND is_active = 1
    `, [userId]);

    const usersArray = users as any[];
    if (usersArray.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const user = usersArray[0];
    
    const response: ApiResponse<any> = {
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        id: user.id,
        email: user.email,
        full_name: `${user.first_name} ${user.last_name}`.trim(),
        mobile: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        zipCode: user.zip_code,
        role: user.role,
        email_verified: false, // Default value since column doesn't exist
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    };

    
    // Prevent caching to ensure fresh data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const userId = req.user?.user_id;
    const {
      full_name,
      mobile,
      address,
      city,
      state,
      country,
      postal_code
    } = req.body;

    // Split full_name into firstName and lastName
    const [firstName = '', lastName = ''] = (full_name || '').split(' ', 2);
    
    // Map postal_code to zip_code for database compatibility
    const zip_code = postal_code;

    // Update user profile
    await pool.execute(`
      UPDATE users 
      SET 
        first_name = ?, 
        last_name = ?, 
        phone = ?, 
        address = ?, 
        city = ?, 
        state = ?, 
        country = ?, 
        zip_code = ?,
        updated_at = NOW()
      WHERE id = ? AND is_active = 1
    `, [firstName, lastName, mobile, address, city, state, country, zip_code, userId]);

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const userId = req.user?.user_id;
    const { currentPassword, newPassword } = req.body;

    // Get current user password
    const [users] = await pool.execute(`
      SELECT id, email, first_name, last_name, password
      FROM users 
      WHERE id = ? AND is_active = 1
    `, [userId]);

    const usersArray = users as any[];
    if (usersArray.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const user = usersArray[0];

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      const error: CustomError = new Error('Current password is incorrect');
      error.statusCode = 400;
      return next(error);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await pool.execute(`
      UPDATE users 
      SET password = ?, updated_at = NOW()
      WHERE id = ? AND is_active = 1
    `, [hashedNewPassword, userId]);

    // Send password change success email
    try {
      const resetSuccessData = {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        changeDate: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        changeTime: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        }),
        ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown'
      };

      await emailService.sendPasswordResetSuccessEmail(user.email, resetSuccessData);
      console.log(`✅ Password change success email sent to ${user.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send password change success email:', emailError);
      // Continue with success response even if email fails
    }

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get user orders
export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM orders 
      WHERE user_id = ?
    `, [userId]);

    const total = (countResult as any[])[0].total;

    // Get orders with items and actual discount from coupon_usage - use string interpolation for LIMIT and OFFSET to avoid MySQL parameter issues
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.payment_reference,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.total_amount,
        o.delivery_cost,
        COALESCE(cu.discount_amount, o.discount_amount, 0) as discount_amount,
        o.shipping_address,
        o.tracking_number,
        o.coupon_code,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN coupon_usage cu ON o.id = cu.order_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, [userId]);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      (orders as any[]).map(async (order) => {
        const [items] = await pool.execute(`
          SELECT 
            oi.id,
            oi.product_id,
            oi.quantity,
            oi.price,
            (oi.price * oi.quantity) as line_total,
            p.name as product_name,
            p.featured_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);

        // Safe JSON parsing helper
        const safeJsonParse = (jsonString: any) => {
          if (!jsonString) return null;
          if (typeof jsonString === 'object') return jsonString; // Already parsed
          try {
            return JSON.parse(jsonString);
          } catch (error) {
            console.error('JSON parse error for shipping_address:', error, 'Raw data:', jsonString);
            return null;
          }
        };

        // Calculate proper subtotal and tax
        const itemsSubtotal = (items as any[]).reduce((sum: number, item: any) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
        const deliveryCost = parseFloat(order.delivery_cost || 0);
        const discountAmount = parseFloat(order.discount_amount || 0);
        const totalAmount = parseFloat(order.total_amount);
        
        // Calculate tax as 7.5% of items subtotal (Nigerian VAT rate)
        const taxAmount = itemsSubtotal * 0.075;

        // Transform the data to match expected format
        const transformedOrder = {
          id: order.id,
          order_number: order.payment_reference,
          status: order.order_status,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          subtotal: itemsSubtotal,
          tax_amount: taxAmount,
          shipping_cost: deliveryCost,
          discount_amount: discountAmount,
          coupon_code: order.coupon_code,
          total_amount: totalAmount,
          shipping_address: safeJsonParse(order.shipping_address),
          billing_address: null,
          tracking_number: order.tracking_number,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: (items as any[]).map((item: any) => ({
            id: item.id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            line_total: parseFloat(item.price) * parseInt(item.quantity),
            product_image: item.featured_image ? 
              (item.featured_image.startsWith('http') ? item.featured_image : `/uploads/products/${item.featured_image}`) 
              : null,
            variation_name: item.variation_name,
            attributes: item.variation_name ? { variation: item.variation_name } : null
          }))
        };
        
        return transformedOrder;
      })
    );

    const response: ApiResponse = {
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: ordersWithItems,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    const customError: CustomError = new Error(`Failed to retrieve orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    customError.statusCode = 500;
    next(customError);
  }
};

// Get single order details
export const getOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.user_id;
    const { orderId } = req.params;

    // Get order details with actual discount from coupon_usage table
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.payment_reference,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.total_amount,
        o.delivery_cost,
        COALESCE(cu.discount_amount, o.discount_amount, 0) as discount_amount,
        o.shipping_address,
        o.tracking_number,
        o.coupon_code,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN coupon_usage cu ON o.id = cu.order_id
      WHERE o.id = ? AND o.user_id = ?
    `, [orderId, userId]);

    const ordersArray = orders as any[];
    if (ordersArray.length === 0) {
      const error: CustomError = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
    }

    const order = ordersArray[0];

    // Get order items
    const [items] = await pool.execute(`
      SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.price,
        (oi.price * oi.quantity) as line_total,
        oi.variation_name,
        p.name as product_name,
        p.slug as product_slug,
        p.featured_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    // Create order tracking based on status and timestamps
    const createOrderTracking = (order: any) => {
      const tracking: any = {
        placed_at: order.created_at
      }
      
      // Add mock timestamps based on order status for demo purposes
      // In a real system, these would be stored in a separate order_status_history table
      
      // Handle the actual enum values: 'pending','processing','shipped','delivered','cancelled'
      if (order.status !== 'pending') {
        // If not pending, assume it was confirmed
        tracking.confirmed_at = order.created_at
      }
      if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
        tracking.processing_at = order.created_at
      }
      if (order.status === 'shipped' || order.status === 'delivered') {
        tracking.shipped_at = order.created_at
      }
      if (order.status === 'delivered') {
        tracking.delivered_at = order.updated_at
      }
      if (order.status === 'cancelled') {
        tracking.cancelled_at = order.updated_at
      }
      
      return tracking
    }

    // Safe JSON parsing helper
    const safeJsonParse = (jsonString: any) => {
      if (!jsonString) return null;
      if (typeof jsonString === 'object') return jsonString; // Already parsed
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('JSON parse error for shipping_address:', error, 'Raw data:', jsonString);
        return null;
      }
    };

    // Default shipping address fallback
    const defaultShippingAddress = {
      address: "123 Main Street",
      city: "Lagos",
      state: "Lagos State", 
      country: "Nigeria",
      postal_code: "100001",
      phone: "+234 123 456 7890"
    };

    // Calculate proper subtotal and tax
    const itemsSubtotal = (items as any[]).reduce((sum: number, item: any) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    const deliveryCost = parseFloat(order.delivery_cost || 0);
    const discountAmount = parseFloat(order.discount_amount || 0);
    const totalAmount = parseFloat(order.total_amount);
    
    // Calculate tax as 7.5% of items subtotal (Nigerian VAT rate)
    const taxAmount = itemsSubtotal * 0.075;
    
    // Shipping address parsing with better fallback - using actual database field names
    let shippingAddress = safeJsonParse(order.shipping_address);
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      shippingAddress = defaultShippingAddress;
    } else {
      // Map the actual JSON structure from the database
      shippingAddress = {
        address: shippingAddress.address_line_1 || shippingAddress.address || shippingAddress.street_address || defaultShippingAddress.address,
        city: shippingAddress.city || defaultShippingAddress.city,
        state: shippingAddress.state || shippingAddress.region || defaultShippingAddress.state,
        country: shippingAddress.country || defaultShippingAddress.country,
        postal_code: shippingAddress.postal_code || shippingAddress.zip_code || defaultShippingAddress.postal_code,
        phone: shippingAddress.phone || shippingAddress.phone_number || defaultShippingAddress.phone,
        first_name: shippingAddress.first_name || '',
        last_name: shippingAddress.last_name || '',
        email: shippingAddress.email || ''
      };
    }

    // Transform the order data
    const transformedOrder = {
      id: order.id,
      order_number: order.payment_reference,
      status: order.order_status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      payment_reference: order.payment_reference,
      subtotal: itemsSubtotal,
      tax_amount: taxAmount,
      shipping_cost: deliveryCost,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      billing_address: null,
      tracking_number: order.tracking_number,
      notes: null,
      coupon_code: order.coupon_code,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: (items as any[]).map(item => ({
        id: item.id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        line_total: parseFloat(item.price) * parseInt(item.quantity),
        product_image: item.featured_image ? 
          (item.featured_image.startsWith('http') ? item.featured_image : `/uploads/products/${item.featured_image}`) 
          : null,
        variation_name: item.variation_name,
        attributes: item.variation_name ? { variation: item.variation_name } : null
      })),
      order_tracking: createOrderTracking({ status: order.order_status, created_at: order.created_at, updated_at: order.updated_at }),
      shipping_fee: deliveryCost,
      estimated_delivery: order.order_status === 'shipped' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null
    };

    const orderWithItems = transformedOrder;

    const response: ApiResponse = {
      success: true,
      message: 'Order details retrieved successfully',
      data: orderWithItems
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};