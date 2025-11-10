import API from './api';

export const itemService = {
  
  // need to see carefully
  getItems: async (params = {}) => {
  try {
    console.log('🔧 itemService.getItems called with params:', params);
    
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/items?${queryString}` : '/items';
    
    console.log('📡 Full URL being called:', url);
    console.log('🔍 Query parameters:', Object.fromEntries(queryParams));

    const response = await API.get(url);
    
    console.log('✅ API call successful. Response data:', {
      itemsCount: response.data.items?.length,
      pagination: response.data.pagination
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ API call failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
},

  getItem: async (id) => {
    const response = await API.get(`/items/${id}`);
    return response.data;
  },

  createItem: async (itemData) => {
    const response = await API.post('/items', itemData);
    return response.data;
  },

  updateItem: async (id, itemData) => {
    const response = await API.put(`/items/${id}`, itemData);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await API.delete(`/items/${id}`);
    return response.data;
  },

  getItemsByCategory: async (categoryId) => {
    const response = await API.get(`/items/category/${categoryId}`);
    return response.data;
  }
};