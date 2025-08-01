import jwt from 'jsonwebtoken';
import config from '../config.js';
import { NhanVien } from '../models/index.js';

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

export default {
  authenticateToken,
  requirePermission,
  requireRole,
  optionalAuth
};