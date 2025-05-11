"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface Channel {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  banner: string;
  joinDate: string;
}

export default function AllChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/channels");
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setChannels(data);
      } catch (error) {
        console.error("Error fetching channels:", error);
        setError("Failed to load channels. Please try again later.");
        toast.error("Failed to load channels. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const refreshChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/channels");
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setChannels(data);
      toast.success("Channels refreshed successfully");
    } catch (error) {
      console.error("Error refreshing channels:", error);
      setError("Failed to refresh channels");
      toast.error("Failed to refresh channels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">All Channels</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshChannels}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Refresh Channels
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div>
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
            <p className="text-muted-foreground">Loading channels...</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ChannelCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No channels found</h3>
          <p className="text-muted-foreground mb-6">
            There are no channels available at the moment.
          </p>
        </div>
      )}
    </div>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  // Function to handle missing image URLs
  const getValidImageUrl = (url: string | undefined | null) => {
    if (!url || url.startsWith('/placeholders/')) {
      // Return a default gradient background color
      return null;
    }
    return url;
  };

  const avatarUrl = getValidImageUrl(channel.avatar);
  const bannerUrl = getValidImageUrl(channel.banner);

  return (
    <Link 
      href={`/channel/${channel.handle.replace(/^@/, '')}`}
      className="group rounded-lg overflow-hidden border bg-card transition-all hover:shadow-md"
    >
      <div className="h-24 w-full relative bg-gradient-to-r from-gray-800 to-gray-900">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`${channel.name} banner`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-900" />
        )}
      </div>
      <div className="p-4 flex flex-col items-center text-center">
        <div className="relative h-16 w-16 -mt-12 mb-3 rounded-full overflow-hidden border-4 border-background">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${channel.name} avatar`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold">
              {channel.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="font-semibold text-lg truncate w-full">{channel.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 truncate w-full">{channel.handle}</p>
        <Button variant="secondary" size="sm" className="w-full">
          View Channel
        </Button>
      </div>
    </Link>
  );
}

function ChannelCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border bg-card">
      <Skeleton className="h-24 w-full" />
      <div className="p-4 flex flex-col items-center">
        <Skeleton className="h-16 w-16 -mt-12 mb-3 rounded-full" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
} 