import express from 'express';
import DashboardController from '../../controllers/DashboardController.js';
// import { authenticateToken, requirePermission } from '../../middlewares/auth.js';
import { catchAsync } from '../../middlewares/errorHandler.js';

const router = express.Router();

// Apply authentication to all routes - COMMENTED FOR TESTING
// router.use(authenticateToken);

// Routes with error handling - REMOVED AUTH FOR TESTING
router.get('/stats', catchAsync(DashboardController.getStats));
router.get('/recent-activities', catchAsync(DashboardController.getRecentActivities));
router.get('/charts', catchAsync(DashboardController.getChartData));

export default router;