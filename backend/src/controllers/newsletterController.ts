import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

interface CustomError extends Error {
  status?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  pagination?: {
    current_page: number;
    items_per_page: number;
    total_items: number;
    total_pages: number;
  };
}

/**
 * Get all newsletter subscriptions with search and filters
 */
export const getAllSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search functionality
    if (search) {
      whereConditions.push('(ns.email LIKE ? OR ns.first_name LIKE ? OR ns.last_name LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Status filter
    if (status && ['active', 'unsubscribed', 'bounced', 'spam_complaint'].includes(status)) {
      whereConditions.push('ns.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Try a simpler approach without parameter binding for LIMIT/OFFSET
    const subscriptionsQuery = `
      SELECT 
        ns.*,
        CONCAT(ns.first_name, ' ', ns.last_name) as full_name
      FROM newsletter_subscriptions ns 
      ${whereClause}
      ORDER BY ns.subscription_date DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    console.log('Newsletter Query Debug:', {
      query: subscriptionsQuery,
      queryParams,
      whereClause,
      limit,
      offset
    });
    
    // Execute query with search parameters only (if any)
    const [subscriptions] = queryParams.length > 0 
      ? await pool.execute(subscriptionsQuery, queryParams)
      : await pool.query(subscriptionsQuery);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM newsletter_subscriptions ns ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, queryParams) as any;
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Newsletter subscriptions retrieved successfully',
      data: subscriptions,
      pagination: {
        current_page: page,
        items_per_page: limit,
        total_items: total,
        total_pages: totalPages
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting newsletter subscriptions:', error);
    next(error);
  }
};

/**
 * Get newsletter subscription statistics
 */
export const getSubscriptionStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get subscription counts by status
    const statusStatsQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM newsletter_subscriptions 
      GROUP BY status
    `;
    
    const [statusStats] = await pool.execute(statusStatsQuery);

    // Get subscription growth over time (last 12 months)
    const growthQuery = `
      SELECT 
        DATE_FORMAT(subscription_date, '%Y-%m') as month,
        COUNT(*) as new_subscribers
      FROM newsletter_subscriptions 
      WHERE subscription_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(subscription_date, '%Y-%m')
      ORDER BY month ASC
    `;
    
    const [growthStats] = await pool.execute(growthQuery);

    // Get total stats
    const totalQuery = `
      SELECT 
        COUNT(*) as total_subscribers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscribers,
        COUNT(CASE WHEN confirmed_at IS NOT NULL THEN 1 END) as confirmed_subscribers,
        COUNT(CASE WHEN subscription_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_last_30_days
      FROM newsletter_subscriptions
    `;
    
    const [totalStats] = await pool.execute(totalQuery) as any;

    const response: ApiResponse = {
      success: true,
      message: 'Newsletter statistics retrieved successfully',
      data: {
        statusStats,
        growthStats,
        totalStats: totalStats[0]
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting newsletter stats:', error);
    next(error);
  }
};

/**
 * Get specific newsletter subscription
 */
export const getSubscriptionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT 
        ns.*,
        CONCAT(ns.first_name, ' ', ns.last_name) as full_name
      FROM newsletter_subscriptions ns 
      WHERE ns.id = ?
    `, [id]) as any;

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter subscription not found'
      });
    }

    // Get subscription history
    const [history] = await pool.execute(`
      SELECT * FROM newsletter_subscription_history 
      WHERE subscription_id = ? 
      ORDER BY created_at DESC
    `, [id]);

    const response: ApiResponse = {
      success: true,
      message: 'Newsletter subscription retrieved successfully',
      data: {
        subscription: rows[0],
        history
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting newsletter subscription:', error);
    next(error);
  }
};

/**
 * Create new newsletter subscription
 */
export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, first_name, last_name, subscription_source = 'admin' } = req.body;
    const subscriptionId = uuidv4();
    const user = (req as any).user;

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM newsletter_subscriptions WHERE email = ?',
      [email]
    ) as any;

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already subscribed to newsletter'
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create subscription
      await connection.execute(`
        INSERT INTO newsletter_subscriptions (
          id, email, first_name, last_name, status, subscription_source, confirmed_at
        ) VALUES (?, ?, ?, ?, 'active', ?, NOW())
      `, [subscriptionId, email, first_name || '', last_name || '', subscription_source]);

      // Log subscription history
      await connection.execute(`
        INSERT INTO newsletter_subscription_history (
          id, subscription_id, email, action, source, ip_address
        ) VALUES (?, ?, ?, 'subscribed', ?, ?)
      `, [uuidv4(), subscriptionId, email, subscription_source, req.ip]);

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Newsletter subscription created successfully',
        data: {
          id: subscriptionId,
          email,
          first_name,
          last_name,
          status: 'active'
        }
      };

      res.status(201).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error creating newsletter subscription:', error);
    next(error);
  }
};

/**
 * Update newsletter subscription
 */
export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, status, preferences } = req.body;

    // Check if subscription exists
    const [existing] = await pool.execute(
      'SELECT * FROM newsletter_subscriptions WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter subscription not found'
      });
    }

    const currentSubscription = existing[0];
    const updates: any = {};
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Build dynamic update query
    if (email && email !== currentSubscription.email) {
      // Check if new email already exists
      const [emailExists] = await pool.execute(
        'SELECT id FROM newsletter_subscriptions WHERE email = ? AND id != ?',
        [email, id]
      ) as any;

      if (emailExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already subscribed to newsletter'
        });
      }

      updates.email = email;
      updateFields.push('email');
      updateValues.push(email);
    }

    if (first_name !== undefined) {
      updates.first_name = first_name;
      updateFields.push('first_name');
      updateValues.push(first_name);
    }

    if (last_name !== undefined) {
      updates.last_name = last_name;
      updateFields.push('last_name');
      updateValues.push(last_name);
    }

    if (status && ['active', 'unsubscribed', 'bounced', 'spam_complaint'].includes(status)) {
      updates.status = status;
      updateFields.push('status');
      updateValues.push(status);

      // Set unsubscribed_date if changing to unsubscribed
      if (status === 'unsubscribed' && currentSubscription.status !== 'unsubscribed') {
        updateFields.push('unsubscribed_date');
        updateValues.push(new Date());
      }
    }

    if (preferences) {
      updates.preferences = JSON.stringify(preferences);
      updateFields.push('preferences');
      updateValues.push(JSON.stringify(preferences));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update subscription
      const setClause = updateFields.map(field => `${field} = ?`).join(', ');
      await connection.execute(
        `UPDATE newsletter_subscriptions SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...updateValues, id]
      );

      // Log status change if applicable
      if (status && status !== currentSubscription.status) {
        let action = 'subscribed';
        if (status === 'unsubscribed') action = 'unsubscribed';
        else if (status === 'active' && currentSubscription.status === 'unsubscribed') action = 'resubscribed';

        await connection.execute(`
          INSERT INTO newsletter_subscription_history (
            id, subscription_id, email, action, source, ip_address
          ) VALUES (?, ?, ?, ?, 'admin', ?)
        `, [uuidv4(), id, email || currentSubscription.email, action, req.ip]);
      }

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Newsletter subscription updated successfully',
        data: { ...currentSubscription, ...updates }
      };

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error updating newsletter subscription:', error);
    next(error);
  }
};

