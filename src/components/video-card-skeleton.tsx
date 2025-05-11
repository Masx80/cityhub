import { Skeleton } from "@/components/ui/skeleton"

export default function VideoCardSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="relative">
        <Skeleton className="aspect-video w-full rounded-lg" />
        {/* Duration badge skeleton */}
        <Skeleton className="absolute bottom-2 right-2 h-5 w-12 rounded-md" />
      </div>
      
      <div className="pt-3 px-1 flex gap-3 flex-1">
        {/* Avatar skeleton */}
        <Skeleton className="h-9 w-9 rounded-full flex-shrink-0 mt-0.5" />
        
        {/* Content skeleton */}
        <div className="space-y-2 flex-1 min-w-0">
          {/* Title - two lines like in video card */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          
          {/* Channel name */}
          <Skeleton className="h-3.5 w-24 mt-1" />
          
          {/* Stats row - aligned with the video card */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
