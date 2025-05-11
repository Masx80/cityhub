import { Clock, Search } from "lucide-react";
import { Metadata } from "next";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import VideoCard from "@/components/video-card";
import { SortTabs, LoadMoreButton, LoadingProvider, LoadingStateTracker } from "./client";
import LatestVideosContent from "./content";

export const metadata: Metadata = {
  title: "Latest Adult Videos | SexCity Hub",
  description: "Browse the newest adult videos uploaded to SexCity Hub. Fresh XXX content updated daily with high-quality adult videos.",
  keywords: "latest adult videos, new porn videos, fresh XXX content, recent adult uploads, new adult content",
  openGraph: {
    title: "Latest Adult Videos | SexCity Hub",
    description: "Browse the newest adult videos uploaded to SexCity Hub. Fresh content updated daily.",
    type: 'website',
    url: 'https://sexcityhub.com/latest',
    images: [
      {
        url: '/latest-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Latest adult videos on SexCity Hub',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest Adult Videos | SexCity Hub',
    description: 'Browse the newest adult videos uploaded to SexCity Hub. Fresh content updated daily.',
    images: ['/latest-banner.jpg'],
  },
  alternates: {
    canonical: 'https://sexcityhub.com/latest',
  }
};

// Define interfaces for better type safety
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
  [key: string]: any;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalVideos: number;
  hasMore: boolean;
}

interface SearchParamsData {
  q?: string;
  sort?: string;
  page?: string;
}

export default async function LatestVideosPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsData>
}) {
  // Await the searchParams Promise
  const params = await searchParams;
  
  // Now access properties from the resolved Promise
  const searchQuery = params.q || '';
  const sortOrder = params.sort || 'newest';
  const pageStr = params.page || '1';
  const page = parseInt(pageStr, 10);
  
  // Server-side data fetching
  const data = await fetchVideos(searchQuery, sortOrder, page);
  
  return (
    <LoadingProvider>
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            {searchQuery ? (
              <>
                <Search className="h-5 w-5 mr-2" />
                Search Results
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 mr-2" />
                Latest Videos
              </>
            )}
          </h1>
          
          <SortTabs defaultSort={sortOrder} />
          <LoadingStateTracker />
        </div>

        {searchQuery && (
          <p className="mb-4 text-muted-foreground">
            {data.pagination.totalVideos} results for "{searchQuery}"
          </p>
        )}

        <LatestVideosContent videos={data.videos} pagination={data.pagination} />
      </div>
    </LoadingProvider>
  );
}

// Server-side data fetching function
async function fetchVideos(searchQuery: string, sortOrder: string, page: number = 1): Promise<{
  videos: Video[];
  pagination: Pagination;
}> {
  // Build API URL for server-side fetch
  let url = `${process.env.APP_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/videos?page=${page}`;
  
  // Add search query if provided
  if (searchQuery) {
    url += `&q=${encodeURIComponent(searchQuery)}`;
  }
  
  // Fetch videos from API
  const response = await fetch(url, { cache: 'no-store' });
  
  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }
  
  const data = await response.json();
  
  // If sorting by oldest, reverse the order since the API sorts by newest
  const videos = sortOrder === "oldest" 
    ? [...data.videos].reverse() 
    : data.videos;
  
  // Process videos to match VideoCardProps structure
  const processedVideos = videos.map((video: any) => ({
    ...video,
    views: String(video.views), // Convert to string
    duration: video.duration ? String(video.duration) : undefined, // Convert to string if exists
    timestamp: video.timestamp || video.createdAt || new Date().toISOString(),
  }));
  
  return {
    videos: processedVideos,
    pagination: data.pagination
  };
} 