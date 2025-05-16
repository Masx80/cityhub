import { Suspense } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2, Flag, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/page-transition";
import CustomVideoPlayer from "@/components/custom-video-player";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CommentsSection from "@/components/comments/comments-section";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { videos, users, categories, subscriptions } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { formatVideoForDisplay } from "@/lib/bunny-stream";
import { baseUrl } from "@/config";
import { Metadata } from "next";
import Script from 'next/script';
import {
  bunnyStreamUrl,
  bunnyVideoLibraryId,
  bunnyStreamKey
} from "@/config";

// Client components for interactive features
import ClientVideoActions from "./components/client-video-actions";

// Define the generateStaticParams function for SSG
export async function generateStaticParams() {
  try {
    // Fetch popular videos for pre-rendering (limit to 20 most recent)
    const popularVideos = await db
      .select({ id: videos.videoId })
      .from(videos)
      .where(
        eq(videos.status, "PUBLIC")
      )
      .orderBy(desc(videos.createdAt))
      .limit(20);

    return popularVideos.map(video => ({
      videoId: video.id,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    // If database fetch fails, fallback to a few known IDs
    return [
      { videoId: "video1" },
      { videoId: "video2" },
      { videoId: "video3" },
    ];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ videoId: string }> }): Promise<Metadata> {
  // Await the params Promise
  const resolvedParams = await params;
  const videoId = resolvedParams.videoId;
  
  const video = await getVideoData(videoId);
  
  if (!video) {
    return {
      title: "Video Not Found",
      description: "The requested video could not be found."
    };
  }
  
  return {
    title: `${video.title} | SexCity Hub`,
    description: video.description || `Watch ${video.title} on SexCity Hub`,
    keywords: `adult video, ${video.category?.name || 'xxx'}, ${video.dbData?.video.tags?.join(', ') || ''}`,
    openGraph: {
      title: video.title,
      description: video.description || `Watch ${video.title} on SexCity Hub`,
      type: 'video.other', 
      url: `https://sexcityhub.com/watch/${videoId}`,
      videos: [
        {
          url: `https://sexcityhub.com/watch/${videoId}`,
          type: 'video/mp4',
        }
      ],
      images: [{ 
        url: video.thumbnail || "/images/default-thumbnail.jpg",
        width: 1280,
        height: 720,
        alt: video.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description: video.description || `Watch ${video.title} on SexCity Hub`,
      images: [video.thumbnail || "/images/default-thumbnail.jpg"],
    },
    alternates: {
      canonical: `https://sexcityhub.com/watch/${videoId}`,
    }
  };
}

// Fetch video data function
async function getVideoData(videoId: string) {
  try {
    // Fetch from database directly
    const result = await db
      .select({
        video: videos,
        user: users,
        category: categories,
      })
      .from(videos)
      .where(eq(videos.videoId, videoId))
      .innerJoin(users, eq(videos.userId, users.clerkId))
      .leftJoin(categories, eq(videos.categoryId, categories.id))
      .limit(1);

    if (!result || result.length === 0) {
      // If not found in the database, try the API as fallback
      const apiUrl = new URL(`${baseUrl}/api/videos/${videoId}`, process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
      
      const response = await fetch(apiUrl.toString(), {
        next: { 
          revalidate: 3600 // ISR: Revalidate data every hour (3600 seconds)
        }
      });
        
        if (!response.ok) {
        return null;
        }
        
        const data = await response.json();
      return data.video;
    }
    
    // Get the video and user information
    const item = result[0];
    
    // Fetch subscriber count for this creator
    const [subscriptionResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.creatorId, item.user.clerkId));
    
    const subscriberCount = subscriptionResult?.count || 0;
    console.log(`[DEBUG] Channel ${item.user.channelHandle || item.user.clerkId} has ${subscriberCount} subscribers`);
    
    // Add subscriber count to user data
    const userData = {
      ...item.user,
      subscriberCount
    };
    
    // Try to fetch view count from Bunny CDN
    let viewsFromBunny = 0;
    let lengthFromBunny = 0;
    try {
      const bunnyVideoUrl = `${bunnyStreamUrl}/library/${bunnyVideoLibraryId}/videos/${item.video.videoId}`;
      const bunnyResponse = await fetch(bunnyVideoUrl, {
        headers: {
          'AccessKey': bunnyStreamKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (bunnyResponse.ok) {
        const bunnyData = await bunnyResponse.json();
        // Get the views and length from Bunny CDN
        if (bunnyData.views !== undefined) {
          viewsFromBunny = bunnyData.views;
          console.log(`[DEBUG] Got video views from Bunny CDN: ${viewsFromBunny}`);
        }
        
        if (bunnyData.length !== undefined) {
          lengthFromBunny = bunnyData.length;
          console.log(`[DEBUG] Got video length from Bunny CDN: ${lengthFromBunny}`);
        }
      }
    } catch (error) {
      console.error("Error fetching video data from Bunny CDN:", error);
    }
    
    // Combine the database video with the data from Bunny CDN
    const videoDataWithBunnyData = {
      ...item.video,
      views: viewsFromBunny, // Add the views from Bunny CDN
      length: lengthFromBunny // Add the length from Bunny CDN
    } as any; // Type assertion to avoid TypeScript errors
    
    // Format the video with user data
    const videoWithUser = formatVideoForDisplay(videoDataWithBunnyData, userData);
    
    // Log what we have to help debug
    console.log('[DEBUG] Channel data in videoWithUser:', videoWithUser.channel);
    
    // Add category information
    const finalResult = {
      ...videoWithUser,
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
      } : null,
      // Add the raw database record data to ensure we have all fields
      dbData: {
        video: item.video,
        user: item.user
      }
    };
    
    console.log('[DEBUG] Final video.channel.subscribers:', finalResult.channel?.subscribers);
    
    return finalResult;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

// Fetch video by ID
async function getVideo(videoId: string) {
  try {
    // Use baseUrl from config
    const url = `${baseUrl}/api/videos/${videoId}`;
    const response = await fetch(url, {
      next: { 
        revalidate: 60 // Revalidate every minute
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching video:", error);
    throw error;
  }
}

// Fetch recommended videos based on the current video's category and tags
async function getRecommendedVideos(videoId: string, categoryId?: string, tags?: string[]) {
  try {
    // Build the query to fetch related videos
    let query = db
      .select({
        video: videos,
        user: users,
        category: categories,
      })
      .from(videos)
      .where(
        eq(videos.status, "PUBLIC")
      )
      .innerJoin(users, eq(videos.userId, users.clerkId))
      .leftJoin(categories, eq(videos.categoryId, categories.id))
      .orderBy(desc(videos.createdAt))
      .limit(8);
    
    // If we have a category, prioritize videos from the same category
    if (categoryId) {
      query = db
        .select({
          video: videos,
          user: users,
          category: categories,
        })
        .from(videos)
        .where(
          eq(videos.status, "PUBLIC")
        )
        .innerJoin(users, eq(videos.userId, users.clerkId))
        .leftJoin(categories, eq(videos.categoryId, categories.id))
        .orderBy(desc(videos.createdAt))
        .limit(8);
    }
    
    const result = await query;
    
    // Get all unique creator IDs
    const creatorIds = [...new Set(result.map(item => item.user.clerkId))];
    
    // Fetch subscriber counts for all creators in a single query
    const subscriberCounts = await Promise.all(
      creatorIds.map(async (creatorId) => {
        const [result] = await db
          .select({ count: sql<number>`count(*)` })
          .from(subscriptions)
          .where(eq(subscriptions.creatorId, creatorId));
        return { creatorId, count: result?.count || 0 };
      })
    );
    
    // Create a map of creator ID to subscriber count
    const subscriberCountMap = new Map(
      subscriberCounts.map(item => [item.creatorId, item.count])
    );
    
    // Format the videos for display
    return result
      .filter(item => item.video.videoId !== videoId) // Filter out current video
      .map(item => {
        // Add subscriber count to user data
        const userData = {
          ...item.user,
          subscriberCount: subscriberCountMap.get(item.user.clerkId) || 0
        };
        
        const videoWithUser = formatVideoForDisplay(item.video, userData);
        return {
          ...videoWithUser,
          category: item.category ? {
            id: item.category.id,
            name: item.category.name,
          } : null
        };
      });
  } catch (error) {
    console.error("Error fetching recommended videos:", error);
    
    // Fallback to API if database query fails
    const apiUrl = `${baseUrl}/api/videos`;
    
    const response = await fetch(apiUrl, {
      next: { 
        revalidate: 3600 // ISR: Revalidate recommendations every hour
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    // Filter out the current video
    return data.videos.filter((v: any) => v.id !== videoId).slice(0, 5);
  }
}

// Record view
async function recordView(videoId: string) {
  try {
    // Use baseUrl from config
    const url = `${baseUrl}/api/videos/${videoId}/view`;
    
    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}

// Main page component
export default async function WatchPage({ params }: { params: Promise<{ videoId: string }> }) {
  // Await the params Promise
  const resolvedParams = await params;
  const videoId = resolvedParams.videoId;
  
  // Fetch video data server-side
  const video = await getVideoData(videoId);
  
  // If video doesn't exist, return 404
  if (!video) {
    notFound();
  }
  
  // Fetch recommended videos based on the current video's category
  const recommendedVideos = await getRecommendedVideos(videoId, video.category?.id, video.dbData?.video.tags);
  
  // Increment view count (in a real app, you would track unique views)
  try {
    // Using URL constructor to ensure a valid absolute URL
    const viewCountUrl = new URL(`${baseUrl}/api/videos/${videoId}/view`, process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    await fetch(viewCountUrl.toString(), { method: 'POST' });
    
    // Add to user's watch history if authenticated
    try {
      const { addToWatchHistory } = await import('@/actions/watch-history');
      await addToWatchHistory(videoId, "0", false); // Pass false to prevent revalidation during render
    } catch (error) {
      console.error("Failed to add to watch history:", error);
    }
  } catch (error) {
    console.error("Failed to increment view count:", error);
  }

  // Create structured data for video
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': video.title,
    'description': video.description || `Watch ${video.title} on SexCity Hub`,
    'thumbnailUrl': video.thumbnail || "/images/default-thumbnail.jpg",
    'uploadDate': video.dbData?.video.createdAt ? new Date(video.dbData.video.createdAt).toISOString() : new Date().toISOString(),
    'duration': video.length ? `PT${Math.floor(video.length / 60)}M${video.length % 60}S` : 'PT0M0S',
    'contentUrl': `https://sexcityhub.com/watch/${videoId}`,
    'embedUrl': `https://sexcityhub.com/watch/${videoId}`,
    'interactionStatistic': {
      '@type': 'InteractionCounter',
      'interactionType': 'https://schema.org/WatchAction',
      'userInteractionCount': video.views || 0
    },
    'author': {
      '@type': 'Person',
      'name': video.channel?.name || video.dbData?.user.name || 'Unknown User',
      'url': `https://sexcityhub.com/channel/${video.channel?.handle || video.dbData?.user.channelHandle || video.dbData?.user.id || 'unknown'}`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'SexCity Hub',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://sexcityhub.com/main-logo.svg',
        'width': 600,
        'height': 60
      }
    }
  };

  return (
    <PageTransition>
      {/* Add structured data for SEO */}
      <Script
        id="video-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="w-full max-w-none bg-background pb-24">
        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 lg:mx-6 xl:grid-cols-4">
          {/* Video player section - spans full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 xl:col-span-3">
            {/* Player container - YouTube uses black background with aspect ratio */}
            <div className="bg-black w-full">
              <div className="mx-auto max-w-[1280px] bg-black">
                <CustomVideoPlayer
                  src={video.id || videoId}
                  poster={video.thumbnail}
                  title={video.title}
                />
              </div>
            </div>

            {/* Video Info Section */}
            <div className="px-4 lg:px-0 max-w-[1280px] mx-auto mt-3">
              {/* Title */}
              <h1 className="text-xl font-semibold line-clamp-2 mb-1">{video.title}</h1>
              
              {/* Video stats and actions bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 mb-4">
                <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
                  {video.views || 0} views • {video.timestamp || `Published on ${new Date(video.dbData?.video.createdAt || Date.now()).toLocaleDateString()}`}
                </div>
                
                {/* Video action buttons - these are now handled by ClientVideoActions component */}
              </div>
              
              {/* Channel Info Section - similar to YouTube's layout */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 p-3 border-t border-b border-zinc-200 dark:border-zinc-800 bg-card/5 rounded-xl mt-1">
                {/* Channel info with avatar and name */}
                <div className="flex items-start gap-3">
                  <Link
                    href={`/channel/${video.channel?.handle || video.dbData?.user.channelHandle || video.dbData?.user.id || 'unknown'}`}
                    className="flex-shrink-0"
                  >
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      {video.channel?.avatar ? (
                        <AvatarImage src={video.channel.avatar} alt={video.channel.name} />
                      ) : (
                        <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          {(video.channel?.name || 'U').charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/channel/${video.channel?.handle || video.dbData?.user.channelHandle || video.dbData?.user.id || 'unknown'}`}
                      className="font-medium hover:text-primary transition-colors duration-200"
                    >
                      {video.channel?.name || video.dbData?.user.name || 'Unknown User'}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        console.log('[DEBUG] Rendering subscribers:', video.channel?.subscribers);
                        return `${video.channel?.subscribers ?? "0"} subscribers`;
                      })()}
                    </p>
                  </div>
                </div>

                {/* Client component for all video actions - now in a single line */}
                <div className="w-full sm:w-auto">
                  <ClientVideoActions 
                    videoId={video.id || videoId} 
                    videoTitle={video.title}
                    channelName={video.channel?.name || video.dbData?.user.name || 'Unknown User'}
                    creatorId={video.dbData?.user.clerkId || ''} 
                    channelHandle={video.channel?.handle || video.dbData?.user.channelHandle || video.dbData?.user.id}
                    initialLikes={video.likes || 0}
                  />
                </div>
              </div>
              
              {/* Description section - expandable like YouTube */}
              <div className="mt-4 bg-zinc-100/50 dark:bg-zinc-800/50 p-3 rounded-xl">
                <div className="whitespace-pre-wrap text-sm">{video.description}</div>
                {video.dbData?.video.tags && video.dbData.video.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {video.dbData.video.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        className="text-xs bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-blue-600 dark:text-blue-400"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Comments section - matches YouTube's layout */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Comments</h3>
                <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                  <CommentsSection videoId={video.id || videoId} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Recommended Videos Sidebar - right side on desktop */}
          <div className="lg:col-span-1 px-4 lg:px-0 mt-6 lg:mt-0">
            {recommendedVideos.length > 0 ? (
              <div className="space-y-3">
                {recommendedVideos.map((recVideo: any) => (
                  <Link
                    key={recVideo.id}
                    href={`/watch/${recVideo.id}`}
                    className="flex gap-2 group"
                  >
                    <div className="relative overflow-hidden rounded-lg flex-shrink-0 w-40 h-22">
                      <img
                        src={recVideo.thumbnail || "/images/default-thumbnail.jpg"}
                        alt={recVideo.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {recVideo.duration || "3:45"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {recVideo.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recVideo.channel?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recVideo.views || 0} views • {recVideo.timestamp || 'Recently'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recommended videos available</p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
