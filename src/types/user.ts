// src/types/user.ts
export interface UserData {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  institution?: string;
  visitCount: number;
  location?: string;
  createdAt: string;  // ISO date string
}

export interface UserAnalytics {
  totalUsers: number;
  totalVisits: number;
  locationData: {
    location: string;
    count: number;
  }[];
}


export interface Interaction {
  id: string;
  boothId: string;
  visitorId: string;
  actionElement: string;
  actionType: string;
  actionSubType: string;
  createdAt: string; // ISO date string
}