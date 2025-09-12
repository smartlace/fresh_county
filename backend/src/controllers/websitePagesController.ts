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
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get public FAQ items (no auth required)
 */
export const getPublicFAQs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50; // Default to 50 FAQs for public view
    
    // Get only active FAQ items, ordered by display_order
    const faqsQuery = `
      SELECT 
        fi.id,
        fi.question,
        fi.answer,
        fi.display_order,
        fi.view_count,
        fi.helpful_count,
        fi.not_helpful_count
      FROM faq_items fi 
      WHERE fi.is_active = 1
      ORDER BY fi.display_order ASC, fi.created_at DESC 
      LIMIT ${limit}
    `;
    
    const [faqs] = await pool.query(faqsQuery);

    const response: ApiResponse = {
      success: true,
      message: 'FAQ items retrieved successfully',
      data: {
        faqs
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting public FAQ items:', error);
    next(error);
  }
};

/**
 * Get all website pages with search and filters
 */
export const getAllPages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const page_type = req.query.page_type as string || '';
    const status = req.query.status as string || '';

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search functionality
    if (search) {
      whereConditions.push('(wp.title LIKE ? OR wp.slug LIKE ? OR wp.content LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Page type filter
    if (page_type && ['faq', 'privacy_policy', 'terms_of_service', 'about_us', 'contact', 'shipping_policy', 'return_policy', 'custom'].includes(page_type)) {
      whereConditions.push('wp.page_type = ?');
      queryParams.push(page_type);
    }

    // Status filter
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      whereConditions.push('wp.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Ensure limit and offset are safe integers
    const limitInt = parseInt(limit.toString());
    const offsetInt = parseInt(offset.toString());
    
    // Get pages with pagination - using direct values for LIMIT/OFFSET to avoid MySQL parameter issues
    const pagesQuery = `
      SELECT 
        wp.*,
        CONCAT(u1.first_name, ' ', u1.last_name) as created_by_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as updated_by_name
      FROM website_pages wp 
      LEFT JOIN users u1 ON wp.created_by = u1.id
      LEFT JOIN users u2 ON wp.updated_by = u2.id
      ${whereClause}
      ORDER BY wp.display_order ASC, wp.created_at DESC 
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;

    const [pages] = await pool.execute(pagesQuery, queryParams);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM website_pages wp ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, queryParams) as any;
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Website pages retrieved successfully',
      data: pages,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting website pages:', error);
    next(error);
  }
};

/**
 * Get website page statistics
 */
export const getPageStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get page counts by type
    const typeStatsQuery = `
      SELECT 
        page_type,
        COUNT(*) as count
      FROM website_pages 
      GROUP BY page_type
    `;
    
    const [typeStats] = await pool.execute(typeStatsQuery);

    // Get page counts by status
    const statusStatsQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM website_pages 
      GROUP BY status
    `;
    
    const [statusStats] = await pool.execute(statusStatsQuery);

    // Get FAQ stats
    const faqStatsQuery = `
      SELECT 
        COUNT(fi.id) as total_faqs,
        COUNT(CASE WHEN fi.is_active = 1 THEN 1 END) as active_faqs,
        SUM(fi.view_count) as total_views,
        SUM(fi.helpful_count) as total_helpful_votes,
        SUM(fi.not_helpful_count) as total_not_helpful_votes
      FROM faq_items fi
    `;
    
    const [faqStats] = await pool.execute(faqStatsQuery) as any;

    // Get total stats
    const totalQuery = `
      SELECT 
        COUNT(*) as total_pages,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_pages,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_pages,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_last_30_days
      FROM website_pages
    `;
    
    const [totalStats] = await pool.execute(totalQuery) as any;

    const response: ApiResponse = {
      success: true,
      message: 'Website page statistics retrieved successfully',
      data: {
        typeStats,
        statusStats,
        faqStats: faqStats[0],
        totalStats: totalStats[0]
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting page stats:', error);
    next(error);
  }
};

/**
 * Get specific website page
 */
export const getPageById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT 
        wp.*,
        CONCAT(u1.first_name, ' ', u1.last_name) as created_by_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as updated_by_name
      FROM website_pages wp 
      LEFT JOIN users u1 ON wp.created_by = u1.id
      LEFT JOIN users u2 ON wp.updated_by = u2.id
      WHERE wp.id = ?
    `, [id]) as any;

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Website page not found'
      });
    }

    // Get page versions
    const [versions] = await pool.execute(`
      SELECT 
        pv.*,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM page_versions pv
      LEFT JOIN users u ON pv.created_by = u.id
      WHERE pv.page_id = ? 
      ORDER BY pv.version_number DESC
      LIMIT 10
    `, [id]);

    const response: ApiResponse = {
      success: true,
      message: 'Website page retrieved successfully',
      data: {
        page: rows[0],
        versions
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting website page:', error);
    next(error);
  }
};

/**
 * Create new website page
 */
export const createPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      title, 
      slug, 
      page_type = 'custom', 
      content, 
      meta_title, 
      meta_description, 
      meta_keywords,
      status = 'draft',
      is_featured = false,
      display_order = 0,
      template = 'default'
    } = req.body;
    
    const pageId = uuidv4();
    const user = (req as any).user;

    // Check if slug already exists
    const [existing] = await pool.execute(
      'SELECT id FROM website_pages WHERE slug = ?',
      [slug]
    ) as any;

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists. Please choose a different slug.'
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create page
      await connection.execute(`
        INSERT INTO website_pages (
          id, title, slug, page_type, content, meta_title, meta_description, 
          meta_keywords, status, is_featured, display_order, template, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        pageId, title, slug, page_type, content, meta_title, meta_description,
        meta_keywords, status, is_featured, display_order, template, user.user_id
      ]);

      // Create initial version
      await connection.execute(`
        INSERT INTO page_versions (
          id, page_id, version_number, title, content, meta_title, 
          meta_description, meta_keywords, status, created_by
        ) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(), pageId, title, content, meta_title, meta_description,
        meta_keywords, status, user.user_id
      ]);

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Website page created successfully',
        data: {
          id: pageId,
          title,
          slug,
          page_type,
          status
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
    console.error('Error creating website page:', error);
    next(error);
  }
};

/**
 * Update website page
 */
export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      slug, 
      page_type, 
      content, 
      meta_title, 
      meta_description, 
      meta_keywords,
      status,
      is_featured,
      display_order,
      template
    } = req.body;
    const user = (req as any).user;

    // Check if page exists
    const [existing] = await pool.execute(
      'SELECT * FROM website_pages WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Website page not found'
      });
    }

    const currentPage = existing[0];
    const updates: any = {};
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Build dynamic update query
    if (title && title !== currentPage.title) {
      updates.title = title;
      updateFields.push('title');
      updateValues.push(title);
    }

    if (slug && slug !== currentPage.slug) {
      // Check if new slug already exists
      const [slugExists] = await pool.execute(
        'SELECT id FROM website_pages WHERE slug = ? AND id != ?',
        [slug, id]
      ) as any;

      if (slugExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists. Please choose a different slug.'
        });
      }

      updates.slug = slug;
      updateFields.push('slug');
      updateValues.push(slug);
    }

    if (page_type !== undefined) {
      updates.page_type = page_type;
      updateFields.push('page_type');
      updateValues.push(page_type);
    }

    if (content !== undefined) {
      updates.content = content;
      updateFields.push('content');
      updateValues.push(content);
    }

    if (meta_title !== undefined) {
      updates.meta_title = meta_title;
      updateFields.push('meta_title');
      updateValues.push(meta_title);
    }

    if (meta_description !== undefined) {
      updates.meta_description = meta_description;
      updateFields.push('meta_description');
      updateValues.push(meta_description);
    }

    if (meta_keywords !== undefined) {
      updates.meta_keywords = meta_keywords;
      updateFields.push('meta_keywords');
      updateValues.push(meta_keywords);
    }

    if (status !== undefined) {
      updates.status = status;
      updateFields.push('status');
      updateValues.push(status);
    }

    if (is_featured !== undefined) {
      updates.is_featured = is_featured;
      updateFields.push('is_featured');
      updateValues.push(is_featured);
    }

    if (display_order !== undefined) {
      updates.display_order = display_order;
      updateFields.push('display_order');
      updateValues.push(display_order);
    }

    if (template !== undefined) {
      updates.template = template;
      updateFields.push('template');
      updateValues.push(template);
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

      // Update page
      updateFields.push('updated_by');
      updateValues.push(user.user_id);
      
      const setClause = updateFields.map(field => `${field} = ?`).join(', ');
      await connection.execute(
        `UPDATE website_pages SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...updateValues, id]
      );

      // Create new version if content changed
      if (content !== undefined || title !== undefined || status !== undefined) {
        // Get latest version number
        const [latestVersion] = await connection.execute(
          'SELECT MAX(version_number) as max_version FROM page_versions WHERE page_id = ?',
          [id]
        ) as any;
        
        const nextVersion = (latestVersion[0].max_version || 0) + 1;

        await connection.execute(`
          INSERT INTO page_versions (
            id, page_id, version_number, title, content, meta_title, 
            meta_description, meta_keywords, status, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(), id, nextVersion, title || currentPage.title, 
          content || currentPage.content, meta_title || currentPage.meta_title,
          meta_description || currentPage.meta_description, 
          meta_keywords || currentPage.meta_keywords,
          status || currentPage.status, user.user_id
        ]);
      }

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Website page updated successfully',
        data: { ...currentPage, ...updates }
      };

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error updating website page:', error);
    next(error);
  }
};

/**
 * Delete website page
 */
export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if page exists
    const [existing] = await pool.execute(
      'SELECT title FROM website_pages WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Website page not found'
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete page (cascade will handle versions)
      await connection.execute('DELETE FROM website_pages WHERE id = ?', [id]);

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Website page deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error deleting website page:', error);
    next(error);
  }
};

/**
 * Get all FAQ items with search and pagination
 */
export const getFAQItems = async (req: Request, res: Response, next: NextFunction) => {
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
      whereConditions.push('(fi.question LIKE ? OR fi.answer LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Status filter
    if (status === 'active') {
      whereConditions.push('fi.is_active = 1');
    } else if (status === 'inactive') {
      whereConditions.push('fi.is_active = 0');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Ensure limit and offset are safe integers
    const limitInt = parseInt(limit.toString());
    const offsetInt = parseInt(offset.toString());
    
    // Get FAQ items with pagination - using direct values for LIMIT/OFFSET to avoid MySQL parameter issues
    const faqsQuery = `
      SELECT 
        fi.*,
        CONCAT(u1.first_name, ' ', u1.last_name) as created_by_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as updated_by_name
      FROM faq_items fi 
      LEFT JOIN users u1 ON fi.created_by = u1.id
      LEFT JOIN users u2 ON fi.updated_by = u2.id
      ${whereClause}
      ORDER BY fi.display_order ASC, fi.created_at DESC 
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;
    
    const [faqs] = await pool.execute(faqsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM faq_items fi ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, queryParams) as any;
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'FAQ items retrieved successfully',
      data: faqs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting FAQ items:', error);
    next(error);
  }
};

/**
 * Get specific FAQ item
 */
export const getFAQItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT 
        fi.*,
        CONCAT(u1.first_name, ' ', u1.last_name) as created_by_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as updated_by_name
      FROM faq_items fi 
      LEFT JOIN users u1 ON fi.created_by = u1.id
      LEFT JOIN users u2 ON fi.updated_by = u2.id
      WHERE fi.id = ?
    `, [id]) as any;

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'FAQ item retrieved successfully',
      data: rows[0]
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting FAQ item:', error);
    next(error);
  }
};

/**
 * Create FAQ item
 */
export const createFAQItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { question, answer, display_order = 0, is_active = true } = req.body;
    const itemId = uuidv4();
    const user = (req as any).user;

    await pool.execute(`
      INSERT INTO faq_items (id, question, answer, display_order, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [itemId, question, answer, display_order, is_active, user.user_id]);

    const response: ApiResponse = {
      success: true,
      message: 'FAQ item created successfully',
      data: {
        id: itemId,
        question,
        answer,
        display_order,
        is_active
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating FAQ item:', error);
    next(error);
  }
};

/**
 * Update FAQ item
 */
export const updateFAQItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { question, answer, display_order, is_active } = req.body;
    const user = (req as any).user;

    // Check if FAQ exists
    const [existing] = await pool.execute(
      'SELECT id FROM faq_items WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    await pool.execute(`
      UPDATE faq_items 
      SET question = ?, answer = ?, display_order = ?, is_active = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `, [question, answer, display_order, is_active, user.user_id, id]);

    const response: ApiResponse = {
      success: true,
      message: 'FAQ item updated successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error updating FAQ item:', error);
    next(error);
  }
};

/**
 * Delete FAQ item
 */
export const deleteFAQItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if FAQ exists
    const [existing] = await pool.execute(
      'SELECT id FROM faq_items WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'FAQ item not found'
      });
    }

    await pool.execute('DELETE FROM faq_items WHERE id = ?', [id]);

    const response: ApiResponse = {
      success: true,
      message: 'FAQ item deleted successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error deleting FAQ item:', error);
    next(error);
  }
};

/**
 * Update view count for FAQ item
 */
export const incrementFAQViewCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE faq_items SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'View count updated successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error updating view count:', error);
    next(error);
  }
};

/**
 * Vote on FAQ helpfulness
 */
export const voteFAQItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body; // boolean: true for helpful, false for not helpful

    const column = helpful ? 'helpful_count' : 'not_helpful_count';
    
    await pool.execute(
      `UPDATE faq_items SET ${column} = ${column} + 1 WHERE id = ?`,
      [id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Vote recorded successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error recording vote:', error);
    next(error);
  }
};

/**
 * Get public website page by slug or page_type (no auth required)
 */
export const getPublicPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params; // Can be slug or page_type
    
    // Try to find by slug first, then by page_type
    const pageQuery = `
      SELECT 
        wp.id,
        wp.title,
        wp.slug,
        wp.page_type,
        wp.content,
        wp.meta_title,
        wp.meta_description,
        wp.meta_keywords,
        wp.template,
        wp.updated_at
      FROM website_pages wp 
      WHERE wp.status = 'published' AND (wp.slug = ? OR wp.page_type = ?)
      ORDER BY wp.updated_at DESC
      LIMIT 1
    `;
    
    const [rows] = await pool.execute(pageQuery, [identifier, identifier]) as any;

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Page not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Page retrieved successfully',
      data: rows[0]
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting public page:', error);
    next(error);
  }
};