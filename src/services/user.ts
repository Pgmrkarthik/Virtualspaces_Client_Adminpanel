import api from '../utils/api';
import type { UserData, UserAnalytics } from '../types/user';
import { BOOTHID } from '../utils/data';

export const getAllUsers = async (): Promise<UserData[]> => {
  const response = await api.get(`/admin/${BOOTHID}/visitors`);
  return response.data;
};

export const getUserAnalytics = async (): Promise<UserAnalytics> => {
  const response = await api.get(`/admin/${BOOTHID}/users/analytics`);
  return response.data;
};