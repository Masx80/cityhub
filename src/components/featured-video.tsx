"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface FeaturedVideoProps {
  id: string;
  title: string;
  description: string;
  channel: {
    name: string;
    id: string;
    handle?: string;
    avatar?: string;
  };
  views: string;
  publishedAt: string;
}

export default function FeaturedVideo({
  id,
  title,
  description,
  channel,
  views,
  publishedAt,
}: FeaturedVideoProps) {
  return (
    <motion.div
      className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Video Thumbnail with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/backdrop.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
            <p className="text-sm md:text-base text-gray-200 mb-4 line-clamp-2">
              {description}
            </p>
            <div className="flex items-center space-x-2 mt-3">
              <Link href={`/channel/${channel.handle || channel.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <Avatar className="h-8 w-8 border border-background">
                  <AvatarImage 
                    src={channel.avatar || "/images/default-avatar.png"} 
                    alt={channel.name} 
                  />
                  <AvatarFallback>{channel.name[0]}</AvatarFallback>
                </Avatar>
              </Link>
              
              {/* Channel name and video info */}
              <div className="flex flex-col">
                <Link 
                  href={`/channel/${channel.handle || channel.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {channel.name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {views} views • {publishedAt}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3 mt-4">
            <Link href={`/watch/${id}`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" /> Play Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
