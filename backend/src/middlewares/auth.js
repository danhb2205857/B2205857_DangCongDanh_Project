import jwt from 'jsonwebtoken';
import config from '../config.js';
import { NhanVien } from '../models/index.js';
import DocGia from '../models/DocGia.js';


export const authenticateToken = async (req, res, next) => {
  try {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
    }

    
    const decoded = jwt.verify(token, config.jwtSecret);
    
    
    const nhanVien = await NhanVien.findById(decoded.id).select('-Password');
    
    if (!nhanVien) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found',
        error: 'USER_NOT_FOUND'
      });
    }

    
    if (nhanVien.TrangThai !== 'Đang làm việc') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    
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


export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    
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


export const requireRole = (roles) => {
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED'
      });
    }

    
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


export const authenticateReader = async (req, res, next) => {
  try {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    
    if (decoded.role !== 'reader') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - not a reader token',
        error: 'INVALID_ROLE'
      });
    }
    
    
    const docGia = await DocGia.findById(decoded.id).select('-password');
    
    if (!docGia) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - reader not found',
        error: 'READER_NOT_FOUND'
      });
    }

    
    if (!docGia.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Reader account is not active',
        error: 'ACCOUNT_INACTIVE'
      });
    }

    
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


export const authenticateUser = async (req, res, next) => {
  try {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN'
      });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwtSecret);
    
    let user = null;
    
    
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