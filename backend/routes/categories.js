import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const categoryRoutes = express.Router();

// Public routes
categoryRoutes.route('/')
  .get(getCategories);

categoryRoutes.route('/:id')
  .get(getCategory);

// Admin only routes
categoryRoutes.route('/')
  .post(protect, admin, createCategory);

categoryRoutes.route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default categoryRoutes;