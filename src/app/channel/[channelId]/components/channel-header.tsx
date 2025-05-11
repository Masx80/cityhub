"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Share2, Calendar, MapPin, Mail, Upload, 
  Plus, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SubscribeButton from "@/components/subscribe-button";

// Format numbers with K and M for thousands and millions
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

interface ChannelHeaderProps {
  channel: {
    id: string;
    name: string;
    handle: string;
    subscribers: number;
    views: number;
    joinDate: string;
    avatar: string;
    description?: string;
    location?: string;
    email?: string;
    isOwner: boolean;
  };
}

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
  return (
    <div>
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {channel.avatar ? (
            <Image
              src={channel.avatar}
              alt={channel.name}
              className="object-cover"
              fill
              sizes="96px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary text-2xl font-semibold">
              {channel.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{channel.name}</h1>
              </div>
              <div className="text-muted-foreground mt-1">
                <span>{channel.handle}</span>
                <div className="hidden sm:flex items-center gap-4">
                  <span>{formatNumber(channel.subscribers)} subscribers</span>
                  <span>{formatNumber(channel.views)} views</span>
                </div>
              </div>
              <div className="flex sm:hidden items-center gap-4 mt-1 text-muted-foreground">
                <span>{formatNumber(channel.subscribers)} subscribers</span>
                <span>{formatNumber(channel.views)} views</span>
              </div>
            </div>
            
            {/* Channel Actions */}
            <div className="flex items-center gap-2">
              {/* Only show subscribe button if not the channel owner */}
              {!channel.isOwner && (
                <SubscribeButton 
                  creatorId={channel.id} 
                  channelName={channel.name}
                />
              )}
              <Button variant="outline" size="icon" className="text-muted-foreground" title="Share" onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => {
                    alert("Channel link copied to clipboard");
                  })
                  .catch(() => {
                    alert("Failed to copy link");
                  });
              }}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Additional Channel Info */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {channel.joinDate}</span>
            </div>
            {channel.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{channel.location}</span>
              </div>
            )}
            {channel.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{channel.email}</span>
              </div>
            )}
          </div>
          
          {/* Channel Description */}
          {channel.description && (
            <p className="mt-4 text-sm leading-relaxed max-w-3xl">
              {channel.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 