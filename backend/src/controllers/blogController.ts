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
 * Get all blog posts with search and filters
 */
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const category_id = req.query.category_id as string || '';

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search functionality
    if (search) {
      whereConditions.push('(bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Status filter
    if (status && ['draft', 'published', 'scheduled', 'archived'].includes(status)) {
      whereConditions.push('bp.status = ?');
      queryParams.push(status);
    }

    // Category filter
    if (category_id) {
      whereConditions.push('bp.category_id = ?');
      queryParams.push(category_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Ensure limit and offset are safe integers
    const limitInt = parseInt(limit.toString());
    const offsetInt = parseInt(offset.toString());
    
    // Get posts with pagination - using direct values for LIMIT/OFFSET to avoid MySQL parameter issues
    const postsQuery = `
      SELECT 
        bp.*,
        bc.name as category_name,
        bc.color as category_color,
        CONCAT(u1.first_name, ' ', u1.last_name) as created_by_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as updated_by_name,
        GROUP_CONCAT(bt.name ORDER BY bt.name SEPARATOR ', ') as tags
      FROM blog_posts bp 
      LEFT JOIN blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN users u1 ON bp.created_by = u1.id
      LEFT JOIN users u2 ON bp.updated_by = u2.id
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
      ${whereClause}
      GROUP BY bp.id
      ORDER BY bp.created_at DESC 
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;

    const [posts] = await pool.execute(postsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(DISTINCT bp.id) as total FROM blog_posts bp ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, queryParams) as any;
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Blog posts retrieved successfully',
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting blog posts:', error);
    next(error);
  }
};

/**
 * Get blog statistics
 */
export const getBlogStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get post counts by status
    const statusStatsQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM blog_posts 
      GROUP BY status
    `;
    
    const [statusStats] = await pool.execute(statusStatsQuery);

    // Get post counts by category
    const categoryStatsQuery = `
      SELECT 
        bc.name,
        bc.color,
        COUNT(bp.id) as count
      FROM blog_categories bc
      LEFT JOIN blog_posts bp ON bc.id = bp.category_id
      WHERE bc.is_active = 1
      GROUP BY bc.id, bc.name, bc.color
      ORDER BY count DESC
    `;
    
    const [categoryStats] = await pool.execute(categoryStatsQuery);

    // Get total stats
    const totalQuery = `
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_posts,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_last_30_days,
        SUM(view_count) as total_views,
        COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_posts
      FROM blog_posts
    `;
    
    const [totalStats] = await pool.execute(totalQuery) as any;

    // Get popular posts
    const popularPostsQuery = `
      SELECT 
        id, title, view_count, published_at
      FROM blog_posts 
      WHERE status = 'published'
      ORDER BY view_count DESC 
      LIMIT 5
    `;
    
    const [popularPosts] = await pool.execute(popularPostsQuery);

    // Get recent comments count
    const commentsQuery = `
      SELECT 
        COUNT(*) as total_comments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_comments,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_comments
      FROM blog_comments
    `;
    
    const [commentsStats] = await pool.execute(commentsQuery) as any;

    const response: ApiResponse = {
      success: true,
      message: 'Blog statistics retrieved successfully',
      data: {
        statusStats,
        categoryStats,
        totalStats: totalStats[0],
        popularPosts,
        commentsStats: commentsStats[0]
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting blog stats:', error);
    next(error);
  }
};

/**
 * Get specific blog post
 */
export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(`
      SELECT 
        bp.*,
        bc.name as category_name,
        bc.color as category_color,
        CONCAT(u1.first_name, ' ', u1.last_name) as created_by_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as updated_by_name
      FROM blog_posts bp 
      LEFT JOIN blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN users u1 ON bp.created_by = u1.id
      LEFT JOIN users u2 ON bp.updated_by = u2.id
      WHERE bp.id = ?
    `, [id]) as any;

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Get tags for this post
    const [tags] = await pool.execute(`
      SELECT bt.id, bt.name, bt.slug, bt.color
      FROM blog_tags bt
      JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
      WHERE bpt.post_id = ?
      ORDER BY bt.name
    `, [id]);

    // Get SEO settings
    const [seoSettings] = await pool.execute(`
      SELECT * FROM blog_seo_settings WHERE post_id = ?
    `, [id]) as any;

    const response: ApiResponse = {
      success: true,
      message: 'Blog post retrieved successfully',
      data: {
        post: rows[0],
        tags,
        seoSettings: seoSettings[0] || null
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting blog post:', error);
    next(error);
  }
};

/**
 * Create new blog post
 */
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Blog post validation errors:', JSON.stringify(errors.array(), null, 2));
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      title, 
      slug, 
      excerpt,
      content, 
      featured_image,
      meta_title, 
      meta_description, 
      meta_keywords,
      status = 'draft',
      is_featured = false,
      allow_comments = true,
      reading_time,
      published_at,
      scheduled_at,
      category_id,
      tags = [],
      seo_settings = {}
    } = req.body;
    
    const postId = uuidv4();
    const user = (req as any).user;

    if (!user || !user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'User authentication required. User ID missing.'
      });
    }

    // Handle datetime fields - convert empty strings to null
    const publishedAtValue = published_at && published_at.trim() !== '' ? published_at : null;
    const scheduledAtValue = scheduled_at && scheduled_at.trim() !== '' ? scheduled_at : null;

    // Check if slug already exists
    const [existing] = await pool.execute(
      'SELECT id FROM blog_posts WHERE slug = ?',
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

      // Create post
      await connection.execute(`
        INSERT INTO blog_posts (
          id, title, slug, excerpt, content, featured_image, meta_title, meta_description, 
          meta_keywords, status, is_featured, allow_comments, reading_time, published_at,
          scheduled_at, category_id, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        postId, title, slug, excerpt, content, featured_image, meta_title, meta_description,
        meta_keywords, status, is_featured, allow_comments, reading_time, publishedAtValue,
        scheduledAtValue, category_id, String(user.user_id)
      ]);

      // Add tags if provided
      if (tags && tags.length > 0) {
        for (const tagId of tags) {
          await connection.execute(`
            INSERT INTO blog_post_tags (id, post_id, tag_id) VALUES (?, ?, ?)
          `, [uuidv4(), postId, tagId]);
        }
      }

      // Add SEO settings if provided
      if (Object.keys(seo_settings).length > 0) {
        const {
          canonical_url, og_title, og_description, og_image, og_type,
          twitter_card, twitter_title, twitter_description, twitter_image,
          schema_markup
        } = seo_settings;

        await connection.execute(`
          INSERT INTO blog_seo_settings (
            id, post_id, canonical_url, og_title, og_description, og_image, og_type,
            twitter_card, twitter_title, twitter_description, twitter_image, schema_markup
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(), postId, canonical_url, og_title, og_description, og_image, og_type,
          twitter_card, twitter_title, twitter_description, twitter_image,
          schema_markup ? JSON.stringify(schema_markup) : null
        ]);
      }

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Blog post created successfully',
        data: {
          id: postId,
          title,
          slug,
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
    console.error('Error creating blog post:', error);
    next(error);
  }
};

