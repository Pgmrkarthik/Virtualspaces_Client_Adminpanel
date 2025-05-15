export const getTimeAgo = (isoTimestamp: string): string => {
  const pastDate = new Date(isoTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - pastDate.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  } else if (minutes < 2) {
    return "1 minute ago";
  } else if (minutes <= 4) {
    return "1 to 4 minutes ago";
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 2) {
    return "1 hour ago";
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else if (days === 1) {
    return "Yesterday";
  } else {
    return pastDate.toLocaleDateString(); // Fallback to date string
  }
}
// Example usage
// const timeAgo = getTimeAgo("2023-10-01T12:00:00Z");  