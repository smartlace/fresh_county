import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { ApiResponse } from '../types';
import { CustomError } from '../middleware/errorHandler';

/**
 * Get dashboard statistics and overview
 */
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30' } = req.query; // Days to look back
    const daysBack = parseInt(period as string);

    // Get basic counts
    const [totalCounts] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM products WHERE is_active = 1) as total_products,
        (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) as total_orders,
        (SELECT COUNT(*) FROM categories WHERE is_active = 1) as total_categories
    `, [daysBack]) as any[];

    // Get revenue statistics
    const [revenueStats] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN total_amount ELSE 0 END) as recent_revenue,
        AVG(CASE WHEN payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN total_amount ELSE NULL END) as average_order_value,
        COUNT(CASE WHEN payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 ELSE NULL END) as paid_orders,
        COUNT(CASE WHEN order_status = 'pending' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 ELSE NULL END) as pending_orders,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 ELSE NULL END) as recent_orders
      FROM orders
    `, [daysBack, daysBack, daysBack, daysBack, daysBack, daysBack]) as any[];

    // Get top products
    const [topProducts] = await pool.execute(`
      SELECT 
        p.id, p.name, p.price, p.images,
        SUM(oi.quantity) as total_sold,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid' AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `, [daysBack]) as any[];

    // Get recent orders
    const [recentOrders] = await pool.execute(`
      SELECT 
        o.id, COALESCE(o.payment_reference, CONCAT('FC-', LEFT(o.id, 8))) as order_number, o.total_amount, o.order_status as status, o.payment_status, o.created_at,
        u.first_name, u.last_name, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `) as any[];

    // Get low stock products
    const [lowStockProducts] = await pool.execute(`
      SELECT id, name, stock, 
        CASE 
          WHEN stock <= 0 THEN 'out_of_stock'
          WHEN stock <= 10 THEN 'low'
          ELSE 'in_stock'
        END as stock_status
      FROM products 
      WHERE is_active = 1 AND stock <= 10
      ORDER BY stock ASC
      LIMIT 10
    `) as any[];

    // Get daily sales data for chart
    const [dailySales] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as daily_revenue
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [daysBack]) as any[];

    // Get order status distribution
    const [orderStatusStats] = await pool.execute(`
      SELECT 
        order_status as status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY))), 2) as percentage
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY order_status
    `, [daysBack, daysBack]) as any[];

    const stats = {
      overview: {
        total_customers: totalCounts[0].total_customers,
        total_products: totalCounts[0].total_products,
        total_orders: totalCounts[0].total_orders,
        total_categories: totalCounts[0].total_categories,
        total_revenue: parseFloat(revenueStats[0].total_revenue || 0),
        recent_revenue: parseFloat(revenueStats[0].recent_revenue || 0),
        average_order_value: parseFloat(revenueStats[0].average_order_value || 0),
        paid_orders: revenueStats[0].paid_orders,
        pending_orders: revenueStats[0].pending_orders,
        recent_orders: revenueStats[0].recent_orders
      },
      top_products: topProducts.map((product: any) => ({
        ...product,
        total_revenue: parseFloat(product.total_revenue)
      })),
      recent_orders: recentOrders,
      low_stock_products: lowStockProducts,
      daily_sales: dailySales.map((day: any) => ({
        ...day,
        daily_revenue: parseFloat(day.daily_revenue)
      })),
      order_status_stats: orderStatusStats.map((stat: any) => ({
        ...stat,
        percentage: parseFloat(stat.percentage)
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get comprehensive analytics data
 */
export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      start_date,
      end_date,
      metric = 'revenue',
      group_by = 'day'
    } = req.query;

    let dateFilter = '';
    let queryParams: any[] = [];

    if (start_date && end_date) {
      dateFilter = 'WHERE o.created_at BETWEEN ? AND ?';
      queryParams = [start_date, end_date];
    } else {
      // Default to last 30 days
      dateFilter = 'WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    let groupByClause = '';
    let selectClause = '';
    let orderByClause = '';

    switch (group_by) {
      case 'day':
        groupByClause = 'GROUP BY DATE(o.created_at)';
        selectClause = 'DATE(o.created_at) as date';
        orderByClause = 'ORDER BY DATE(o.created_at) ASC';
        break;
      case 'week':
        groupByClause = 'GROUP BY YEAR(o.created_at), WEEK(o.created_at)';
        selectClause = 'YEAR(o.created_at) as year, WEEK(o.created_at) as week';
        orderByClause = 'ORDER BY YEAR(o.created_at) ASC, WEEK(o.created_at) ASC';
        break;
      case 'month':
        groupByClause = 'GROUP BY YEAR(o.created_at), MONTH(o.created_at)';
        selectClause = 'YEAR(o.created_at) as year, MONTH(o.created_at) as month';
        orderByClause = 'ORDER BY YEAR(o.created_at) ASC, MONTH(o.created_at) ASC';
        break;
    }

    // Revenue analytics
    const [revenueData] = await pool.execute(`
      SELECT 
        ${selectClause},
        COUNT(*) as total_orders,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as revenue,
        AVG(CASE WHEN payment_status = 'paid' THEN total_amount ELSE NULL END) as avg_order_value,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 ELSE NULL END) as paid_orders
      FROM orders o
      ${dateFilter}
      ${groupByClause}
      ${orderByClause}
    `, queryParams) as any[];

    // Product performance
    const [productPerformance] = await pool.execute(`
      SELECT 
        p.id, p.name, p.price,
        SUM(oi.quantity) as units_sold,
        SUM(oi.price * oi.quantity) as total_revenue,
        COUNT(DISTINCT o.id) as orders_count
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      ${dateFilter}
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 20
    `, queryParams) as any[];

    // Category performance
    const [categoryPerformance] = await pool.execute(`
      SELECT 
        c.id, c.name,
        COUNT(DISTINCT p.id) as products_count,
        SUM(oi.quantity) as units_sold,
        SUM(oi.price * oi.quantity) as total_revenue
      FROM categories c
      JOIN products p ON c.id = p.category_id
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      ${dateFilter}
      GROUP BY c.id
      ORDER BY total_revenue DESC
    `, queryParams) as any[];

    // Customer insights
    const [customerInsights] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT o.user_id) as unique_customers,
        COUNT(*) as total_orders,
        AVG(total_amount) as avg_order_value,
        COUNT(*) / COUNT(DISTINCT o.user_id) as avg_orders_per_customer
      FROM orders o
      ${dateFilter}
    `, queryParams) as any[];

    // Payment method distribution
    const [paymentMethods] = await pool.execute(`
      SELECT 
        payment_method,
        COUNT(*) as orders_count,
        SUM(total_amount) as total_amount,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))), 2) as percentage
      FROM orders o
      ${dateFilter}
      GROUP BY payment_method
    `, queryParams) as any[];

    const analytics = {
      period: {
        start_date: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: end_date || new Date().toISOString().split('T')[0],
        group_by
      },
      revenue_data: revenueData.map((item: any) => ({
        ...item,
        revenue: parseFloat(item.revenue || 0),
        avg_order_value: parseFloat(item.avg_order_value || 0)
      })),
      product_performance: productPerformance.map((item: any) => ({
        ...item,
        total_revenue: parseFloat(item.total_revenue)
      })),
      category_performance: categoryPerformance.map((item: any) => ({
        ...item,
        total_revenue: parseFloat(item.total_revenue)
      })),
      customer_insights: {
        ...customerInsights[0],
        avg_order_value: parseFloat(customerInsights[0].avg_order_value || 0),
        avg_orders_per_customer: parseFloat(customerInsights[0].avg_orders_per_customer || 0)
      },
      payment_methods: paymentMethods.map((method: any) => ({
        ...method,
        total_amount: parseFloat(method.total_amount),
        percentage: parseFloat(method.percentage)
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Analytics data retrieved successfully',
      data: analytics
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get all users with filtering and pagination (Admin only)
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Validate sort parameters to prevent SQL injection
    const validSortFields = ['created_at', 'email', 'first_name', 'last_name', 'role'];
    const validSortOrders = ['ASC', 'DESC'];
    const safeSortBy = validSortFields.includes(sort_by as string) ? sort_by : 'created_at';
    const safeSortOrder = validSortOrders.includes(sort_order as string) ? sort_order : 'DESC';
    
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }

    if (status) {
      if (status === 'active') {
        whereConditions.push('is_active = 1');
      } else if (status === 'inactive') {
        whereConditions.push('is_active = 0');
      }
    }

    if (search) {
      whereConditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get users
    const [users] = await pool.execute(`
      SELECT 
        id, first_name, last_name, email, role, phone, is_active, created_at, updated_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as total_orders,
        (SELECT SUM(total_amount) FROM orders WHERE user_id = users.id AND payment_status = 'paid') as total_spent
      FROM users
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ${Number(limit)} OFFSET ${offset}
    `, queryParams) as any[];

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `, queryParams) as any[];

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / Number(limit));

    const formattedUsers = users.map((user: any) => ({
      ...user,
      total_spent: parseFloat(user.total_spent || 0),
      is_verified: true, // Default to true for now
      is_active: Boolean(user.is_active) // Use actual database value
    }));

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: formattedUsers,
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
 * Update user status (Admin only)
 */
