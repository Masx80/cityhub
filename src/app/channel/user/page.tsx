"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import PageTransition from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import VideoCard from "@/components/video-card";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import {
  Users,
  Bell,
  BellOff,
  Share2,
  Mail,
  MoreHorizontal,
  Play,
  Calendar,
  FileText,
  ThumbsUp,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Twitch,
  Link2,
  LinkIcon,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useRouter } from "next/navigation";

export default function ChannelPage() {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [metrics, setMetrics] = useState({
    subscribers: 128750,
    videos: 142,
    totalViews: 12460000,
  });
  const [userInfo, setUserInfo] = useState({
    name: "Sarah Johnson",
    handle: "@devinsights",
    bio: "Creating videos about web development, design patterns, and the latest tech trends. Join me to learn and grow as a developer!",
    joinDate: "Jan 15, 2022",
    location: "San Francisco, CA",
    links: [
      { platform: "twitter", url: "https://twitter.com/devinsights" },
      { platform: "github", url: "https://github.com/sarahjohnson" },
      { platform: "website", url: "https://dev-insights.com" },
    ],
  });
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading videos
    const timer = setTimeout(() => {
      setVideos([
        {
          id: "v1",
          title: "Next.js Server Components: Complete Guide",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          channel: { name: "Dev Insights" },
          views: "120K",
          timestamp: "2 days ago",
        },
        {
          id: "v2",
          title: "Web Development Future 2025: Trends to Watch",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          channel: { name: "Dev Insights" },
          views: "85K",
          timestamp: "1 week ago",
        },
        {
          id: "v3",
          title: "Advanced CSS Techniques for Modern UIs",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          channel: { name: "Dev Insights" },
          views: "42K",
          timestamp: "3 days ago",
        },
        {
          id: "v4",
          title: "Building a Full Stack App with Node.js",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          channel: { name: "Dev Insights" },
          views: "67K",
          timestamp: "5 days ago",
        },
        {
          id: "v5",
          title: "React Hooks: Beyond the Basics",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          channel: { name: "Dev Insights" },
          views: "98K",
          timestamp: "2 weeks ago",
        },
        {
          id: "v6",
          title: "TypeScript for JavaScript Developers",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          channel: { name: "Dev Insights" },
          views: "56K",
          timestamp: "3 weeks ago",
        },
        {
          id: "v7",
          title: "Building a Design System from Scratch",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          channel: { name: "Dev Insights" },
          views: "73K",
          timestamp: "1 month ago",
        },
        {
          id: "v8",
          title: "The Future of Web Animation",
          thumbnail: "/placeholder.svg?height=720&width=1280",
          channel: { name: "Dev Insights" },
          views: "45K",
          timestamp: "2 months ago",
        },
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  const toggleSubscription = () => {
    setIsSubscribed(!isSubscribed);
    if (!isSubscribed) {
      setNotificationEnabled(true);
    }
  };

  const toggleNotification = () => {
    setNotificationEnabled(!notificationEnabled);
  };

  return (
    <PageTransition>
      <div className="relative">
        {/* Channel Banner */}
        <div className="w-full h-48 md:h-60 lg:h-80 relative bg-gradient-to-r from-orange-500/80 to-amber-500/80 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white z-10"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </div>

        <div className="container max-w-6xl">
          {/* Profile Section */}
          <div className="relative -mt-16 px-4 md:px-0">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-8">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src="/placeholder.svg" alt={userInfo.name} />
                <AvatarFallback className="text-4xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  {userInfo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 mt-2 md:mt-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{userInfo.name}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-muted-foreground">
                      <span>{userInfo.handle}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatNumber(metrics.subscribers)} subscribers</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{metrics.videos} videos</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button
                      variant={isSubscribed ? "outline" : "default"}
                      className={
                        isSubscribed
                          ? "gap-2"
                          : "gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      }
                      onClick={toggleSubscription}
                    >
                      {isSubscribed ? (
                        <>
                          <Users className="h-4 w-4" />
                          Subscribed
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          Subscribe
                        </>
                      )}
                    </Button>

                    {isSubscribed && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleNotification}
                        className={notificationEnabled ? "text-orange-500" : ""}
                      >
                        {notificationEnabled ? (
                          <Bell className="h-4 w-4" />
                        ) : (
                          <BellOff className="h-4 w-4" />
                        )}
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer flex items-center">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share channel
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Contact
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Report channel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
                  {userInfo.bio}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    Joined {userInfo.joinDate}
                  </div>
                  
                  <div className="flex items-center">
                    <Play className="h-4 w-4 mr-1.5" />
                    {formatNumber(metrics.totalViews)} total views
                  </div>

                  {userInfo.location && (
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1.5" />
                      {userInfo.location}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {userInfo.links.map((link, index) => (
                    <HoverCard key={index}>
                      <HoverCardTrigger asChild>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {link.platform === "twitter" && (
                            <Twitter className="h-5 w-5" />
                          )}
                          {link.platform === "github" && (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-5 w-5 fill-current"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          )}
                          {link.platform === "website" && (
                            <Link2 className="h-5 w-5" />
                          )}
                        </a>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-52">
                        <div className="flex flex-col space-y-1">
                          <h4 className="text-sm font-semibold">
                            {link.platform.charAt(0).toUpperCase() +
                              link.platform.slice(1)}
                          </h4>
                          <p className="text-xs">{link.url}</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="mt-8">
            <Tabs
              defaultValue="videos"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full flex justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8 space-x-8 overflow-x-auto">
                <TabsTrigger
                  value="videos"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent py-3 px-1 text-sm font-medium data-[state=active]:shadow-none"
                >
                  Videos
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent py-3 px-1 text-sm font-medium data-[state=active]:shadow-none"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="playlists"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent py-3 px-1 text-sm font-medium data-[state=active]:shadow-none"
                >
                  Playlists
                </TabsTrigger>
                <TabsTrigger
                  value="community"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent py-3 px-1 text-sm font-medium data-[state=active]:shadow-none"
                >
                  Community
                </TabsTrigger>
                <TabsTrigger
                  value="channels"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent py-3 px-1 text-sm font-medium data-[state=active]:shadow-none"
                >
                  Channels
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos" className="px-4 md:px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {loading
                    ? Array(8)
                        .fill(0)
                        .map((_, i) => <VideoCardSkeleton key={i} />)
                    : videos.map((video) => (
                        <VideoCard key={video.id} {...video} />
                      ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="px-4 md:px-0">
                <div className="max-w-3xl space-y-8">
                  <div>
                    <h2 className="text-xl font-bold mb-4">Description</h2>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {userInfo.bio}
                      {"\n\n"}
                      I post new coding tutorials every Tuesday and Thursday at 9AM PST.
                      {"\n\n"}
                      📫 Business inquiries: contact@dev-insights.com
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-4">Details</h2>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-32 text-muted-foreground">Location:</span>
                        <span>{userInfo.location}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-muted-foreground">Joined:</span>
                        <span>{userInfo.joinDate}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 text-muted-foreground">Total views:</span>
                        <span>{formatNumber(metrics.totalViews)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold mb-4">Links</h2>
                    <div className="flex flex-wrap gap-4">
                      {userInfo.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 rounded-full bg-accent hover:bg-accent/80 text-sm"
                        >
                          {link.platform === "twitter" && (
                            <Twitter className="h-4 w-4 mr-2" />
                          )}
                          {link.platform === "github" && (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 mr-2 fill-current"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                          )}
                          {link.platform === "website" && (
                            <Link2 className="h-4 w-4 mr-2" />
                          )}
                          {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="playlists" className="px-4 md:px-0">
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No playlists yet</h3>
                  <p className="text-muted-foreground">
                    This channel hasn't created any playlists yet.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="community" className="px-4 md:px-0">
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No community posts yet</h3>
                  <p className="text-muted-foreground">
                    This channel hasn't shared any community posts yet.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="channels" className="px-4 md:px-0">
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Youtube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No channels yet</h3>
                  <p className="text-muted-foreground">
                    This channel doesn't have any featured channels.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageTransition>
  );
} 