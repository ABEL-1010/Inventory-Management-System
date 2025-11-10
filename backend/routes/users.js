import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const userRoutes = express.Router();

// All user routes require admin access
userRoutes.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

userRoutes.route('/:id')
  .get(protect, admin, getUser)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default userRoutes;