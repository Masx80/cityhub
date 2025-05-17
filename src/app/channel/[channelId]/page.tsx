import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Calendar, Mail, MapPin, Upload, 
  Plus, Video, Share2, Bell, BellOff, CheckCircle, 
  Play, Eye, Users, Heart, Award, ExternalLink, 
  Edit, PenTool
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ChannelVideoGrid from "@/components/channel-video-grid";
import DebugReloadButton from "@/components/debug-reload-button";
import { baseUrl } from "@/config";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import ChannelHeader from "./components/channel-header";

// Format numbers with K and M for thousands and millions
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Ensure URLs are properly formatted
function ensureValidImageUrl(url: string): string {
  if (!url) return '';
  
  // If it already has https://, it should be ok
  if (url.startsWith('https://') || url.startsWith('http://')) {
    // But check for the common mistake where domain and path are joined without a slash
    const domainMatch = url.match(/https:\/\/sexcityhub\.b-cdn\.net([^\/])/);
    if (domainMatch) {
      return url.replace(/sexcityhub\.b-cdn\.net/, 'sexcityhub.b-cdn.net/');
    }
    return url;
  }
  
  // If it starts with a slash, it's a local file
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, add the domain
  return `https://sexcityhub.b-cdn.net/${url}`;
}

// Define Channel interface
interface Channel {
  id: string;
  name: string;
  handle: string;
  subscribers: number;
  views: number;
  joinDate: string;
  avatar: string;
  banner: string;
  description: string;
  isOwner: boolean;
  hasVideos: boolean;
  [key: string]: any; // For any additional properties
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ channelId: string }> }): Promise<Metadata> {
  // Await the params Promise
  const resolvedParams = await params;
  const channelId = resolvedParams.channelId;
  
  try {
    // Use the baseUrl from config with cache busting
    const response = await fetch(`${baseUrl}/api/channel/${channelId}?t=${Date.now()}`, {
      next: { revalidate: 0 },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return {
        title: "Channel Not Found",
        description: "The requested channel could not be found."
      };
    }
    
    const channel = await response.json();
    
    return {
      title: `${channel.name} - SexCity Hub`,
      description: channel.description || `Check out ${channel.name}'s videos and content`,
      openGraph: {
        title: channel.name,
        description: channel.description || `${channel.name}'s video channel`,
        type: 'profile',
        images: [{ url: channel.banner || channel.avatar || "/avatars/default.jpg" }],
      },
    };
  } catch (error) {
    return {
      title: "Channel",
      description: "View channel content and videos"
    };
  }
}

// Server component for ChannelPage
export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  // Await the params Promise
  const resolvedParams = await params;
  const channelId = resolvedParams.channelId;
  
  // Get current user's authentication state
  const { userId } = await auth();
  
  // Fetch channel data
  let channel: Channel;
  let hasVideos = false;
  
  try {
    // Use the baseUrl from config with cache busting
    const response = await fetch(`${baseUrl}/api/channel/${channelId}?t=${Date.now()}`, {
      next: { revalidate: 0 },
      cache: 'no-store',
      headers: {
        // Pass the user's authentication state to the API
        'Authorization': userId ? `Bearer ${userId}` : ''
      }
    });
        
    if (!response.ok) {
      notFound();
    }
        
    const channelData = await response.json();
    
    // Fix image URLs before rendering
    channel = {
      ...channelData,
      avatar: ensureValidImageUrl(channelData.avatar),
      banner: channelData.banner ? ensureValidImageUrl(channelData.banner) : null
    };
    
    // Add debug logging for isOwner flag
    console.log(`Channel page for: ${channel.name} (${channelId})`);
    console.log(`Channel isOwner flag: ${channel.isOwner}`);
    console.log(`Current user ID: ${userId || 'Not authenticated'}`);
        
    // Check if channel has videos
    try {
      const videosResponse = await fetch(`${baseUrl}/api/channel/${channelId}/videos?page=1&t=${Date.now()}`, {
        next: { revalidate: 0 },
        cache: 'no-store'
      });
      
      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        hasVideos = videosData.videos && videosData.videos.length > 0;
      }
    } catch (videoError) {
      console.error("Error checking videos:", videoError);
    }
    
    channel = {
      ...channel,
      hasVideos
    };
  } catch (error) {
    console.error("Error fetching channel:", error);
    notFound();
  }

  return (
    <div className="relative pb-12">
      {/* Debug components */}
      <DebugReloadButton />
      
      {/* Channel Banner */}
      <div className="relative h-[200px] sm:h-[250px] md:h-[350px] w-full overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
        {channel.banner ? (
          <Image 
            src={channel.banner}
            alt={`${channel.name} banner`}
            className="object-cover transition-transform duration-10000 group-hover:scale-105"
            fill
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900"></div>
        )}
        <Link href="/">
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        </Link>
        
        {/* Channel Owner Actions */}
        {channel.isOwner && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <Link href="/settings/channel">
              <Button 
                className="bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white border-white/20 flex items-center gap-2"
                size="sm"
                variant="outline"
              >
                <PenTool className="h-4 w-4" />
                <span>Customize</span>
              </Button>
            </Link>
            <Link href="/upload">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                size="sm"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="container max-w-6xl px-4 py-8 -mt-20 relative z-20">
        <ChannelHeader channel={channel} />

        <Separator className="mb-6 mt-6" />
        
        {/* Channel Content Tabs */}
        <Tabs defaultValue="videos">
          <TabsList className="mb-6">
            <TabsTrigger value="videos" className="relative">
              Videos
            </TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos">
            <ChannelVideoGrid channelId={channelId} isOwner={channel.isOwner} />
          </TabsContent>
          
          <TabsContent value="playlists">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No playlists yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {channel.isOwner 
                  ? "Create playlists to organize your videos and help viewers discover your content."
                  : "This channel hasn't created any playlists yet."}
              </p>
              {channel.isOwner && (
                <Link href="/settings/playlists/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Playlist
                  </Button>
                </Link>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="community">
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No community posts yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {channel.isOwner 
                  ? "Share updates, polls, and other content with your subscribers."
                  : "This channel hasn't posted any community updates yet."}
              </p>
                {channel.isOwner && (
                <Link href="/settings/community/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
                )}
              </div>
            </TabsContent>
          
            <TabsContent value="about">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-3">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {channel.description || "This channel hasn't added a description yet."}
                </p>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-3">Details</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span>Joined {channel.joinDate}</span>
                    </div>
                    {channel.location && (
                      <div className="flex gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span>{channel.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {channel.links && channel.links.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Links</h3>
                    <div className="space-y-2">
                      {channel.links.map((link: any, i: number) => (
                        <a 
                          key={i}
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>{link.title || link.url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                    )}
                  </div>
                  
              <div>
                <h3 className="text-lg font-medium mb-3">Stats</h3>
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Joined</div>
                      <div className="text-muted-foreground">{channel.joinDate}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{formatNumber(channel.views)}</div>
                      <div className="text-muted-foreground">views</div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{formatNumber(channel.subscribers)}</div>
                      <div className="text-muted-foreground">subscribers</div>
                    </div>
                  </div>
                  {channel.likes && (
                    <div className="flex gap-2 items-center">
                      <Heart className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{formatNumber(channel.likes)}</div>
                        <div className="text-muted-foreground">likes</div>
                      </div>
                    </div>
                  )}
                  {channel.videoCount && (
                    <div className="flex gap-2 items-center">
                      <Play className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{channel.videoCount}</div>
                        <div className="text-muted-foreground">videos</div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
} 