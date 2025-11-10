import API from './api';

export const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await API.get('/auth/profile'); // make sure this exists in backend
    return response.data;
  }
};
