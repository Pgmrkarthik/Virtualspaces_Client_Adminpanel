import api from '../utils/api';
import type { UserData, UserAnalytics } from '../types/user';

export const getAllUsers = async (): Promise<UserData[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserAnalytics = async (): Promise<UserAnalytics> => {
  const response = await api.get('/users/analytics');
  return response.data;
};