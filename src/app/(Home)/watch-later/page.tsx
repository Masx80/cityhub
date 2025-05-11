"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import VideoCard from "@/components/video-card"
import VideoCardSkeleton from "@/components/video-card-skeleton"
import PageTransition from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getWatchLaterVideos, clearWatchLater } from "@/actions/watch-later"
import { useUser } from "@clerk/nextjs"
import { WatchLaterVideo } from "@/types"

export default function WatchLaterPage() {
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<WatchLaterVideo[]>([])
  const [clearingAll, setClearingAll] = useState(false)
  const { toast } = useToast()
  const { isSignedIn } = useUser()
  const router = useRouter()

  const fetchWatchLaterVideos = useCallback(async () => {
    setLoading(true)
    try {
      if (!isSignedIn) {
        // If not signed in, show empty state but don't show an error
        setVideos([])
        setLoading(false)
        return
      }

      const response = await getWatchLaterVideos()
      if (response.success) {
        setVideos(response.videos)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load Watch Later videos",
          variant: "destructive",
        })
        setVideos([])
      }
    } catch (error) {
      console.error("Error fetching watch later videos:", error)
      toast({
        title: "Error",
        description: "Failed to load Watch Later videos",
        variant: "destructive",
      })
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, toast])

  useEffect(() => {
    fetchWatchLaterVideos()
  }, [fetchWatchLaterVideos])

  const handleClearAll = async () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to clear your Watch Later list",
        variant: "destructive",
      })
      return
    }

    setClearingAll(true)
    try {
      const response = await clearWatchLater()
      if (response.success) {
        setVideos([])
        toast({
          title: "Watch Later cleared",
          description: "All videos have been removed from your Watch Later list",
        })
      } else {
        throw new Error(response.error || "Failed to clear Watch Later")
      }
    } catch (error) {
      console.error("Error clearing watch later:", error)
      toast({
        title: "Error",
        description: "Failed to clear Watch Later list",
        variant: "destructive",
      })
    } finally {
      setClearingAll(false)
    }
  }

  return (
    <PageTransition>
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <h1 className="text-2xl font-bold">Watch Later</h1>
          </div>
          {!loading && videos.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              disabled={clearingAll}
            >
              {clearingAll ? "Clearing..." : "Clear all"}
            </Button>
          )}
        </div>

        {!loading && videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Clock className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Your Watch Later list is empty</h2>
            <p className="text-muted-foreground mb-6">Save videos to watch later by clicking the clock icon</p>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              onClick={() => router.push("/")}
            >
              Browse videos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => <VideoCardSkeleton key={i} />)
              : videos.map((video) => {
                  // Ensure valid channel object for VideoCard
                  const channelName = video.channel?.name || "Unknown Channel";
                  
                  return (
                    <div key={video.id}>
                      <VideoCard 
                        id={video.videoId}
                        title={video.title}
                        thumbnail={video.thumbnail || "/placeholder.svg"}
                        channel={{
                          name: channelName,
                          avatar: video.channel?.avatar,
                          handle: video.channel?.handle
                        }}
                        views={typeof video.views === 'number' ? video.views.toString() : "0"} 
                        timestamp={video.timestamp}
                      />
                    </div>
                  );
                })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
