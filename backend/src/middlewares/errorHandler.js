import config from '../config.js';


export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}


const handleMongoError = (error) => {
  let message = 'Lỗi cơ sở dữ liệu';
  let statusCode = 500;
  let errorCode = 'DATABASE_ERROR';

  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    message = `${field} '${value}' đã tồn tại`;
    statusCode = 400;
    errorCode = 'DUPLICATE_FIELD';
  }

  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    message = errors.join(', ');
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  }

  
  if (error.name === 'CastError') {
    message = `ID không hợp lệ: ${error.value}`;
    statusCode = 400;
    errorCode = 'INVALID_ID';
  }

  return new AppError(message, statusCode, errorCode);
};


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


const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err.errorCode || 'INTERNAL_ERROR',
    stack: err.stack,
    details: err
  });
};


const sendErrorProd = (err, res) => {
  
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode || 'INTERNAL_ERROR'
    });
  } else {
    
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống',
      error: 'INTERNAL_ERROR'
    });
  }
};


export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  
  if (config.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    
    if (error.name === 'CastError' || error.name === 'ValidationError' || error.code === 11000) {
      error = handleMongoError(error);
    }
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = handleJWTError(error);
    }

    sendErrorProd(error, res);
  }
};


export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};


export const notFound = (req, res, next) => {
  const err = new AppError(`Không tìm thấy ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(err);
};


export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err, promise) => {
    console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });
};

      
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