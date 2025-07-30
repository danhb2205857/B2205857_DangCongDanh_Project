import jwt from 'jsonwebtoken';
import config from '../config.js';

/**
 * JWT utility functions
 */

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration (optional)
 * @returns {string} - JWT token
 */
export const generateToken = (payload, expiresIn = config.jwtExpiresIn) => {
  try {
    return jwt.sign(payload, config.jwtSecret, { expiresIn });
  } catch (error) {
    throw new Error('Error generating token: ' + error.message);
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Token verification failed: ' + error.message);
  }
};

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token
 * @returns {Object} - Decoded payload
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Error decoding token: ' + error.message);
  }
};

/**
 * Generate access token for user
 * @param {Object} user - User object
 * @returns {string} - Access token
 */
export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    msnv: user.MSNV,
    chucVu: user.ChucVu,
    quyen: user.Quyen,
    type: 'access'
  };
  
  return generateToken(payload, config.jwtExpiresIn);
};

/**
 * Generate refresh token for user
 * @param {Object} user - User object
 * @returns {string} - Refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    msnv: user.MSNV,
    type: 'refresh'
  };
  
  return generateToken(payload, '7d'); // Refresh token expires in 7 days
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

export default {
  generateToken,
  verifyToken,
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpiration
};