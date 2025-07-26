import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  uploadDir: process.env.UPLOAD_DIR || 'public/uploads',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
};