/**
 * Update blog post
 */
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { 
      title, slug, excerpt, content, featured_image, meta_title, meta_description, 
      meta_keywords, status, is_featured, allow_comments, reading_time, 
      published_at, scheduled_at, category_id, tags, seo_settings
    } = req.body;
    const user = (req as any).user;

    // Check if post exists
    const [existing] = await pool.execute(
      'SELECT * FROM blog_posts WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if new slug already exists (if changed)
    if (slug && slug !== existing[0].slug) {
      const [slugExists] = await pool.execute(
        'SELECT id FROM blog_posts WHERE slug = ? AND id != ?',
        [slug, id]
      ) as any;

      if (slugExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists. Please choose a different slug.'
        });
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];

      if (title !== undefined) { updates.push('title = ?'); values.push(title); }
      if (slug !== undefined) { updates.push('slug = ?'); values.push(slug); }
      if (excerpt !== undefined) { updates.push('excerpt = ?'); values.push(excerpt); }
      if (content !== undefined) { updates.push('content = ?'); values.push(content); }
      if (featured_image !== undefined) { updates.push('featured_image = ?'); values.push(featured_image); }
      if (meta_title !== undefined) { updates.push('meta_title = ?'); values.push(meta_title); }
      if (meta_description !== undefined) { updates.push('meta_description = ?'); values.push(meta_description); }
      if (meta_keywords !== undefined) { updates.push('meta_keywords = ?'); values.push(meta_keywords); }
      if (status !== undefined) { updates.push('status = ?'); values.push(status); }
      if (is_featured !== undefined) { updates.push('is_featured = ?'); values.push(is_featured); }
      if (allow_comments !== undefined) { updates.push('allow_comments = ?'); values.push(allow_comments); }
      if (reading_time !== undefined) { updates.push('reading_time = ?'); values.push(reading_time); }
      if (published_at !== undefined) { 
        const publishedAtValue = published_at && published_at.trim() !== '' ? published_at : null;
        updates.push('published_at = ?'); 
        values.push(publishedAtValue); 
      }
      if (scheduled_at !== undefined) { 
        const scheduledAtValue = scheduled_at && scheduled_at.trim() !== '' ? scheduled_at : null;
        updates.push('scheduled_at = ?'); 
        values.push(scheduledAtValue); 
      }
      if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }

      if (updates.length === 0 && !tags && !seo_settings) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      // Update post if there are changes
      if (updates.length > 0) {
        updates.push('updated_by = ?', 'updated_at = NOW()');
        values.push(user.user_id);
        
        await connection.execute(
          `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`,
          [...values, id]
        );
      }

      // Update tags if provided
      if (tags !== undefined) {
        // Remove existing tags
        await connection.execute('DELETE FROM blog_post_tags WHERE post_id = ?', [id]);
        
        // Add new tags
        if (tags.length > 0) {
          for (const tagId of tags) {
            await connection.execute(`
              INSERT INTO blog_post_tags (id, post_id, tag_id) VALUES (?, ?, ?)
            `, [uuidv4(), id, tagId]);
          }
        }
      }

      // Update SEO settings if provided
      if (seo_settings !== undefined) {
        const {
          canonical_url, og_title, og_description, og_image, og_type,
          twitter_card, twitter_title, twitter_description, twitter_image,
          schema_markup
        } = seo_settings;

        // Check if SEO settings exist
        const [existingSeo] = await connection.execute(
          'SELECT id FROM blog_seo_settings WHERE post_id = ?',
          [id]
        ) as any;

        if (existingSeo.length > 0) {
          // Update existing
          await connection.execute(`
            UPDATE blog_seo_settings SET
              canonical_url = ?, og_title = ?, og_description = ?, og_image = ?, og_type = ?,
              twitter_card = ?, twitter_title = ?, twitter_description = ?, twitter_image = ?,
              schema_markup = ?, updated_at = NOW()
            WHERE post_id = ?
          `, [
            canonical_url, og_title, og_description, og_image, og_type,
            twitter_card, twitter_title, twitter_description, twitter_image,
            schema_markup ? JSON.stringify(schema_markup) : null, id
          ]);
        } else {
          // Create new
          await connection.execute(`
            INSERT INTO blog_seo_settings (
              id, post_id, canonical_url, og_title, og_description, og_image, og_type,
              twitter_card, twitter_title, twitter_description, twitter_image, schema_markup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            uuidv4(), id, canonical_url, og_title, og_description, og_image, og_type,
            twitter_card, twitter_title, twitter_description, twitter_image,
            schema_markup ? JSON.stringify(schema_markup) : null
          ]);
        }
      }

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Blog post updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    next(error);
  }
};

/**
 * Delete blog post
 */
export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const [existing] = await pool.execute(
      'SELECT title FROM blog_posts WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete post (cascade will handle related data)
      await connection.execute('DELETE FROM blog_posts WHERE id = ?', [id]);

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Blog post deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    next(error);
  }
};

/**
 * Get all blog categories
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [categories] = await pool.execute(`
      SELECT 
        bc.*,
        COUNT(bp.id) as post_count,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM blog_categories bc
      LEFT JOIN blog_posts bp ON bc.id = bp.category_id
      LEFT JOIN users u ON bc.created_by = u.id
      WHERE bc.is_active = 1
      GROUP BY bc.id
      ORDER BY bc.display_order ASC, bc.name ASC
    `);

    const response: ApiResponse = {
      success: true,
      message: 'Blog categories retrieved successfully',
      data: categories
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting blog categories:', error);
    next(error);
  }
};

/**
 * Create blog category
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, slug, description, color = '#6B7280', display_order = 0 } = req.body;
    const categoryId = uuidv4();
    const user = (req as any).user;

    await pool.execute(`
      INSERT INTO blog_categories (id, name, slug, description, color, display_order, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [categoryId, name, slug, description, color, display_order, user.user_id]);

    const response: ApiResponse = {
      success: true,
      message: 'Blog category created successfully',
      data: {
        id: categoryId,
        name,
        slug,
        color
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating blog category:', error);
    next(error);
  }
};

/**
 * Get all blog tags
 */
export const getTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [tags] = await pool.execute(`
      SELECT 
        bt.*,
        COUNT(bpt.post_id) as post_count
      FROM blog_tags bt
      LEFT JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
      GROUP BY bt.id
      ORDER BY bt.name ASC
    `);

    const response: ApiResponse = {
      success: true,
      message: 'Blog tags retrieved successfully',
      data: tags
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting blog tags:', error);
    next(error);
  }
};

/**
 * Update blog category
 */
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug, description, color, display_order } = req.body;

    // Check if category exists
    const [existing] = await pool.execute(
      'SELECT * FROM blog_categories WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog category not found'
      });
    }

    // Check if new slug already exists (if changed)
    if (slug && slug !== existing[0].slug) {
      const [slugExists] = await pool.execute(
        'SELECT id FROM blog_categories WHERE slug = ? AND id != ?',
        [slug, id]
      ) as any;

      if (slugExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists. Please choose a different slug.'
        });
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (slug !== undefined) { updates.push('slug = ?'); values.push(slug); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (color !== undefined) { updates.push('color = ?'); values.push(color); }
    if (display_order !== undefined) { updates.push('display_order = ?'); values.push(display_order); }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    
    await pool.execute(
      `UPDATE blog_categories SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Blog category updated successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error updating blog category:', error);
    next(error);
  }
};

/**
 * Delete blog category
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existing] = await pool.execute(
      'SELECT name FROM blog_categories WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog category not found'
      });
    }

    // Check if category is being used by posts
    const [postsUsingCategory] = await pool.execute(
      'SELECT COUNT(*) as count FROM blog_posts WHERE category_id = ?',
      [id]
    ) as any;

    if (postsUsingCategory[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category. It is being used by blog posts.'
      });
    }

    await pool.execute('DELETE FROM blog_categories WHERE id = ?', [id]);

    const response: ApiResponse = {
      success: true,
      message: 'Blog category deleted successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error deleting blog category:', error);
    next(error);
  }
};

/**
 * Create blog tag
 */
export const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, slug, color = '#3B82F6' } = req.body;
    const tagId = uuidv4();

    await pool.execute(`
      INSERT INTO blog_tags (id, name, slug, color) VALUES (?, ?, ?, ?)
    `, [tagId, name, slug, color]);

    const response: ApiResponse = {
      success: true,
      message: 'Blog tag created successfully',
      data: {
        id: tagId,
        name,
        slug,
        color
      }
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error('Error creating blog tag:', error);
    next(error);
  }
};

/**
 * Update blog tag
 */
export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, slug, color } = req.body;

    // Check if tag exists
    const [existing] = await pool.execute(
      'SELECT * FROM blog_tags WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog tag not found'
      });
    }

    // Check if new slug already exists (if changed)
    if (slug && slug !== existing[0].slug) {
      const [slugExists] = await pool.execute(
        'SELECT id FROM blog_tags WHERE slug = ? AND id != ?',
        [slug, id]
      ) as any;

      if (slugExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists. Please choose a different slug.'
        });
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (slug !== undefined) { updates.push('slug = ?'); values.push(slug); }
    if (color !== undefined) { updates.push('color = ?'); values.push(color); }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    await pool.execute(
      `UPDATE blog_tags SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Blog tag updated successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error updating blog tag:', error);
    next(error);
  }
};

