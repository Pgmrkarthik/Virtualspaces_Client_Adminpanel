// src/types/user.ts
export interface UserData {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  visitCount: number;
  location?: string;
}

export interface UserAnalytics {
  totalUsers: number;
  totalVisits: number;
  locationData: {
    location: string;
    count: number;
  }[];
}