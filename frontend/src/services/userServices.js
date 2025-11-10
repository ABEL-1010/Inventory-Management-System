import API from './api';

export const userService = {
  getUsers: async () => {
    const response = await API.get('/users');
    return response.data;
  },

  getUser: async (id) => {
    const response = await API.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await API.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await API.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await API.delete(`/users/${id}`);
    return response.data;
  }
};