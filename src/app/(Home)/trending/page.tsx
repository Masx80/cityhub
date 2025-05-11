import { Suspense } from "react";
import { Flame, Search } from "lucide-react";
import VideoCard from "@/components/video-card";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import PageTransition from "@/components/page-transition";
import { baseUrl } from "@/config";

// Add metadata for SEO
export async function generateMetadata() {
  return {
    title: "Trending Videos - SexCity Hub",
    description: "Discover what's trending right now. Watch the most popular videos on the platform.",
    openGraph: {
      title: "Trending Videos - SexCity Hub",
      description: "Discover what's trending right now. Watch the most popular videos on the platform.",
      type: 'website',
    },
  };
}

// Define the video type
interface TrendingVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel: { 
    name: string;
    avatar?: string;
    handle?: string;
  };
  views: string;
  timestamp: string;
  duration: string;
}

// Fetch trending videos
async function getTrendingVideos(searchQuery?: string) {
  try {
    const res = await fetch(`${baseUrl}/api/trending?q=${searchQuery || ''}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch trending: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching trending:", error);
    return { videos: [] };
  }
}

// TrendingResults component for loading state isolation
async function TrendingResults({ searchQuery }: { searchQuery?: string }) {
  let videos: TrendingVideo[] = [];
  
  try {
    // Get trending videos data
    const { videos: trendingVideos } = await getTrendingVideos(searchQuery);
    videos = trendingVideos;
    
    if (!videos || videos.length === 0) {
      // Empty videos array will trigger the no videos found UI below
      videos = [];
    }
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    videos = []; // Empty array on error
  }
  
  if (videos.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white">
          {searchQuery ? <Search className="h-12 w-12" /> : <Flame className="h-12 w-12" />}
        </div>
        <h3 className="text-xl font-bold mb-2">
          {searchQuery ? "No search results found" : "No trending videos"}
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {searchQuery
            ? `We couldn't find any videos matching "${searchQuery}". Try a different search term.`
            : "We're still gathering data on what's trending right now. Check back soon to see what videos are catching everyone's attention!"}
        </p>
        <a 
          href="/"
          className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
        >
          Explore other videos
        </a>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {videos.map((video) => (
        <VideoCard 
          key={video.id} 
          id={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          channel={video.channel}
          views={video.views}
          timestamp={video.timestamp}
          duration={video.duration}
        />
      ))}
    </div>
  );
}

interface SearchParamsData {
  q?: string;
}

export default async function TrendingPage({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParamsData>
}) {
  // Await the searchParams Promise
  const params = await searchParams;
  
  // Access properties from the resolved Promise
  const searchQuery = params.q;
  
  return (
    <PageTransition>
      <div className="container py-6 md:py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          {searchQuery ? (
            <>
              <Search className="h-5 w-5 mr-2" />
              Search Results
            </>
          ) : (
            <>
              <Flame className="h-5 w-5 mr-2" />
              Trending
            </>
          )}
        </h1>
        
        {searchQuery && (
          <p className="mb-4 text-muted-foreground">
            Results for "{searchQuery}"
          </p>
        )}
        
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(6).fill(0).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        }>
          <TrendingResults searchQuery={searchQuery} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
