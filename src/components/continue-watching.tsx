"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useMiniPlayer } from "@/hooks/use-mini-player";

interface ContinueWatchingProps {
  videos: {
    id: string;
    title: string;
    thumbnail: string;
    channel: {
      name: string;
    };
    progress: number;
    timestamp: string;
  }[];
}

export default function ContinueWatching({ videos }: ContinueWatchingProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { open } = useMiniPlayer();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const handleMiniPlayerOpen = (video: any) => {
    open({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      channel: { name: video.channel.name },
    });
  };

  return (
    <div className="relative mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="bg-gradient-to-r from-orange-500 to-amber-500 w-2 h-6 rounded-full mr-2 inline-block"></span>
        Continue Watching
      </h2>

      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto py-2 px-8 scrollbar-hide"
      >
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            className="flex-shrink-0 w-[280px] group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
              />

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                  style={{ width: `${video.progress}%` }}
                ></div>
              </div>

              {/* Play overlay */}
              <div
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => handleMiniPlayerOpen(video)}
              >
                <Button
                  size="sm"
                  className="bg-orange-500/90 hover:bg-orange-600 text-white"
                >
                  Resume
                </Button>
              </div>
            </div>

            <div className="mt-2">
              <Link href={`/watch/${video.id}`}>
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {video.channel.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {video.timestamp}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
