import api from '../utils/api';
import type { UserData, UserAnalytics, Interaction, TimeSpent, PaginationParams, PaginatedUsers, ElementTimeSpent, FilterOptions, ElementInteractionCount } from '../types/user';
import { BOOTHID } from '../utils/data';

export const getAllUsers = async (params: PaginationParams): Promise<PaginatedUsers> => {
  const response = await api.get(`/admin/${BOOTHID}/visitors?page=${params.page}&size=${params.size}&sort=${params.sortBy},${params.sortDir}`);
  console.log(response)
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

export const getTotalTimeSpendingByElement = async (): Promise<ElementTimeSpent[]> => {
  const response = await api.get(`/admin/analytics/${BOOTHID}/totaltimespent`);
  return response.data;
}

export const getInteractionCountAnalytics = async (
  requestData: FilterOptions
): Promise<ElementInteractionCount[]> => {
  const response = await api.post(`/admin/analytics/${BOOTHID}/intraction`, requestData);
  console.log(response);
  return response.data;
};