import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { ApiResponse } from '../types';
import { CustomError } from '../middleware/errorHandler';

interface ShippingZone {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all shipping zones (Admin)
 */
export const getAllShippingZones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { active_only = false } = req.query;
    
    let query = 'SELECT * FROM shipping_zones';
    const queryParams: any[] = [];
    
    if (active_only === 'true') {
      query += ' WHERE is_active = ?';
      queryParams.push(true);
    }
    
    query += ' ORDER BY name ASC';
    
    const [zones] = await pool.execute(query, queryParams) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Shipping zones retrieved successfully',
      data: { zones }
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get active shipping zones (Public - for frontend)
 */
export const getActiveShippingZones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [zones] = await pool.execute(
      'SELECT id, name, description, price FROM shipping_zones WHERE is_active = ? ORDER BY name ASC',
      [true]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Active shipping zones retrieved successfully',
      data: { zones }
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get a specific shipping zone by ID
 */
export const getShippingZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [zones] = await pool.execute(
      'SELECT * FROM shipping_zones WHERE id = ?',
      [id]
    ) as any[];

    if (zones.length === 0) {
      const error: CustomError = new Error('Shipping zone not found');
      error.statusCode = 404;
      return next(error);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Shipping zone retrieved successfully',
      data: { zone: zones[0] }
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Create a new shipping zone
 */
export const createShippingZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { name, description, price, is_active = true } = req.body;

    // Check if zone name already exists
    const [existingZones] = await pool.execute(
      'SELECT id FROM shipping_zones WHERE name = ?',
      [name]
    ) as any[];

    if (existingZones.length > 0) {
      const error: CustomError = new Error('Shipping zone with this name already exists');
      error.statusCode = 400;
      return next(error);
    }

    // Generate UUID for the new zone
    const { v4: uuidv4 } = require('uuid');
    const zoneId = uuidv4();

    // Create the shipping zone
    await pool.execute(
      'INSERT INTO shipping_zones (id, name, description, price, is_active) VALUES (?, ?, ?, ?, ?)',
      [zoneId, name, description || null, parseFloat(price), is_active]
    );

    // Get the created zone
    const [newZones] = await pool.execute(
      'SELECT * FROM shipping_zones WHERE id = ?',
      [zoneId]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Shipping zone created successfully',
      data: { zone: newZones[0] }
    };

    res.status(201).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Update a shipping zone
 */
export const updateShippingZone = async (req: Request, res: Response, next: NextFunction) => {
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
    const { name, description, price, is_active } = req.body;

    // Check if zone exists
    const [existingZones] = await pool.execute(
      'SELECT * FROM shipping_zones WHERE id = ?',
      [id]
    ) as any[];

    if (existingZones.length === 0) {
      const error: CustomError = new Error('Shipping zone not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if new name conflicts with existing zones (excluding current zone)
    if (name && name !== existingZones[0].name) {
      const [nameConflictZones] = await pool.execute(
        'SELECT id FROM shipping_zones WHERE name = ? AND id != ?',
        [name, id]
      ) as any[];

      if (nameConflictZones.length > 0) {
        const error: CustomError = new Error('Shipping zone with this name already exists');
        error.statusCode = 400;
        return next(error);
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(parseFloat(price));
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      const error: CustomError = new Error('No valid fields to update');
      error.statusCode = 400;
      return next(error);
    }

    values.push(id);

    // Update the shipping zone
    await pool.execute(
      `UPDATE shipping_zones SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Get the updated zone
    const [updatedZones] = await pool.execute(
      'SELECT * FROM shipping_zones WHERE id = ?',
      [id]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Shipping zone updated successfully',
      data: { zone: updatedZones[0] }
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Toggle shipping zone status (activate/deactivate)
 */
export const toggleShippingZoneStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if zone exists
    const [existingZones] = await pool.execute(
      'SELECT * FROM shipping_zones WHERE id = ?',
      [id]
    ) as any[];

    if (existingZones.length === 0) {
      const error: CustomError = new Error('Shipping zone not found');
      error.statusCode = 404;
      return next(error);
    }

    const currentStatus = existingZones[0].is_active;
    const newStatus = !currentStatus;

    // Update the zone status
    await pool.execute(
      'UPDATE shipping_zones SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, id]
    );

    // Get the updated zone
    const [updatedZones] = await pool.execute(
      'SELECT * FROM shipping_zones WHERE id = ?',
      [id]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: `Shipping zone ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: { zone: updatedZones[0] }
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Delete a shipping zone
 */
export const deleteShippingZone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if zone exists
    const [existingZones] = await pool.execute(
      'SELECT * FROM shipping_zones WHERE id = ?',
      [id]
    ) as any[];

    if (existingZones.length === 0) {
      const error: CustomError = new Error('Shipping zone not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if zone is being used in any orders
    const [ordersWithZone] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE shipping_zone_id = ?',
      [id]
    ) as any[];

    if (ordersWithZone[0].count > 0) {
      const error: CustomError = new Error('Cannot delete shipping zone that is used in existing orders. Consider deactivating it instead.');
      error.statusCode = 400;
      return next(error);
    }

    // Delete the shipping zone
    await pool.execute('DELETE FROM shipping_zones WHERE id = ?', [id]);

    const response: ApiResponse = {
      success: true,
      message: 'Shipping zone deleted successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get shipping zone statistics
 */
export const getShippingZoneStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get zone counts
    const [zoneCounts] = await pool.execute(`
      SELECT 
        COUNT(*) as total_zones,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_zones,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_zones,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price
      FROM shipping_zones
    `) as any[];

    // Get zone usage in orders
    const [zoneUsage] = await pool.execute(`
      SELECT 
        sz.name,
        sz.price,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.delivery_cost), 0) as total_revenue
      FROM shipping_zones sz
      LEFT JOIN orders o ON sz.id = o.shipping_zone_id AND o.payment_status = 'paid'
      GROUP BY sz.id, sz.name, sz.price
      ORDER BY order_count DESC
      LIMIT 10
    `) as any[];

    const stats = {
      summary: zoneCounts[0],
      popular_zones: zoneUsage
    };

    const response: ApiResponse = {
      success: true,
      message: 'Shipping zone statistics retrieved successfully',
      data: { stats }
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};