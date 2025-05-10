import api from '../utils/api';
import type { LoginCredentials, RegisterCredentials, User } from '../types/auth';

export const login = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (credentials: RegisterCredentials) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};