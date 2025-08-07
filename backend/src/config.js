import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodbUri: process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/quanlymuonsach',
  mongodbDbName: process.env.MONGODB_DB_NAME || 'quanlymuonsach',
  
  uploadDir: process.env.UPLOAD_DIR || 'public/uploads',
  
  jwtSecret: process.env.JWT_SECRET || 'quanlymuonsach_jwt_secret_key_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  appName: process.env.APP_NAME || 'Quan Ly Muon Sach',
  appVersion: process.env.APP_VERSION || '1.0.0',
};
