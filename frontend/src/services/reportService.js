import API from './api';

export const reportService = {
  // Sales by item report
  getSalesByItem: async (params = {}) => {
    try {
      const response = await API.get('/reports/sales-by-item', { params });
      return response.data;
    } catch (error) {
      console.error('Error in sales by item report:', error);
      throw error;
    }
  },

  // Sales by date report
  getSalesByDate: async (params = {}) => {
    try {
      const response = await API.get('/reports/sales-by-date', { params });
      return response.data;
    } catch (error) {
      console.error('Error in sales by date report:', error);
      throw error;
    }
  },

  // Sales by category report
  getSalesByCategory: async (params = {}) => {
    try {
      const response = await API.get('/reports/sales-by-category', { params });
      return response.data;
    } catch (error) {
      console.error('Error in sales by category report:', error);
      throw error;
    }
  }
};