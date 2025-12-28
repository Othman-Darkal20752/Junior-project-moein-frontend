import { accountApi } from './api';

export const signup = async (userData) => {
  const response = await accountApi.post('/signup/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await accountApi.post('/login/', credentials);
  return response.data;
};

export const getUserInfo = async () => {
  const response = await accountApi.get('/me/');
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await accountApi.delete('/delete/', {
    data: { password }
  });
  return response.data;
};

export const updateAccount = async (userData) => {
  const response = await accountApi.put('/edit/', userData);
  return response.data;
};

