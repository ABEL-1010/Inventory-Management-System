import API from './api';

export const saleService = {
  getSales: async (params = {}) => {
    try {
      const response = await API.get('/sales', { params });
      return response.data;
    } catch (error) {
      console.error('Error in saleService:', error);
      throw error;
    }
  },

  getSale: async (id) => {
    const response = await API.get(`/sales/${id}`);
    return response.data;
  },

  createSale: async (saleData) => {
    const response = await API.post('/sales', saleData);
    return response.data;
  },

  updateSale: async (id, saleData) => {
    const response = await API.put(`/sales/${id}`, saleData);
    return response.data;
  },

  deleteSale: async (id) => {
    const response = await API.delete(`/sales/${id}`);
    return response.data;
  },

  getSalesByDateRange: async (startDate, endDate) => {
    const response = await API.get('/sales/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  }
};