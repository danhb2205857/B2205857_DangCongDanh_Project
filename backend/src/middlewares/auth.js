import jwt from 'jsonwebtoken';
import config from '../config.js';
import { NhanVien } from '../models/index.js';
import DocGia from '../models/DocGia.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from database
    const nhanVien = await NhanVien.findById(decoded.id).select('-Password');
    
    if (!nhanVien) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if user is still active
    if (nhanVien.TrangThai !== 'Đang làm việc') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    // Check activation status (temporarily disabled for debugging)
    if (nhanVien.isActivate != 1) {
      console.log('Account activation check failed:', {
        MSNV: nhanVien.MSNV,
        isActivate: nhanVien.isActivate,
        isActivateType: typeof nhanVien.isActivate
      });
      return res.status(401).json({
        success: false,
        message: 'User account is not activated',
        error: 'ACCOUNT_NOT_ACTIVATED'
      });
    }

    // Attach user to request
    req.user = nhanVien;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Permission-based authorization middleware
 * Checks if user has required permission
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Check if user has the required permission
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
export const requireRole = (roles) => {
  // Ensure roles is an array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Check if user has one of the required roles
    if (!allowedRoles.includes(req.user.ChucVu)) {
      return res.status(403).json({
        success: false,
        message: `Role '${allowedRoles.join(' or ')}' required`,
        error: 'INSUFFICIENT_ROLE'
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const nhanVien = await NhanVien.findById(decoded.id).select('-Password');
      
      if (nhanVien && nhanVien.TrangThai === 'Đang làm việc') {
        req.user = nhanVien;
      }
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};

/**
 * Reader Authentication Middleware
 * Verifies JWT token for DocGia (readers)
 */
export const authenticateReader = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if this is a reader token
    if (decoded.role !== 'reader') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - not a reader token',
        error: 'INVALID_ROLE'
      });
    }
    
    // Get reader from database
    const docGia = await DocGia.findById(decoded.id).select('-password');
    
    if (!docGia) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - reader not found',
        error: 'READER_NOT_FOUND'
      });
    }

    // Check if reader account is still active
    if (!docGia.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Reader account is not active',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    // Attach reader to request
    req.user = docGia;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('Reader auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Universal Authentication Middleware
 * Supports both staff and readers
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwtSecret);
    
    let user = null;
    
    // Check role and get appropriate user
    if (decoded.role === 'reader') {
      user = await DocGia.findById(decoded.id).select('-password');
      if (user && !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Reader account is not active',
          error: 'ACCOUNT_INACTIVE'
        });
      }
    } else {
      // Assume staff/admin
      user = await NhanVien.findById(decoded.id).select('-Password');
      if (user && user.TrangThai !== 'Đang làm việc') {
        return res.status(401).json({
          success: false,
          message: 'Staff account is not active',
          error: 'ACCOUNT_INACTIVE'
        });
      }
      
      if (user && user.isActivate != 1) {
        console.log('Universal auth - Account activation check failed:', {
          MSNV: user.MSNV,
          isActivate: user.isActivate,
          isActivateType: typeof user.isActivate
        });
        return res.status(401).json({
          success: false,
          message: 'Staff account is not activated',
          error: 'ACCOUNT_NOT_ACTIVATED'
        });
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Attach user and role to request
    req.user = user;
    req.userRole = decoded.role;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('Universal auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR'
    });
  }
};

export default {
  authenticateToken,
  authenticateReader,
  authenticateUser,
  requirePermission,
  requireRole,
  optionalAuth
};