/**
 * Delete newsletter subscription
 */
export const deleteSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if subscription exists
    const [existing] = await pool.execute(
      'SELECT email FROM newsletter_subscriptions WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Newsletter subscription not found'
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete subscription (cascade will handle history)
      await connection.execute('DELETE FROM newsletter_subscriptions WHERE id = ?', [id]);

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Newsletter subscription deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error deleting newsletter subscription:', error);
    next(error);
  }
};

/**
 * Bulk update subscription status
 */
export const bulkUpdateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subscription_ids, status } = req.body;

    if (!Array.isArray(subscription_ids) || subscription_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'subscription_ids must be a non-empty array'
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const placeholders = subscription_ids.map(() => '?').join(',');
      
      // Update subscriptions
      const updateQuery = `
        UPDATE newsletter_subscriptions 
        SET status = ?, updated_at = NOW()
        ${status === 'unsubscribed' ? ', unsubscribed_date = NOW()' : ''}
        WHERE id IN (${placeholders})
      `;
      
      const [result] = await connection.execute(updateQuery, [status, ...subscription_ids]) as any;

      // Log history for each subscription
      const subscriptionsQuery = `SELECT id, email FROM newsletter_subscriptions WHERE id IN (${placeholders})`;
      const [subscriptions] = await connection.execute(subscriptionsQuery, subscription_ids) as any;

      for (const subscription of subscriptions) {
        let action = 'subscribed';
        if (status === 'unsubscribed') action = 'unsubscribed';
        else if (status === 'active') action = 'resubscribed';

        await connection.execute(`
          INSERT INTO newsletter_subscription_history (
            id, subscription_id, email, action, source, ip_address
          ) VALUES (?, ?, ?, ?, 'admin', ?)
        `, [uuidv4(), subscription.id, subscription.email, action, req.ip]);
      }

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: `${result.affectedRows} newsletter subscription(s) updated successfully`,
        data: {
          updated_count: result.affectedRows,
          new_status: status
        }
      };

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error bulk updating newsletter subscriptions:', error);
    next(error);
  }
};

