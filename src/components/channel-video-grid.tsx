"use client";

import { useState, useEffect, useCallback } from "react";
import VideoCard from "@/components/video-card";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: {
    name: string;
    avatar?: string;
    handle: string;
  };
  views: string;
  timestamp: string;
  isOwner?: boolean;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalVideos: number;
  hasMore: boolean;
}

interface ChannelVideoGridProps {
  channelId: string;
  isOwner?: boolean;
}

export default function ChannelVideoGrid({ channelId, isOwner = false }: ChannelVideoGridProps) {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0,
    hasMore: false
  });

  // Fetch channel videos
  const fetchChannelVideos = useCallback(async (page: number) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/channel/${channelId}/videos?page=${page}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch channel videos");
      }
      
      const data = await response.json();
      console.log(`Received channel videos for ${channelId}, isOwner from parent: ${isOwner}`);
      
      // Preserve the isOwner flag from the API response, 
      // but use the prop as fallback if not present in video objects
      const processedVideos = data.videos.map((video: Video) => ({
        ...video,
        isOwner: video.isOwner !== undefined ? video.isOwner : isOwner
      }));
      
      setVideos(processedVideos);
      setPaginationData(data.pagination);
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      toast.error("Failed to load videos for this channel");
    } finally {
      setLoading(false);
    }
  }, [channelId, isOwner]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > paginationData.totalPages) return;
    
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchChannelVideos(page);
  };

  // Fetch videos on mount and when channelId changes
  useEffect(() => {
    if (channelId) {
      fetchChannelVideos(1);
    }
  }, [channelId, fetchChannelVideos]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2">
        {Array(8).fill(0).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/10 rounded-lg">
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
            <path d="m15 5 4 4"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">No videos yet</h3>
        <p className="text-muted-foreground text-center max-w-md mb-2">
          This channel hasn't uploaded any videos yet. When they do, you'll see them here.
        </p>
        <p className="text-sm text-muted-foreground">
          Subscribe to get notified when new videos are uploaded.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2">
        {videos.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
      
      {paginationData.totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: paginationData.totalPages }).map((_, i) => {
                const page = i + 1;
                
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 || 
                  page === paginationData.totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis for breaks in sequence
                if (
                  (page === 2 && currentPage > 3) || 
                  (page === paginationData.totalPages - 1 && currentPage < paginationData.totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === paginationData.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
} 