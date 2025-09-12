import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import pool from '../config/database';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  createJWTPayload,
  generateSecureToken,
  isValidEmail,
  validatePasswordStrength
} from '../utils/auth';
import { ApiResponse, User } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { emailService, UserEmailData } from '../services/emailService';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { email, password, full_name, mobile } = req.body;

    // Validate email format
    if (!isValidEmail(email)) {
      const error: CustomError = new Error('Invalid email format');
      error.statusCode = 400;
      return next(error);
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      const error: CustomError = new Error('Password does not meet security requirements');
      error.statusCode = 400;
      error.data = passwordValidation.errors;
      return next(error);
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      const error: CustomError = new Error('User already exists with this email');
      error.statusCode = 409;
      return next(error);
    }

    // Split full name into first and last name
    const nameParts = full_name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Hash password and generate verification token
    const hashedPassword = await hashPassword(password);
    const verificationToken = generateSecureToken();

    // Insert new user
    const [result] = await pool.execute(`
      INSERT INTO users (
        email, password, first_name, last_name, phone, role, is_active
      ) VALUES (?, ?, ?, ?, ?, 'customer', 1)
    `, [email, hashedPassword, firstName, lastName, mobile || null]) as any;

    // Fetch the created user by email (UUID primary keys don't work with insertId)
    const [users] = await pool.execute(`
      SELECT id, email, first_name, last_name, phone, role, is_active, created_at 
      FROM users WHERE email = ?
    `, [email]) as any[];

    const dbUser = users[0];

    // Transform database user to frontend format
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      full_name: dbUser.first_name + (dbUser.last_name ? ` ${dbUser.last_name}` : ''),
      mobile: dbUser.phone,
      role: dbUser.role,
      email_verified: false, // Since we don't have email verification yet
      created_at: dbUser.created_at,
      updated_at: dbUser.created_at // Use created_at for updated_at initially
    };

    // Generate tokens
    const jwtPayload = createJWTPayload({ ...dbUser, user_id: dbUser.id });
    const token = generateToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Send welcome email
    try {
      const userEmailData: UserEmailData = {
        firstName: dbUser.first_name || 'Valued Customer',
        lastName: dbUser.last_name || '',
        email: dbUser.email,
        verificationToken: verificationToken
      };

      await emailService.sendWelcomeEmail(dbUser.email, userEmailData);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully. Welcome email sent!',
      data: {
        user,
        token,
        refreshToken
      }
    };

    res.status(201).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { email, password, remember_me } = req.body;

    // Find user by email including address information
    const [users] = await pool.execute(`
      SELECT id, email, password, first_name, last_name, phone, address, city, state, country, zip_code, role, is_active, created_at, updated_at
      FROM users WHERE email = ?
    `, [email]) as any[];

    if (users.length === 0) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    const dbUser = users[0];
    
    // Debug: Log raw database user data from login
    console.log('🔐 Login - Raw DB User Data:', JSON.stringify(dbUser, null, 2));

    // Check if user account is active
    if (!dbUser.is_active) {
      const error: CustomError = new Error('Account has been deactivated. Please contact support.');
      error.statusCode = 403;
      return next(error);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, dbUser.password);
    if (!isValidPassword) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // Transform database user to frontend format
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      full_name: dbUser.first_name + (dbUser.last_name ? ` ${dbUser.last_name}` : ''),
      mobile: dbUser.phone,
      address: dbUser.address,
      city: dbUser.city,
      state: dbUser.state,
      country: dbUser.country,
      zipCode: dbUser.zip_code,
      role: dbUser.role,
      email_verified: false, // Since we don't have email verification yet
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    };
    
    // Debug: Log transformed user data being sent to frontend
    console.log('📤 Login - Transformed User Data:', JSON.stringify(user, null, 2));

    // Generate tokens
    const jwtPayload = createJWTPayload({ ...dbUser, user_id: dbUser.id });
    const token = generateToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Set refresh token as httpOnly cookie if remember_me is true
    if (remember_me) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
        refreshToken
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body;
    const cookieRefreshToken = req.cookies?.refresh_token;

    const tokenToVerify = refresh_token || cookieRefreshToken;

    if (!tokenToVerify) {
      const error: CustomError = new Error('Refresh token not provided');
      error.statusCode = 401;
      return next(error);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(tokenToVerify);

    // Fetch current user data
    const [users] = await pool.execute(`
      SELECT id, email, full_name, mobile, email_verified, role, status, created_at 
      FROM users WHERE id = ?
    `, [decoded.user_id]) as any[];

    if (users.length === 0 || users[0].status !== 'active') {
      const error: CustomError = new Error('User not found or inactive');
      error.statusCode = 401;
      return next(error);
    }

    const user = users[0];

    // Generate new tokens
    const jwtPayload = createJWTPayload(user);
    const newToken = generateToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refresh_token: newRefreshToken,
        user
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    const err: CustomError = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    next(err);
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refresh_token');

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!isValidEmail(email)) {
      const error: CustomError = new Error('Invalid email format');
      error.statusCode = 400;
      return next(error);
    }

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name FROM users WHERE email = ? AND is_active = 1',
      [email]
    ) as any[];

    if (users.length === 0) {
      // Don't reveal if email exists for security
      const response: ApiResponse = {
        success: true,
        message: 'If your email is registered, you will receive a password reset link shortly.'
      };
      return res.status(200).json(response);
    }

    const user = users[0];

    // Generate reset token (expires in 1 hour)
    const resetToken = generateSecureToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await pool.execute(`
      UPDATE users 
      SET password_reset_token = ?, password_reset_expires = ? 
      WHERE id = ?
    `, [resetToken, resetExpires, user.id]);

    // Send password reset email
    try {
      const userEmailData: UserEmailData = {
        firstName: user.first_name || 'Valued Customer',
        lastName: user.last_name || '',
        email: user.email,
        resetToken: resetToken
      };

      await emailService.sendPasswordResetEmail(user.email, userEmailData);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    const response: ApiResponse = {
      success: true,
      message: 'If your email is registered, you will receive a password reset link shortly.'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      const error: CustomError = new Error('Token and new password are required');
      error.statusCode = 400;
      return next(error);
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      const error: CustomError = new Error('Password does not meet security requirements');
      error.statusCode = 400;
      error.data = passwordValidation.errors;
      return next(error);
    }

    // Find user with valid reset token
    const [users] = await pool.execute(`
      SELECT id, email, first_name, last_name FROM users 
      WHERE password_reset_token = ? 
      AND password_reset_expires > NOW() 
      AND is_active = 1
    `, [token]) as any[];

    if (users.length === 0) {
      const error: CustomError = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      return next(error);
    }

    const user = users[0];

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await pool.execute(`
      UPDATE users 
      SET password = ?, password_reset_token = NULL, password_reset_expires = NULL 
      WHERE id = ?
    `, [hashedPassword, user.id]);

    // Send password reset success email
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
      console.log(`✅ Password reset success email sent to ${user.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send password reset success email:', emailError);
      // Continue with success response even if email fails
    }

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token) {
      const error: CustomError = new Error('Verification token is required');
      error.statusCode = 400;
      return next(error);
    }

    // Find user with verification token
    const [users] = await pool.execute(
      'SELECT id, email FROM users WHERE email_verification_token = ?',
      [token]
    ) as any[];

    if (users.length === 0) {
      const error: CustomError = new Error('Invalid verification token');
      error.statusCode = 400;
      return next(error);
    }

    const user = users[0];

    // Update user as verified
    await pool.execute(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE id = ?',
      [user.id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
    }

    // Fetch user data including address information
    const [users] = await pool.execute(`
      SELECT id, email, first_name, last_name, phone, address, city, state, country, zip_code, role, created_at, updated_at
      FROM users WHERE id = ?
    `, [req.user.user_id]) as any[];

    if (users.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const dbUser = users[0];
    
    // Debug: Log raw database user data
    console.log('🔍 Raw DB User Data:', JSON.stringify(dbUser, null, 2));

    // Transform database user to frontend format
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      full_name: dbUser.first_name + (dbUser.last_name ? ` ${dbUser.last_name}` : ''),
      mobile: dbUser.phone,
      address: dbUser.address,
      city: dbUser.city,
      state: dbUser.state,
      country: dbUser.country,
      zipCode: dbUser.zip_code,
      role: dbUser.role,
      email_verified: false, // Since we don't have email verification yet
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at
    };
    
    // Debug: Log transformed user data being sent to frontend
    console.log('📤 Transformed User Data:', JSON.stringify(user, null, 2));

    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Change user password
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    if (!req.user) {
      const error: CustomError = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
    }

    const { current_password, new_password } = req.body;

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(new_password);
    if (!passwordValidation.valid) {
      const error: CustomError = new Error('New password does not meet security requirements');
      error.statusCode = 400;
      error.data = passwordValidation.errors;
      return next(error);
    }

    // Get current user data
    const [users] = await pool.execute(
      'SELECT id, password FROM users WHERE id = ?',
      [req.user.user_id]
    ) as any[];

    if (users.length === 0) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const user = users[0];

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(current_password, user.password);
    if (!isCurrentPasswordValid) {
      const error: CustomError = new Error('Current password is incorrect');
      error.statusCode = 400;
      return next(error);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(new_password);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedNewPassword, req.user.user_id]
    );

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};

/**
 * Check if email exists (for frontend validation)
 */
export const checkEmailExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    // Check if email exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    const response: ApiResponse = {
      success: true,
      message: 'Email check completed',
      data: {
        exists: existingUsers.length > 0
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Admin login - only allows admin, manager, and staff roles
 */
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: CustomError = new Error('Validation failed');
      error.statusCode = 400;
      error.data = errors.array();
      return next(error);
    }

    const { email, password, remember_me } = req.body;

    // Find user by email
    const [users] = await pool.execute(`
      SELECT id, email, password, first_name, last_name, role, is_active, created_at 
      FROM users WHERE email = ?
    `, [email]) as any[];

    if (users.length === 0) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    const user = users[0];

    // Check if user account is active
    if (!user.is_active) {
      const error: CustomError = new Error('Account has been deactivated. Please contact support.');
      error.statusCode = 403;
      return next(error);
    }

    // Check if user has admin/manager/staff role - THIS IS THE KEY SECURITY CHECK
    if (!['admin', 'manager', 'staff'].includes(user.role)) {
      const error: CustomError = new Error('Access denied. This dashboard is for administrators only.');
      error.statusCode = 403;
      return next(error);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      const error: CustomError = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // Remove password from user object
    delete user.password;

    // Transform user data to match frontend expectations
    const transformedUser = {
      ...user,
      full_name: user.first_name + (user.last_name ? ` ${user.last_name}` : '')
    };

    // Generate tokens
    const jwtPayload = createJWTPayload(transformedUser);
    const token = generateToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    // Set refresh token as httpOnly cookie if remember_me is true
    if (remember_me) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user: transformedUser,
        token,
        refresh_token: refreshToken
      }
    };

    res.status(200).json(response);

  } catch (error: any) {
    next(error);
  }
};