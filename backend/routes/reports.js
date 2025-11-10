import express from 'express';
import {
  getSalesByItem,
  getSalesByDate,
  getSalesByCategory,
  getDashboardStats
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const reportRoutes = express.Router();

// All report routes require authentication
reportRoutes.get('/sales-by-item', protect, getSalesByItem);
reportRoutes.get('/sales-by-date', protect, getSalesByDate);
reportRoutes.get('/sales-by-category', protect, getSalesByCategory);
reportRoutes.get('/dashboard-stats', protect, getDashboardStats);

export default reportRoutes;