export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body;

    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, email, role FROM users WHERE id = ?',
      [id]
    ) as any[];

    if (users.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Build update query
    const updates: any = {};
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (role && ['customer', 'staff', 'manager', 'admin'].includes(role)) updates.role = role;

    if (Object.keys(updates).length === 0) {
      const error: CustomError = new Error('No valid fields to update');
      error.statusCode = 400;
      return next(error);
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await pool.execute(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    const response: ApiResponse = {
      success: true,
      message: 'User status updated successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get system settings
 */
export const getSystemSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get all settings from database
    const [rows]: any = await pool.execute(`
      SELECT setting_key, setting_value, description, category, data_type
      FROM system_settings 
      ORDER BY category, setting_key
    `);

    // Transform database results into the format expected by frontend
    const settings: { [key: string]: any } = {};
    
    for (const row of rows) {
      let parsedOptions = undefined;
      if (row.options) {
        try {
          // Handle both JSON object (from mysql2) and string (from other contexts)
          if (typeof row.options === 'string') {
            parsedOptions = JSON.parse(row.options);
          } else if (Array.isArray(row.options)) {
            // Already parsed by mysql2 as JSON object
            parsedOptions = row.options;
          } else {
            // Could be an object, use as-is
            parsedOptions = row.options;
          }
        } catch (error) {
          console.error(`Failed to parse options for ${row.setting_key}:`, row.options);
          parsedOptions = undefined;
        }
      }
      
      settings[row.setting_key] = {
        value: row.setting_value,
        description: row.description,
        category: row.category,
        type: row.data_type,
        options: parsedOptions
      };
    }

    const response: ApiResponse = {
      success: true,
      message: 'System settings retrieved successfully',
      data: { settings }
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    next(error);
  }
};

/**
 * Update system settings
 */
export const updateSystemSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      const error: CustomError = new Error('Settings object is required');
      error.statusCode = 400;
      return next(error);
    }

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update each setting in the database
      for (const [key, value] of Object.entries(settings)) {
        if (typeof value === 'string' || typeof value === 'number') {
          await connection.execute(`
            UPDATE system_settings 
            SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE setting_key = ?
          `, [value.toString(), key]);
        }
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      const response: ApiResponse = {
        success: true,
        message: 'System settings updated successfully'
      };

      res.status(200).json(response);

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error: any) {
    console.error('Error updating system settings:', error);
    next(error);
  }
};

/**
 * Get recent activity logs
 */
export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 50 } = req.query;
    const halfLimit = Math.floor(Number(limit) / 2);

    // Get recent orders
    const [recentOrders] = await pool.execute(`
      SELECT 
        'order' as type,
        o.id as entity_id,
        o.id as description,
        o.total_amount as amount,
        o.order_status as status,
        o.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 25
    `) as any[];

    // Get recent user registrations
    const [recentUsers] = await pool.execute(`
      SELECT 
        'user' as type,
        id as entity_id,
        first_name as description,
        NULL as amount,
        'registered' as status,
        created_at,
        first_name,
        last_name,
        email
      FROM users
      WHERE role = 'customer'
      ORDER BY created_at DESC
      LIMIT 25
    `) as any[];

    // Combine and sort activities
    const activities = [...recentOrders, ...recentUsers]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, Number(limit));

    const response: ApiResponse = {
      success: true,
      message: 'Recent activity retrieved successfully',
      data: { activities }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Create a new user (Admin only)
 */
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, email, password, role = 'customer', is_active = true } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      const error: CustomError = new Error('User with this email already exists');
      error.statusCode = 400;
      return next(error);
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate UUID for user
    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();

    // Create user
    await pool.execute(
      `INSERT INTO users (id, first_name, last_name, email, password, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, first_name, last_name, email, hashedPassword, role, is_active]
    );

    // Get created user (without password)
    const [createdUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, role, is_active, created_at FROM users WHERE id = ?',
      [userId]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'User created successfully',
      data: { user: createdUser[0] }
    };

    res.status(201).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Update a user (Admin only)
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, role, is_active, password } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    ) as any[];

    if (existingUsers.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if email is already taken by another user
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      ) as any[];

      if (emailCheck.length > 0) {
        const error: CustomError = new Error('Email is already taken');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Build update object
    const updates: any = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;
    if (email) updates.email = email;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (role) updates.role = role;
    if (typeof is_active === 'boolean') updates.is_active = is_active;

    // Hash password if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      updates.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updates).length === 0) {
      const error: CustomError = new Error('No fields to update');
      error.statusCode = 400;
      return next(error);
    }

    // Build update query
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    await pool.execute(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Get updated user (without password)
    const [updatedUser] = await pool.execute(
      'SELECT id, first_name, last_name, email, phone, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser[0] }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete a user (Admin only)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    ) as any[];

    if (existingUsers.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Don't allow deletion of admin users (for safety)
    if (existingUsers[0].role === 'admin') {
      const error: CustomError = new Error('Cannot delete admin users');
      error.statusCode = 403;
      return next(error);
    }

    // Hard delete user from database
    // Note: This will also delete related records due to foreign key constraints
    try {
      await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
    } catch (deleteError: any) {
      // Handle foreign key constraint errors
      if (deleteError.code === 'ER_ROW_IS_REFERENCED_2') {
        const error: CustomError = new Error('Cannot delete user because they have associated orders or other data. Consider deactivating the user instead.');
        error.statusCode = 400;
        return next(error);
      }
      throw deleteError;
    }

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get order status distribution
    const [statusStats] = await pool.execute(`
      SELECT 
        order_status as status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders)), 2) as percentage
      FROM orders 
      GROUP BY order_status
      ORDER BY count DESC
    `) as any[];

    // Get total stats
    const [totalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN order_status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN order_status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN order_status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_last_30_days,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue
      FROM orders
    `) as any[];

    // Get monthly growth stats (last 6 months)
    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as new_orders,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as monthly_revenue
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `) as any[];

    const stats = {
      statusStats: statusStats.map((stat: any) => ({
        ...stat,
        percentage: parseFloat(stat.percentage)
      })),
      totalStats: {
        ...totalStats[0],
        total_revenue: parseFloat(totalStats[0].total_revenue || 0)
      },
      monthlyStats: monthlyStats.map((stat: any) => ({
        ...stat,
        monthly_revenue: parseFloat(stat.monthly_revenue || 0)
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Order statistics retrieved successfully',
      data: stats
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get user statistics for admin dashboard
 */
export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Role statistics
    const [roleStats] = await pool.execute(`
      SELECT 
        role,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
      FROM users 
      GROUP BY role
      ORDER BY count DESC
    `) as any[];

    // Status statistics  
    const [statusStats] = await pool.execute(`
      SELECT 
        CASE 
          WHEN is_active = 1 THEN 'active'
          ELSE 'inactive'
        END as status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
      FROM users 
      GROUP BY is_active
      ORDER BY count DESC
    `) as any[];

    // Total statistics
    const [totalStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as total_customers,
        SUM(CASE WHEN role = 'staff' THEN 1 ELSE 0 END) as total_staff,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as total_managers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_last_30_days
      FROM users
    `) as any[];

    // Monthly registration statistics
    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `) as any[];

    const stats = {
      roleStats: roleStats.map((stat: any) => ({
        ...stat,
        percentage: parseFloat(stat.percentage)
      })),
      statusStats: statusStats.map((stat: any) => ({
        ...stat,
        percentage: parseFloat(stat.percentage)
      })),
      totalStats: totalStats[0],
      monthlyStats: monthlyStats.reverse()
    };

    const response: ApiResponse = {
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};