export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const APP_NAME = process.env.REACT_APP_NAME || 'Inventory Management System';

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
};