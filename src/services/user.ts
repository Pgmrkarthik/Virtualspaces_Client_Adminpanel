import api from '../utils/api';
import type { UserData, UserAnalytics, Interaction, TimeSpent } from '../types/user';
import { BOOTHID } from '../utils/data';

export const getAllUsers = async (): Promise<UserData[]> => {
  const response = await api.get(`/admin/${BOOTHID}/visitors`);
  return response.data;
};

export const getUserAnalytics = async (): Promise<UserAnalytics> => {
  const response = await api.get(`/admin/${BOOTHID}/users/analytics`);
  return response.data;
};


export const getIntractionsByUserId = async (userId: string): Promise<Interaction[]> => {
  const response = await api.get(`/admin/${BOOTHID}/visitor/${userId}/interactions`);
  return response.data;
}

export const getSpendingTimeByUserId = async (userId: string): Promise<TimeSpent[]> => {
  const response = await api.get(`/admin/visitor/${userId}/totalTimeSpend`);
  return response.data;
}