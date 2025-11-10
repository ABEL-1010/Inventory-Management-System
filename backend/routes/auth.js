import express from 'express';
import {
  loginUser,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRoutes = express.Router();

authRoutes.post('/login', loginUser);
authRoutes.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default authRoutes;