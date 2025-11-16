/**
 * Format blockchain timestamp to readable date
 * Blockchain timestamps are in seconds, JS Date uses milliseconds
 */
export function formatDate(timestamp) {
  if (!timestamp || timestamp === 0 || timestamp === '0') {
    return 'Pending...';
  }
  
  const timestampNum = Number(timestamp);
  
  // If timestamp is 0, return pending
  if (timestampNum === 0) {
    return 'Pending...';
  }
  
  // Convert from seconds to milliseconds
  const date = new Date(timestampNum * 1000);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(timestamp) {
  if (!timestamp || timestamp === 0 || timestamp === '0') {
    return '--:--';
  }
  
  const timestampNum = Number(timestamp);
  
  if (timestampNum === 0) {
    return '--:--';
  }
  
  const date = new Date(timestampNum * 1000);
  
  if (isNaN(date.getTime())) {
    return '--:--';
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTime(timestamp) {
  if (!timestamp || timestamp === 0 || timestamp === '0') {
    return 'Pending...';
  }
  
  const timestampNum = Number(timestamp);
  
  if (timestampNum === 0) {
    return 'Pending...';
  }
  
  const date = new Date(timestampNum * 1000);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTimeAgo(timestamp) {
  if (!timestamp || timestamp === 0 || timestamp === '0') {
    return 'Just now';
  }
  
  const timestampNum = Number(timestamp);
  
  if (timestampNum === 0) {
    return 'Just now';
  }
  
  const date = new Date(timestampNum * 1000);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(timestamp);
}

