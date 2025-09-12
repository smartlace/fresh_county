import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { mfaService } from '../services/mfaService';
import { bruteForceProtection } from '../middleware/adminRateLimiter';
import { createUserSession, destroyUserSession, regenerateSession } from '../config/session';
import { 
  hashPassword, 
  comparePassword, 
  generateToken,
  createJWTPayload,
  isValidEmail 
} from '../utils/auth';
import pool from '../config/database';

/**
 * Enhanced login with MFA support
 */
export const enhancedLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, mfaToken } = req.body;
    const identifier = `${req.ip}:${email}`;

    // Check brute force protection
    if (await bruteForceProtection.isBlocked(identifier)) {
      return res.status(429).json({
        success: false,
        message: 'Account temporarily locked due to too many failed attempts'
      });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password, first_name, last_name, role FROM users WHERE email = ? AND role = ?',
      [email, 'admin']
    ) as any[];

    if (users.length === 0) {
      await bruteForceProtection.recordFailedAttempt(identifier);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Verify password
    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      await bruteForceProtection.recordFailedAttempt(identifier);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if MFA is enabled
    const mfaEnabled = await mfaService.isMFAEnabled(user.id.toString());

    if (mfaEnabled) {
      // If MFA token provided, verify it
      if (mfaToken) {
        const mfaResult = await mfaService.verifyMFAToken(user.id.toString(), mfaToken);
        
        if (!mfaResult.isValid) {
          await bruteForceProtection.recordFailedAttempt(identifier);
          return res.status(401).json({
            success: false,
            message: 'Invalid MFA token'
          });
        }

        // MFA verified, complete login
        await completeLogin(req, res, user);
        
        // Clear failed attempts on successful login
        await bruteForceProtection.clearAttempts(identifier);
        
        return;
      } else {
        // Need MFA token, create temporary token
        const mfaLoginToken = await mfaService.createMFALoginToken(user.id.toString());
        
        return res.status(200).json({
          success: true,
          requiresMFA: true,
          mfaLoginToken,
          message: 'Please provide your MFA token'
        });
      }
    } else {
      // No MFA required, complete login
      await completeLogin(req, res, user);
      
      // Clear failed attempts on successful login
      await bruteForceProtection.clearAttempts(identifier);
    }

  } catch (error) {
    console.error('Enhanced login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Complete the login process
 */
async function completeLogin(req: Request, res: Response, user: any) {
  // Regenerate session for security
  await regenerateSession(req);
  
  // Create user session
  createUserSession(req.session, user);
  
  // Generate JWT token
  const jwtPayload = createJWTPayload(user);
  const token = generateToken(jwtPayload);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    }
  });
}

/**
 * Setup MFA for admin user
 */
export const setupMFA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const mfaSetup = await mfaService.generateMFASetup(user.user_id.toString(), user.email);
    
    res.json({
      success: true,
      message: 'MFA setup generated',
      data: mfaSetup
    });

  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup MFA'
    });
  }
};

/**
 * Confirm MFA setup
 */
export const confirmMFA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    const user = (req as any).user;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'MFA token required'
      });
    }

    const confirmed = await mfaService.confirmMFASetup(user.user_id.toString(), token);
    
    if (confirmed) {
      res.json({
        success: true,
        message: 'MFA enabled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid MFA token'
      });
    }

  } catch (error) {
    console.error('MFA confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm MFA'
    });
  }
};

/**
 * Disable MFA
 */
export const disableMFA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, mfaToken } = req.body;
    const user = (req as any).user;

    // Verify password for security
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [user.user_id]
    ) as any[];

    if (users.length === 0 || !await comparePassword(password, users[0].password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify MFA token
    const mfaResult = await mfaService.verifyMFAToken(user.user_id.toString(), mfaToken);
    if (!mfaResult.isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid MFA token'
      });
    }

    const disabled = await mfaService.disableMFA(user.user_id.toString());
    
    if (disabled) {
      res.json({
        success: true,
        message: 'MFA disabled successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to disable MFA'
      });
    }

  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable MFA'
    });
  }
};

/**
 * Get MFA status
 */
export const getMFAStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const mfaEnabled = await mfaService.isMFAEnabled(user.user_id.toString());
    
    res.json({
      success: true,
      data: {
        mfaEnabled
      }
    });

  } catch (error) {
    console.error('MFA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get MFA status'
    });
  }
};

/**
 * Generate new backup codes
 */
export const generateBackupCodes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password, mfaToken } = req.body;
    const user = (req as any).user;

    // Verify password
    const [users] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [user.user_id]
    ) as any[];

    if (users.length === 0 || !await comparePassword(password, users[0].password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify MFA token
    const mfaResult = await mfaService.verifyMFAToken(user.user_id.toString(), mfaToken);
    if (!mfaResult.isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid MFA token'
      });
    }

    const backupCodes = await mfaService.generateNewBackupCodes(user.user_id.toString());
    
    if (backupCodes) {
      res.json({
        success: true,
        message: 'New backup codes generated',
        data: {
          backupCodes
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate backup codes'
      });
    }

  } catch (error) {
    console.error('Backup codes generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate backup codes'
    });
  }
};

/**
 * Enhanced logout with session cleanup
 */
export const enhancedLogout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Destroy user session
    destroyUserSession(req.session);
    
    // Destroy the entire session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
    });
    
    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Enhanced logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};