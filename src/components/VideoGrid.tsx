"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ensureValidImageUrl } from "@/lib/utils/image";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  createdAt: Date;
  duration: string;
  channel: {
    id: string;
    name: string;
    avatar: string;
    handle?: string;
  };
}

// Mock video data
const mockVideos: Video[] = [
  {
    id: "video-1",
    title: "10 Essential UI Design Principles Everyone Should Know",
    thumbnail: "/thumbnails/design-principles.jpg",
    views: 256000,
    createdAt: new Date(2023, 6, 15),
    duration: "18:42",
    channel: {
      id: "design-hub",
      name: "Design Hub",
      avatar: "/avatars/design-hub.jpg"
    }
  },
  {
    id: "video-2",
    title: "How to Create Stunning Motion Graphics in After Effects",
    thumbnail: "/thumbnails/motion-graphics.jpg",
    views: 124000,
    createdAt: new Date(2023, 7, 2),
    duration: "24:18",
    channel: {
      id: "design-hub",
      name: "Design Hub",
      avatar: "/avatars/design-hub.jpg"
    }
  },
  {
    id: "video-3",
    title: "Beginner's Guide to Typography in Design",
    thumbnail: "/thumbnails/typography.jpg",
    views: 98500,
    createdAt: new Date(2023, 7, 25),
    duration: "15:20",
    channel: {
      id: "design-hub",
      name: "Design Hub",
      avatar: "/avatars/design-hub.jpg"
    }
  },
  {
    id: "video-4",
    title: "The Future of Web Design Trends for 2024",
    thumbnail: "/thumbnails/web-design-trends.jpg",
    views: 187000,
    createdAt: new Date(2023, 8, 10),
    duration: "21:35",
    channel: {
      id: "design-hub",
      name: "Design Hub",
      avatar: "/avatars/design-hub.jpg"
    }
  },
  {
    id: "video-5",
    title: "Color Theory Masterclass for Designers",
    thumbnail: "/thumbnails/color-theory.jpg",
    views: 142000,
    createdAt: new Date(2023, 9, 5),
    duration: "32:15",
    channel: {
      id: "design-hub",
      name: "Design Hub",
      avatar: "/avatars/design-hub.jpg"
    }
  },
  {
    id: "video-6",
    title: "How to Design Effective Landing Pages",
    thumbnail: "/thumbnails/landing-pages.jpg",
    views: 76800,
    createdAt: new Date(2023, 9, 28),
    duration: "19:50",
    channel: {
      id: "design-hub",
      name: "Design Hub",
      avatar: "/avatars/design-hub.jpg"
    }
  }
];

// Format view count
function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
}

export default function MockVideoGrid() {
  const router = useRouter();
  
  const handleVideoClick = (videoId: string) => {
    router.push(`/watch/${videoId}`);
  };
  
  const handleChannelClick = (event: React.MouseEvent, channel: { id: string; name: string; handle?: string }) => {
    event.stopPropagation(); // Prevent video click
    const channelPath = channel.handle || channel.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/channel/${channelPath}`);
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mockVideos.map((video) => (
        <div 
          key={video.id}
          className="cursor-pointer group"
          onClick={() => handleVideoClick(video.id)}
        >
          {/* Thumbnail with duration */}
          <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
              {video.duration}
            </div>
          </div>
          
          {/* Video info */}
          <div className="flex gap-3">
            <div 
              className="flex-shrink-0 mt-1"
              onClick={(e) => handleChannelClick(e, video.channel)}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={ensureValidImageUrl(video.channel.avatar)} alt={video.channel.name} />
                <AvatarFallback>{video.channel.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
              <p 
                className="text-xs text-muted-foreground mt-1 hover:text-foreground"
                onClick={(e) => handleChannelClick(e, video.channel)}
              >
                {video.channel.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatViews(video.views)} • {formatDistanceToNow(video.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 