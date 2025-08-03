import config from '../config.js';

/**
 * Error handling middleware
 * Handles all errors and sends appropriate responses
 */

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// MongoDB/Mongoose error handler
const handleMongoError = (error) => {
  let message = 'Lỗi cơ sở dữ liệu';
  let statusCode = 500;
  let errorCode = 'DATABASE_ERROR';

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    message = `${field} '${value}' đã tồn tại`;
    statusCode = 400;
    errorCode = 'DUPLICATE_FIELD';
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    message = errors.join(', ');
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  }

  // Cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    message = `ID không hợp lệ: ${error.value}`;
    statusCode = 400;
    errorCode = 'INVALID_ID';
  }

  return new AppError(message, statusCode, errorCode);
};

// JWT error handler
const handleJWTError = (error) => {
  let message = 'Token không hợp lệ';
  let statusCode = 401;
  let errorCode = 'INVALID_TOKEN';

  if (error.name === 'TokenExpiredError') {
    message = 'Token đã hết hạn';
    errorCode = 'TOKEN_EXPIRED';
  }

  if (error.name === 'JsonWebTokenError') {
    message = 'Token không hợp lệ';
    errorCode = 'INVALID_TOKEN';
  }

  return new AppError(message, statusCode, errorCode);
};

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err.errorCode || 'INTERNAL_ERROR',
    stack: err.stack,
    details: err
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode || 'INTERNAL_ERROR'
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Main error handling middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (config.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError' || error.name === 'ValidationError' || error.code === 11000) {
      error = handleMongoError(error);
    }
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = handleJWTError(error);
    }

    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler
export const notFound = (req, res, next) => {
  const err = new AppError(`Không tìm thấy ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(err);
};

// Unhandled promise rejection handler
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err, promise) => {
    console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });
};

// Uncaught exception handler
export const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });
};

export default {
  AppError,
  errorHandler,
  catchAsync,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException
};