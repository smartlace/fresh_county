import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { ApiResponse } from '../types';
import { CustomError } from '../middleware/errorHandler';

export interface CouponType {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_customer?: number;
  used_count: number;
  starts_at?: Date;
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

/**
 * Get all coupons with filtering and pagination
 */
export const getAllCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      is_active,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Validate sort parameters
    const validSortFields = ['created_at', 'code', 'name', 'discount_value', 'used_count', 'expires_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const safeSortBy = validSortFields.includes(sort_by as string) ? sort_by : 'created_at';
    const safeSortOrder = validSortOrders.includes(sort_order as string) ? sort_order : 'DESC';
    
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (search) {
      whereConditions.push('(code LIKE ? OR name LIKE ? OR description LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (type) {
      whereConditions.push('type = ?');
      queryParams.push(type);
    }

    if (is_active !== undefined) {
      whereConditions.push('is_active = ?');
      queryParams.push(is_active === 'true' ? 1 : 0);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get coupons with creator information
    const [coupons] = await pool.execute(`
      SELECT 
        c.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.email as creator_email
      FROM coupons c
      LEFT JOIN users u ON c.created_by = u.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ${Number(limit)} OFFSET ${offset}
    `, queryParams) as any[];

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM coupons c ${whereClause}
    `, queryParams) as any[];

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      message: 'Coupons retrieved successfully',
      data: {
        coupons,
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
 * Get a single coupon by ID
 */
export const getCouponById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [coupons] = await pool.execute(`
      SELECT 
        c.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.email as creator_email
      FROM coupons c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [id]) as any[];

    if (coupons.length === 0) {
      const error: CustomError = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    // Get usage statistics
    const [usageStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_uses,
        COUNT(DISTINCT user_id) as unique_users,
        SUM(discount_amount) as total_discount_given
      FROM coupon_usage
      WHERE coupon_id = ?
    `, [id]) as any[];

    const coupon = {
      ...coupons[0],
      usage_stats: usageStats[0]
    };

    const response: ApiResponse = {
      success: true,
      message: 'Coupon retrieved successfully',
      data: { coupon }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Create a new coupon
 */
export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
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
      code,
      name,
      description,
      type,
      discount_value,
      minimum_order_amount = 0,
      maximum_discount_amount,
      usage_limit,
      usage_limit_per_customer,
      starts_at,
      expires_at,
      is_active = true
    } = req.body;

    const user_id = (req as any).user?.user_id;

    // Validate date logic
    const startDate = new Date(starts_at);
    const endDate = new Date(expires_at);
    
    if (startDate >= endDate) {
      const error: CustomError = new Error('Start date must be before end date');
      error.statusCode = 400;
      return next(error);
    }

    // Check if coupon code already exists
    const [existingCoupons] = await pool.execute(
      'SELECT id FROM coupons WHERE code = ?',
      [code.toUpperCase()]
    ) as any[];

    if (existingCoupons.length > 0) {
      const error: CustomError = new Error('Coupon code already exists');
      error.statusCode = 400;
      return next(error);
    }

    // Generate UUID for coupon
    const { v4: uuidv4 } = require('uuid');
    const couponId = uuidv4();

    // Create coupon
    await pool.execute(`
      INSERT INTO coupons (
        id, code, name, description, type, discount_value, 
        minimum_order_amount, maximum_discount_amount, usage_limit, 
        usage_limit_per_customer, starts_at, expires_at, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      couponId,
      code.toUpperCase(),
      name,
      description || null,
      type,
      discount_value,
      minimum_order_amount,
      maximum_discount_amount || null,
      usage_limit || null,
      usage_limit_per_customer || null,
      starts_at || null,
      expires_at || null,
      is_active,
      user_id
    ]);

    // Get created coupon
    const [createdCoupon] = await pool.execute(`
      SELECT 
        c.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM coupons c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [couponId]) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Coupon created successfully',
      data: { coupon: createdCoupon[0] }
    };

    res.status(201).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Update a coupon
 */
export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { id } = req.params;
    const {
      code,
      name,
      description,
      type,
      discount_value,
      minimum_order_amount,
      maximum_discount_amount,
      usage_limit,
      usage_limit_per_customer,
      starts_at,
      expires_at,
      is_active
    } = req.body;

    // Check if coupon exists
    const [existingCoupons] = await pool.execute(
      'SELECT id, used_count FROM coupons WHERE id = ?',
      [id]
    ) as any[];

    if (existingCoupons.length === 0) {
      const error: CustomError = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if new code conflicts with existing coupons (excluding current one)
    if (code) {
      const [codeCheck] = await pool.execute(
        'SELECT id FROM coupons WHERE code = ? AND id != ?',
        [code.toUpperCase(), id]
      ) as any[];

      if (codeCheck.length > 0) {
        const error: CustomError = new Error('Coupon code already exists');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Get current coupon data for date validation
    const [currentCoupons] = await pool.execute(
      'SELECT starts_at, expires_at FROM coupons WHERE id = ?',
      [id]
    ) as any[];
    
    const currentCoupon = currentCoupons[0];
    
    // Validate date logic if dates are being updated
    if (starts_at !== undefined || expires_at !== undefined) {
      const newStartDate = starts_at ? new Date(starts_at) : new Date(currentCoupon.starts_at);
      const newEndDate = expires_at ? new Date(expires_at) : new Date(currentCoupon.expires_at);
      
      if (newStartDate >= newEndDate) {
        const error: CustomError = new Error('Start date must be before end date');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Build update object
    const updates: any = {};
    if (code) updates.code = code.toUpperCase();
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (type) updates.type = type;
    if (discount_value !== undefined) updates.discount_value = discount_value;
    if (minimum_order_amount !== undefined) updates.minimum_order_amount = minimum_order_amount;
    if (maximum_discount_amount !== undefined) updates.maximum_discount_amount = maximum_discount_amount;
    if (usage_limit !== undefined) updates.usage_limit = usage_limit;
    if (usage_limit_per_customer !== undefined) updates.usage_limit_per_customer = usage_limit_per_customer;
    if (starts_at !== undefined) updates.starts_at = starts_at;
    if (expires_at !== undefined) updates.expires_at = expires_at;
    if (typeof is_active === 'boolean') updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      const error: CustomError = new Error('No fields to update');
      error.statusCode = 400;
      return next(error);
    }

    // Build update query
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await pool.execute(
      `UPDATE coupons SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Get updated coupon
    const [updatedCoupon] = await pool.execute(`
      SELECT 
        c.*,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM coupons c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [id]) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon: updatedCoupon[0] }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete a coupon
 */
export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if coupon exists and get usage info
    const [existingCoupons] = await pool.execute(
      'SELECT id, code, used_count FROM coupons WHERE id = ?',
      [id]
    ) as any[];

    if (existingCoupons.length === 0) {
      const error: CustomError = new Error('Coupon not found');
      error.statusCode = 404;
      return next(error);
    }

    const coupon = existingCoupons[0];

    // Check if coupon has been used
    if (coupon.used_count > 0) {
      const error: CustomError = new Error('Cannot delete coupon that has been used. Consider deactivating it instead.');
      error.statusCode = 400;
      return next(error);
    }

    // Delete the coupon (CASCADE will handle coupon_usage records)
    await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);

    const response: ApiResponse = {
      success: true,
      message: 'Coupon deleted successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Validate and apply coupon to order
 */
export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, order_amount, user_id } = req.body;

    if (!code || !order_amount || !user_id) {
      const error: CustomError = new Error('Coupon code, order amount, and user ID are required');
      error.statusCode = 400;
      return next(error);
    }

    // Get coupon details
    const [coupons] = await pool.execute(`
      SELECT * FROM coupons 
      WHERE code = ? AND is_active = 1
    `, [code.toUpperCase()]) as any[];

    if (coupons.length === 0) {
      const error: CustomError = new Error('Invalid or inactive coupon code');
      error.statusCode = 400;
      return next(error);
    }

    const coupon = coupons[0];

    // Check if coupon has started
    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      const error: CustomError = new Error('Coupon is not yet active');
      error.statusCode = 400;
      return next(error);
    }

    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      const error: CustomError = new Error('Coupon has expired');
      error.statusCode = 400;
      return next(error);
    }

    // Check minimum order amount
    if (order_amount < coupon.minimum_order_amount) {
      const error: CustomError = new Error(`Minimum order amount of ${coupon.minimum_order_amount} required for this coupon`);
      error.statusCode = 400;
      return next(error);
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      const error: CustomError = new Error('Coupon usage limit reached');
      error.statusCode = 400;
      return next(error);
    }

    // Check per-user usage limit
    if (coupon.usage_limit_per_customer) {
      const [userUsage] = await pool.execute(`
        SELECT COUNT(*) as usage_count FROM coupon_usage 
        WHERE coupon_id = ? AND user_id = ?
      `, [coupon.id, user_id]) as any[];

      if (userUsage[0].usage_count >= coupon.usage_limit_per_customer) {
        const error: CustomError = new Error('You have reached the usage limit for this coupon');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Calculate discount amount
    let discount_amount = 0;
    if (coupon.type === 'percentage') {
      discount_amount = (order_amount * coupon.discount_value) / 100;
      // Apply maximum discount limit if set
      if (coupon.maximum_discount_amount && discount_amount > coupon.maximum_discount_amount) {
        discount_amount = coupon.maximum_discount_amount;
      }
    } else if (coupon.type === 'fixed_amount') {
      discount_amount = coupon.discount_value;
      // Don't let fixed discount exceed order amount
      if (discount_amount > order_amount) {
        discount_amount = order_amount;
      }
    }

    const final_amount = Math.max(0, order_amount - discount_amount);

    const response: ApiResponse = {
      success: true,
      message: 'Coupon validated successfully',
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          type: coupon.type,
          discount_value: coupon.discount_value
        },
        original_amount: order_amount,
        discount_amount: Math.round(discount_amount * 100) / 100, // Round to 2 decimal places
        final_amount: Math.round(final_amount * 100) / 100
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get coupon usage statistics
 */
export const getCouponStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30' } = req.query;
    const daysBack = parseInt(period as string);

    // Overall statistics
    const [overallStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_coupons,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_coupons,
        SUM(used_count) as total_uses,
        COUNT(CASE WHEN expires_at < NOW() THEN 1 ELSE NULL END) as expired_coupons
      FROM coupons
    `) as any[];

    // Recent usage statistics
    const [recentStats] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT cu.id) as recent_uses,
        COUNT(DISTINCT cu.user_id) as unique_users,
        SUM(cu.discount_amount) as total_discount_given,
        AVG(cu.discount_amount) as avg_discount_amount
      FROM coupon_usage cu
      WHERE cu.used_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [daysBack]) as any[];

    // Top performing coupons
    const [topCoupons] = await pool.execute(`
      SELECT 
        c.code,
        c.name,
        c.type,
        c.discount_value,
        COUNT(cu.id) as usage_count,
        SUM(cu.discount_amount) as total_discount
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      WHERE cu.used_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY c.id
      ORDER BY usage_count DESC
      LIMIT 10
    `, [daysBack]) as any[];

    // Daily usage trend
    const [dailyUsage] = await pool.execute(`
      SELECT 
        DATE(used_at) as date,
        COUNT(*) as usage_count,
        SUM(discount_amount) as total_discount,
        COUNT(DISTINCT user_id) as unique_users
      FROM coupon_usage
      WHERE used_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(used_at)
      ORDER BY date ASC
    `, [daysBack]) as any[];

    const stats = {
      overview: {
        total_coupons: overallStats[0].total_coupons,
        active_coupons: overallStats[0].active_coupons,
        expired_coupons: overallStats[0].expired_coupons,
        total_uses: overallStats[0].total_uses,
        recent_uses: recentStats[0].recent_uses,
        unique_users: recentStats[0].unique_users,
        total_discount_given: parseFloat(recentStats[0].total_discount_given || 0),
        avg_discount_amount: parseFloat(recentStats[0].avg_discount_amount || 0)
      },
      top_coupons: topCoupons.map((coupon: any) => ({
        ...coupon,
        total_discount: parseFloat(coupon.total_discount || 0)
      })),
      daily_usage: dailyUsage.map((day: any) => ({
        ...day,
        total_discount: parseFloat(day.total_discount || 0)
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Coupon statistics retrieved successfully',
      data: stats
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};