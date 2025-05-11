// Watch Later video type extending the base video type
export interface WatchLaterVideo {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  likes?: number;
  channel?: {
    id?: string;
    name?: string;
    handle?: string;
    avatar?: string;
    subscribers?: number;
  };
  addedAt: Date;
  timestamp: string;
} 