/**
 * Delete blog tag
 */
export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if tag exists
    const [existing] = await pool.execute(
      'SELECT name FROM blog_tags WHERE id = ?',
      [id]
    ) as any;

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog tag not found'
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Remove tag associations with posts
      await connection.execute('DELETE FROM blog_post_tags WHERE tag_id = ?', [id]);
      
      // Delete the tag
      await connection.execute('DELETE FROM blog_tags WHERE id = ?', [id]);

      await connection.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Blog tag deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Error deleting blog tag:', error);
    next(error);
  }
};

/**
 * Get published blog posts for public frontend (no auth required)
 */
export const getPublicPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const category_id = req.query.category_id as string || '';

    let whereConditions: string[] = ['bp.status = ?'];
    let queryParams: any[] = ['published'];

    // Search functionality
    if (search) {
      whereConditions.push('(bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category_id) {
      whereConditions.push('bp.category_id = ?');
      queryParams.push(category_id);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    const limitInt = parseInt(limit.toString());
    const offsetInt = parseInt(offset.toString());
    
    // Get published posts with pagination
    const postsQuery = `
      SELECT 
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.content,
        bp.featured_image,
        bp.status,
        bp.is_featured,
        bp.view_count,
        bp.reading_time,
        bp.published_at,
        bp.created_at,
        bp.updated_at,
        bc.name as category_name,
        bc.color as category_color,
        GROUP_CONCAT(bt.name ORDER BY bt.name SEPARATOR ', ') as tags
      FROM blog_posts bp 
      LEFT JOIN blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
      ${whereClause}
      GROUP BY bp.id
      ORDER BY bp.is_featured DESC, bp.published_at DESC, bp.created_at DESC 
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;

    const [posts] = await pool.execute(postsQuery, queryParams);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(DISTINCT bp.id) as total FROM blog_posts bp ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, queryParams) as any;
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      success: true,
      message: 'Blog posts retrieved successfully',
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting public blog posts:', error);
    next(error);
  }
};

/**
 * Get single published blog post by slug for public frontend (no auth required)
 */
export const getPublicPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const postQuery = `
      SELECT 
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.content,
        bp.featured_image,
        bp.meta_title,
        bp.meta_description,
        bp.meta_keywords,
        bp.status,
        bp.is_featured,
        bp.view_count,
        bp.reading_time,
        bp.published_at,
        bp.created_at,
        bp.updated_at,
        bc.name as category_name,
        bc.color as category_color,
        GROUP_CONCAT(bt.name ORDER BY bt.name SEPARATOR ', ') as tags
      FROM blog_posts bp 
      LEFT JOIN blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
      WHERE bp.slug = ? AND bp.status = 'published'
      GROUP BY bp.id
    `;

    const [rows] = await pool.execute(postQuery, [slug]) as any;

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Blog post retrieved successfully',
      data: rows[0]
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting public blog post:', error);
    next(error);
  }
};

/**
 * Increment blog post view count (no auth required)
 */
export const incrementPostViewCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await pool.execute(
      'UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'View count updated successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error incrementing view count:', error);
    next(error);
  }
};

/**
 * Get blog settings (public endpoint)
 */
export const getBlogSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch blog-related settings
    const [rows] = await pool.execute(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('blog_page_title', 'blog_page_subtitle')
      AND setting_key IS NOT NULL
    `);

    const settings: { [key: string]: string } = {};

    // Transform database results to key-value pairs
    if (Array.isArray(rows)) {
      rows.forEach((row: any) => {
        if (row.setting_key && row.setting_value) {
          settings[row.setting_key] = row.setting_value;
        }
      });
    }

    // Provide default values if not found in database
    const blogSettings = {
      blog_page_title: settings.blog_page_title || 'BLOG LISTS',
      blog_page_subtitle: settings.blog_page_subtitle || 'Offer a range of fresh juices, smoothies, parfaits, salads, wraps, and other healthy options'
    };

    const response: ApiResponse = {
      success: true,
      message: 'Blog settings retrieved successfully',
      data: { settings: blogSettings }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching blog settings:', error);
    
    // Return default blog settings if database fails
    const response: ApiResponse = {
      success: true,
      message: 'Blog settings retrieved (default)',
      data: { 
        settings: {
          blog_page_title: 'BLOG LISTS',
          blog_page_subtitle: 'Offer a range of fresh juices, smoothies, parfaits, salads, wraps, and other healthy options'
        }
      }
    };
    
    res.status(200).json(response);
  }
};

/**
 * Update blog settings (admin only)
 */
export const updateBlogSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { blog_page_title, blog_page_subtitle } = req.body;

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update blog page title if provided
      if (blog_page_title !== undefined) {
        await connection.execute(`
          UPDATE system_settings 
          SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE setting_key = 'blog_page_title'
        `, [blog_page_title]);
      }

      // Update blog page subtitle if provided  
      if (blog_page_subtitle !== undefined) {
        await connection.execute(`
          UPDATE system_settings 
          SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE setting_key = 'blog_page_subtitle'
        `, [blog_page_subtitle]);
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      const response: ApiResponse = {
        success: true,
        message: 'Blog settings updated successfully'
      };

      res.status(200).json(response);

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error: any) {
    console.error('Error updating blog settings:', error);
    next(error);
  }
};