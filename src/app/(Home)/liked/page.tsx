"use client"

import { useState, useEffect } from "react"
import VideoCard from "@/components/video-card"
import VideoCardSkeleton from "@/components/video-card-skeleton"
import PageTransition from "@/components/page-transition"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { getUserLikedVideos, clearAllLikedVideos } from "@/actions/likes"
import { toast } from "sonner"

// Define the structure of a video object
interface Video {
  id: string
  title: string
  thumbnail: string
  channel: {
    name: string
    avatar?: string
    handle?: string
  }
  views: string
  timestamp: string
  description?: string
  duration?: string
}

// Define the structure of pagination data
interface PaginationData {
  currentPage: number
  totalPages: number
  totalVideos: number
  hasMore: boolean
}

// Define the structure of the API response
interface LikedVideosResponse {
  success: boolean
  videos?: Video[]
  pagination?: PaginationData
  error?: string
  status?: number
}

export default function LikedVideosPage() {
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [videos, setVideos] = useState<Video[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0,
    hasMore: false
  })
  const router = useRouter()

  useEffect(() => {
    fetchLikedVideos()
  }, [])

  const fetchLikedVideos = async (page = 1) => {
    setLoading(true)
    try {
      const response: LikedVideosResponse = await getUserLikedVideos(page)
      
      if (response.success) {
        // Ensure we have videos and pagination
        const newVideos = response.videos || [];
        const newPagination = response.pagination || {
          currentPage: page,
          totalPages: 1,
          totalVideos: 0,
          hasMore: false
        };
        
        if (page > 1) {
          // Append new videos for "load more" functionality
          setVideos(currentVideos => [...currentVideos, ...newVideos])
        } else {
          // Replace videos when loading the first page
          setVideos(newVideos)
        }
        setPagination(newPagination)
      } else {
        console.error("Error fetching liked videos:", response.error)
        toast.error("Failed to load liked videos")
      }
    } catch (error) {
      console.error("Error fetching liked videos:", error)
      toast.error("Failed to load liked videos")
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (pagination.hasMore) {
      fetchLikedVideos(pagination.currentPage + 1)
    }
  }

  const handleClearAll = async () => {
    if (clearing) return
    
    setClearing(true)
    try {
      const response = await clearAllLikedVideos()
      
      if (response.success) {
        setVideos([])
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalVideos: 0,
          hasMore: false
        })
        toast.success("All liked videos have been cleared")
      } else {
        console.error("Error clearing liked videos:", response.error)
        toast.error("Failed to clear liked videos")
      }
    } catch (error) {
      console.error("Error clearing liked videos:", error)
      toast.error("Failed to clear liked videos")
    } finally {
      setClearing(false)
    }
  }

  const handleBrowseVideos = () => {
    router.push('/')
  }

  return (
    <PageTransition>
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-orange-500 fill-orange-500" />
            <h1 className="text-2xl font-bold">Liked Videos</h1>
            {!loading && pagination.totalVideos > 0 && (
              <span className="text-muted-foreground ml-2">
                {pagination.totalVideos} {pagination.totalVideos === 1 ? 'video' : 'videos'}
              </span>
            )}
          </div>
          {!loading && videos.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearAll}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear all"}
            </Button>
          )}
        </div>

        {!loading && videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No liked videos yet</h2>
            <p className="text-muted-foreground mb-6">Videos you like will appear here</p>
            <Button 
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              onClick={handleBrowseVideos}
            >
              Browse videos
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {loading
                ? Array(8)
                    .fill(0)
                    .map((_, i) => <VideoCardSkeleton key={i} />)
                : videos.map((video) => <VideoCard key={video.id} {...video} />)}
            </div>
            
            {pagination.hasMore && !loading && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