/**
 * Public newsletter subscription (no auth required)
 */
export const publicSubscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const subscriptionId = uuidv4();

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id, status FROM newsletter_subscriptions WHERE email = ?',
      [email]
    ) as any;

    if (existing.length > 0) {
      const existingSub = existing[0];
      if (existingSub.status === 'active') {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter!'
        });
      } else {
        // Reactivate subscription
        await pool.execute(
          'UPDATE newsletter_subscriptions SET status = "active", confirmed_at = NOW(), updated_at = NOW() WHERE email = ?',
          [email]
        );

        // Log resubscription
        await pool.execute(`
          INSERT INTO newsletter_subscription_history (
            id, subscription_id, email, action, source, ip_address
          ) VALUES (?, ?, ?, 'resubscribed', 'website', ?)
        `, [uuidv4(), existingSub.id, email, req.ip]);

        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your newsletter subscription has been reactivated.'
        });
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create new subscription
      await connection.execute(`
        INSERT INTO newsletter_subscriptions (
          id, email, first_name, last_name, status, subscription_source, confirmed_at
        ) VALUES (?, ?, '', '', 'active', 'website', NOW())
      `, [subscriptionId, email]);

      // Log subscription history
      await connection.execute(`
        INSERT INTO newsletter_subscription_history (
          id, subscription_id, email, action, source, ip_address
        ) VALUES (?, ?, ?, 'subscribed', 'website', ?)
      `, [uuidv4(), subscriptionId, email, req.ip]);

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Thank you for subscribing to our newsletter!',
        data: {
          email,
          status: 'active'
        }
      };

      res.status(201).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error creating public newsletter subscription:', error);
    next(error);
  }
};

/**
 * Export newsletter subscriptions to CSV
 */
export const exportSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string || '';
    const search = req.query.search as string || '';

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Status filter
    if (status && ['active', 'unsubscribed', 'bounced', 'spam_complaint'].includes(status)) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }

    // Search functionality
    if (search) {
      whereConditions.push('(email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [subscriptions] = await pool.execute(`
      SELECT 
        email,
        first_name,
        last_name,
        status,
        subscription_source,
        subscription_date,
        confirmed_at,
        unsubscribed_date,
        email_count
      FROM newsletter_subscriptions 
      ${whereClause}
      ORDER BY subscription_date DESC
    `, queryParams) as any;

    // Convert to CSV format
    const csvHeaders = ['Email', 'First Name', 'Last Name', 'Status', 'Source', 'Subscription Date', 'Confirmed At', 'Unsubscribed Date', 'Email Count'];
    const csvRows = subscriptions.map((sub: any) => [
      sub.email,
      sub.first_name || '',
      sub.last_name || '',
      sub.status,
      sub.subscription_source,
      sub.subscription_date ? new Date(sub.subscription_date).toISOString() : '',
      sub.confirmed_at ? new Date(sub.confirmed_at).toISOString() : '',
      sub.unsubscribed_date ? new Date(sub.unsubscribed_date).toISOString() : '',
      sub.email_count
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row: any[]) => row.map((field: any) => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('Error exporting newsletter subscriptions:', error);
    next(error);
  }
};