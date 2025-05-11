// Global type definitions

// Video interface
interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  views?: number;
  likes?: number;
  dislikes?: number;
  duration?: number;
  createdAt?: string;
  channel?: {
    id?: string;
    name: string;
    handle?: string;
    avatar?: string;
    subscribers?: number;
  };
}

// Comment interface
interface Comment {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
    image?: string;
    avatar?: string;  // For backward compatibility
  };
  likes: number;
  time?: string;     // For some components
  timestamp?: string; // For other components
  replies?: Comment[];
}

// Channel interface
interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner?: string;
  subscribers: number;
  verified?: boolean;
  description?: string;
}

export type { Video, Comment, Channel }; 