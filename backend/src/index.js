import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { 
  errorHandler, 
  notFound, 
  handleUnhandledRejection, 
  handleUncaughtException 
} from './middlewares/errorHandler.js';
import { createOptimizedIndexes } from './utils/indexOptimizer.js';
import { enableResponseCompression } from './utils/responseOptimizer.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable response compression
app.use(enableResponseCompression);

// Static files for uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'public/uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Database:', process.env.MONGODB_DB_NAME || 'quanlymuonsach');
  
  // Create optimized indexes for better performance
  if (process.env.NODE_ENV !== 'test') {
    try {
      await createOptimizedIndexes();
    } catch (error) {
      console.warn('⚠️  Index creation warning:', error.message);
    }
  }
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});


// Import and use main router
import apiRouter from './routes/index.js';
app.use('/api', apiRouter);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections and uncaught exceptions
handleUnhandledRejection();
handleUncaughtException();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
