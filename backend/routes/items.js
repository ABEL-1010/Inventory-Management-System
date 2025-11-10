import express from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemsByCategory,
  updateItemQuantity
} from '../controllers/itemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const itemRoutes = express.Router();

// Public routes
itemRoutes.route('/')
  .get(getItems);

itemRoutes.route('/:id')
  .get(getItem);

itemRoutes.route('/category/:categoryId')
  .get(getItemsByCategory);

// Admin only routes
itemRoutes.route('/')
  .post(protect, admin, createItem);

itemRoutes.route('/:id')
  .put(protect, admin, updateItem)
  .delete(protect, admin, deleteItem);

itemRoutes.route('/:id/quantity')
  .patch(protect, admin, updateItemQuantity);

export default itemRoutes;