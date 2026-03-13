// src/types/user.ts
export interface UserData {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  spaBusinessName?: string;

  contactTitle: string

  city?: string;

  state?: string;

  visitCount: number;
  location?: string;
  createdAt: string;  // ISO date string
  isWonSpinWealReward?: boolean;
  reward?: {
    id: number;
    rewardName: string;
    rewardDescription: string;
    isActive: boolean;
  };
  recentEntryTime?: string; // ISO date string
  recentExitTime?: string; // ISO date string 
  totalWatchingMinutes?: number;

}

export interface UserAnalytics {
  totalUsers: number;
  totalVisits: number;
  totalHours?: number;
  locationData: {
    location: string;
    visits?:number
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


export interface TimeSpent {
  id: string;
  visitorId: string;
  elementType: string;
  actionType: string;
  duration: number; // Duration in seconds
}



export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}

export interface PaginationParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

export interface PaginatedUsers {
  content: UserData[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}


export interface ElementInteractionCount {
  element: string;
  count: number;
}

export interface ElementTimeSpent {
  elementType: string;
  totalTimeSpent: number;
}

export interface FilterOptions {
  period: 'today' | 'lastWeek' | 'lastMonth' | 'alltime' | 'custom';
  startDate?: string | null;
  endDate?: string | null;
}