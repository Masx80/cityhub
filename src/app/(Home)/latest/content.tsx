"use client";

import React, { useEffect, useState } from "react";
import VideoCard from "@/components/video-card";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import { Clock, Search } from "lucide-react";
import { useLoading, LoadMoreButton } from "./client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: {
    name: string;
    avatar?: string;
    handle?: string;
  };
  views: string;
  createdAt: string;
  duration?: string;
  timestamp: string;
  isOwner?: boolean;
  [key: string]: unknown;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalVideos: number;
  hasMore: boolean;
}

interface LatestVideosContentProps {
  videos: Video[];
  pagination: Pagination;
}

export default function LatestVideosContent({ videos, pagination }: LatestVideosContentProps) {
  const { isLoading } = useLoading();
  const [showSkeletons, setShowSkeletons] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || "";
  
  // Show skeletons when loading state changes
  useEffect(() => {
    if (isLoading) {
      setShowSkeletons(true);
    } else {
      // Add a short delay before hiding skeletons to prevent flashing
      const timer = setTimeout(() => {
        setShowSkeletons(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // If we're loading, show skeletons
  if (showSkeletons) {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      </>
    );
  }
  
  // If we have no videos
  if (videos.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white">
            {searchQuery ? <Search className="h-12 w-12" /> : <Clock className="h-12 w-12" />}
          </div>
          <h3 className="text-xl font-bold mb-2">
            {searchQuery ? "No search results found" : "No latest videos"}
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {searchQuery
              ? `We couldn't find any videos matching "${searchQuery}". Try a different search term.`
              : "It looks like there aren't any new videos at the moment. Check back soon as content creators are always uploading new videos!"}
          </p>
          <Link 
            href="/"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
          >
            Go to home page
          </Link>
        </div>
      </div>
    );
  }
  
  // Otherwise, show videos and load more button
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
      
      {pagination.hasMore && videos.length > 0 && (
        <div className="mt-8 flex justify-center">
          <LoadMoreButton currentPage={pagination.currentPage} />
        </div>
      )}
    </>
  );
} 