import express from 'express';
import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSalesByDateRange
} from '../controllers/saleController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const saleRoutes = express.Router();

// All sales routes require authentication
saleRoutes.route('/')
  .get(protect, getSales)
  .post(protect, createSale);

saleRoutes.route('/date-range')
  .get(protect, getSalesByDateRange);

saleRoutes.route('/:id')
  .get(protect, getSale)
  .put(protect, admin, updateSale)
  .delete(protect, admin, deleteSale);

export default saleRoutes;