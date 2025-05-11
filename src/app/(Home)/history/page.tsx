import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VideoCard from "@/components/video-card"
import { getWatchHistory, clearWatchHistory } from "@/actions/watch-history"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { History } from "lucide-react"

interface SearchParams {
  filter?: string;
}

export default async function HistoryPage({
  searchParams
}: {
  params: Promise<Record<string, unknown>>;
  searchParams: Promise<SearchParams>;
}) {
  // Await the searchParams Promise
  const params = await searchParams;
  
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  
  // Parse filter parameter
  const filter = params.filter as 'today' | 'yesterday' | 'week' | 'all' | undefined;
  const validFilters = ['today', 'yesterday', 'week', 'all'];
  const currentFilter = validFilters.includes(filter || '') ? filter : 'all';
  
  // Get filtered watch history
  const { videos } = await getWatchHistory(currentFilter);
  
  const handleClearHistory = async () => {
    "use server";
    await clearWatchHistory();
  };
  
  return (
    <div className="container py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Watch History</h1>
        <div className="flex items-center gap-2">
          <form action={handleClearHistory}>
            <Button variant="ghost" size="sm" type="submit">
              Clear all watch history
            </Button>
          </form>
        </div>
      </div>

      <Tabs defaultValue={currentFilter || "all"} className="mb-6">
        <TabsList>
          <TabsTrigger value="all" asChild>
            <a href="/history">All</a>
          </TabsTrigger>
          <TabsTrigger value="today" asChild>
            <a href="/history?filter=today">Today</a>
          </TabsTrigger>
          <TabsTrigger value="yesterday" asChild>
            <a href="/history?filter=yesterday">Yesterday</a>
          </TabsTrigger>
          <TabsTrigger value="week" asChild>
            <a href="/history?filter=week">This week</a>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video) => {
            // Parse progress percentage
            let progressPercentage = 0;
            try {
              progressPercentage = parseInt(video.progress, 10);
              if (progressPercentage > 100) {
                progressPercentage = 0;
              }
            } catch (e) {
              progressPercentage = 0;
            }
            
            return (
              <VideoCard 
                key={`${video.id}-${video.watchedAt?.getTime()}`} 
                id={video.id}
                title={video.title}
                thumbnail={video.thumbnail || "/placeholder.svg"}
                channel={{ 
                  name: video.channel?.name || "Unknown Channel", 
                  avatar: video.channel?.avatar,
                  handle: video.channel?.handle
                }}
                views={video.views?.toString() || "0"}
                timestamp={video.timestamp}
                duration={video.duration}
                progress={progressPercentage}
              />
            );
          })}
        </div>
      ) : (
        <EmptyPlaceholder
          icon={<History className="h-12 w-12 text-muted-foreground" />}
          title="No watch history"
          description={`You haven't watched any videos ${currentFilter !== 'all' ? `${currentFilter}` : ''}`}
        />
      )}
    </div>
  )
}
