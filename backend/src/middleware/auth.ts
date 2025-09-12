import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';
import { verifyToken, extractBearerToken, generateSessionId } from '../utils/auth';
import { JWTPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      session_id?: string;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      const error: CustomError = new Error('Authentication required. Please log in to access this resource.');
      error.statusCode = 401;
      return next(error);
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error: any) {
    const err: CustomError = new Error('Invalid or expired token. Please log in again.');
    err.statusCode = 401;
    next(err);
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
      } catch (error) {
        // Token invalid, but continue without authentication
        req.user = undefined;
      }
    }

    // Generate session ID for guest users
    if (!req.user && !req.session_id) {
      req.session_id = generateSessionId();
    }

    next();
  } catch (error: any) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error: CustomError = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};