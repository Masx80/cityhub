// Bunny Stream client for fetching video data

// Environment variables for Bunny Stream CDN
const BUNNY_PULL_ZONE_URL = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL || 'vz-7503b6d0-a19.b-cdn.net';
const BUNNY_PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE || 'vz-7503b6d0-a19';
const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || '';
const BUNNY_API_KEY = process.env.BUNNY_STREAM_KEY || '';
const BUNNY_STREAM_URL = process.env.BUNNY_STREAM_URL || 'https://video.bunnycdn.com';

// Helper function to format view count 
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return count.toString();
  }
}

// Format Unix timestamp or ISO date string to relative time
export function formatTimestamp(timestamp: string | number | Date): string {
  if (!timestamp) return 'Recently';
  
  let date: Date;
  
  // Handle unix timestamp (in seconds)
  if (typeof timestamp === 'number') {
    // If it's a small number (likely seconds not ms), convert to ms
    if (timestamp < 10000000000) {
      date = new Date(timestamp * 1000);
    } else {
      date = new Date(timestamp);
    }
  } else if (typeof timestamp === 'string') {
    // Handle ISO string
    date = new Date(timestamp);
  } else {
    // Already a Date object
    date = timestamp;
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Recently';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a month
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

// Generate video thumbnail URL from Bunny CDN
export function getVideoThumbnailUrl(videoId: string, customThumbnail?: string): string {
  if (customThumbnail) {
    return customThumbnail;
  }
  // Return the default generated thumbnail from Bunny
  return `https://${BUNNY_PULL_ZONE_URL}/${videoId}/thumbnail.jpg`;
}

// Format a video for display
export function formatVideoForDisplay(video: any, userData: any) {
  // Format duration to MM:SS
  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Debug log to see what data we have
  console.log('[DEBUG] formatVideoForDisplay userData:', {
    clerkId: userData?.clerkId,
    channelHandle: userData?.channelHandle,
    subscriberCount: userData?.subscriberCount
  });

  // Properly handle view count - check both DB video.views and Bunny CDN 'views' field
  let viewCount = 0;
  
  // If there's a views field directly in the Bunny response, use it
  if (video.views !== undefined) {
    viewCount = typeof video.views === 'number' ? video.views : parseInt(video.views) || 0;
  }
  
  // Properly handle video duration/length from Bunny CDN
  let videoDuration = 0;
  
  // Check for length field (Bunny CDN provides this)
  if (video.length !== undefined && video.length !== null) {
    videoDuration = typeof video.length === 'number' ? video.length : parseInt(video.length) || 0;
  } 
  // Fallback to duration field if present
  else if (video.duration !== undefined && video.duration !== null) {
    videoDuration = typeof video.duration === 'number' ? video.duration : parseInt(video.duration) || 0;
  }
  
  console.log('[DEBUG] Video duration/length:', videoDuration);

  const result = {
    id: video.videoId,
    title: video.title,
    thumbnail: getVideoThumbnailUrl(video.videoId, video.thumbnail),
    channel: {
      name: userData?.channelName || 'Unknown Channel',
      avatar: userData?.channelAvatarUrl 
        ? (userData.channelAvatarUrl.startsWith('https://') 
            ? userData.channelAvatarUrl 
            : `https://sexcityhub.b-cdn.net/${userData.channelAvatarUrl}`)
        : userData?.imageUrl
          ? (userData.imageUrl.startsWith('https://') 
              ? userData.imageUrl 
              : `https://sexcityhub.b-cdn.net/${userData.imageUrl}`)
          : "/avatars/default.jpg",
      handle: userData?.channelHandle?.replace(/^@/, '') || 'unknown',
      subscribers: userData?.subscriberCount || 0
    },
    views: formatViewCount(viewCount),
    timestamp: formatTimestamp(video.createdAt),
    description: video.description || '',
    duration: formatDuration(videoDuration),
  };

  // Log the result to verify
  console.log('[DEBUG] formatVideoForDisplay result channel:', result.channel);
  console.log('[DEBUG] formatVideoForDisplay view count:', viewCount, 'formatted as:', result.views);
  console.log('[DEBUG] formatVideoForDisplay duration:', videoDuration, 'formatted as:', result.duration);

  return result;
} 