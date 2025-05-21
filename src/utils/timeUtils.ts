// Description: Utility functions for handling date and time conversions, formatting, and calculations
/**
 * Converts a UTC timestamp string to a localized date-time string
 * @param utcTimestamp - UTC timestamp string in ISO 8601 format (e.g., "2025-05-16T10:08:04.87774074")
 * @param options - Optional formatting options (uses browser default if not specified)
 * @returns Formatted local time string
 */
export const convertUTCToLocalTime = (
  utcTimestamp: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  }
): string => {
  try {
    const date = new Date(utcTimestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }
    
    return date.toLocaleString(undefined, options);
  } catch (error) {
    console.error('Error converting UTC to local time:', error);
    return 'Invalid date';
  }
};

/**
 * Returns the user's local timezone
 * @returns The local timezone identifier (e.g., "America/New_York")
 */
export const getLocalTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting local timezone:', error);
    return 'Unknown';
  }
};

/**
 * Formats a UTC timestamp as a relative time string (e.g., "2 hours ago")
 * @param utcTimestamp - UTC timestamp string in ISO 8601 format
 * @returns A string representing the relative time
 */
export const getRelativeTimeFromUTC = (utcTimestamp: string): string => {
  try {
    const date = new Date(utcTimestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    // Less than an hour
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than a week
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Default: return formatted date
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Unknown time';
  }
};

/**
 * Formats a UTC timestamp as a short date string
 * @param utcTimestamp - UTC timestamp string in ISO 8601 format
 * @returns Formatted date string (e.g., "May 16, 2025")
 */
export const formatShortDate = (utcTimestamp: string): string => {
  try {
    const date = new Date(utcTimestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting short date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats a UTC timestamp as time only
 * @param utcTimestamp - UTC timestamp string in ISO 8601 format
 * @returns Formatted time string (e.g., "10:08 AM")
 */
export const formatTimeOnly = (utcTimestamp: string): string => {
  try {
    const date = new Date(utcTimestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }
    
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Checks if a UTC timestamp is today in local time
 * @param utcTimestamp - UTC timestamp string in ISO 8601 format
 * @returns Boolean indicating if the timestamp is from today
 */
export const isToday = (utcTimestamp: string): boolean => {
  try {
    const date = new Date(utcTimestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }
    
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};