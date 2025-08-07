import express from 'express';
import authRoute from './api/auth.route.js';
import docgiaRoute from './api/docgia.route.js';
import sachRoute from './api/sach.route.js';
import nhaxuatbanRoute from './api/nhaxuatban.route.js';
import theodoimuonsachRoute from './api/theodoimuonsach.route.js';
import nhanvienRoute from './api/nhanvien.route.js';
import dashboardRoute from './api/dashboard.route.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoute);
router.use('/dashboard', dashboardRoute);
router.use('/docgia', docgiaRoute);
router.use('/sach', sachRoute);
router.use('/nhaxuatban', nhaxuatbanRoute);
router.use('/theodoimuonsach', theodoimuonsachRoute);
router.use('/nhanvien', nhanvienRoute);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    error: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl
  });
});

export default router;
