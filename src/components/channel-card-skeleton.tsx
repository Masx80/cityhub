import { Skeleton } from "@/components/ui/skeleton"

export default function ChannelCardSkeleton() {
  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-card border border-border">
      <Skeleton className="h-20 w-20 rounded-full mb-3" />
      <Skeleton className="h-5 w-24 mb-2" />
      <Skeleton className="h-3 w-32 mb-3" />
      <Skeleton className="h-8 w-24" />
    </div>
  )
}
