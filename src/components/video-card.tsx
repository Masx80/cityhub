"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Play, Clock, Eye, Calendar, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ensureValidImageUrl } from "@/lib/utils/image";

// Create a global context for tracking the currently previewing video
import { createContext, useContext } from "react";

// Context for managing currently previewing video ID
const PreviewContext = createContext<{
  currentPreviewId: string | null;
  setCurrentPreviewId: (id: string | null) => void;
}>({
  currentPreviewId: null,
  setCurrentPreviewId: () => {},
});

// Provider component for PreviewContext
export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [currentPreviewId, setCurrentPreviewId] = useState<string | null>(null);
  
  return (
    <PreviewContext.Provider value={{ currentPreviewId, setCurrentPreviewId }}>
      {children}
    </PreviewContext.Provider>
  );
}

// Hook to use the preview context
export function usePreview() {
  return useContext(PreviewContext);
}

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  channel: {
    name: string;
    avatar?: string;
    handle?: string;
  };
  views: string;
  timestamp: string;
  duration?: string;
  isOwner?: boolean;
  progress?: number;
}

// Helper function to preload an image
const preloadImage = (src: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (!src) {
      resolve();
      return;
    }
    
    // Use the DOM API to create an image element
    const img = document.createElement('img');
    img.src = src;
    
    if (img.complete) {
      resolve();
      return;
    }
    
    img.onload = () => resolve();
    img.onerror = () => reject();
  });
};

export default function VideoCard({
  id,
  title,
  thumbnail,
  channel,
  views,
  timestamp,
  duration,
  isOwner = false,
  progress,
}: VideoCardProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { currentPreviewId, setCurrentPreviewId } = usePreview();
  
  // Ensure image URLs are valid
  const validatedThumbnail = thumbnail ? ensureValidImageUrl(thumbnail) : '/placeholder.svg';
  const validatedAvatar = channel.avatar ? ensureValidImageUrl(channel.avatar) : undefined;
  
  // Generate preview URL from Bunny Stream CDN
  const pullZoneUrl = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE_URL || 'vz-7503b6d0-a19.b-cdn.net';
  const previewUrl = `https://${pullZoneUrl}/${id}/preview.webp`;
  
  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Track hover for video preview
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Store ref value at the start to prevent closure issues
    const currentRef = cardRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.5,
      }
    );
    
    observer.observe(currentRef);
    
    return () => {
      observer.unobserve(currentRef);
    };
  }, [isMobile]);
  
  // Auto-preview on mobile when visible - now uses global context
  useEffect(() => {
    if (isMobile && isVisible) {
      // Set this card as the current previewing card
      setCurrentPreviewId(id);
      setIsHovering(true);
    } else if (isMobile && !isVisible) {
      // Only reset if this card was the one previewing
      if (currentPreviewId === id) {
        setCurrentPreviewId(null);
      }
      setIsHovering(false);
      setPreviewLoaded(false);
    }
  }, [isMobile, isVisible, id, currentPreviewId, setCurrentPreviewId]);
  
  // Check if another card became the previewing card
  useEffect(() => {
    if (isMobile && currentPreviewId !== null && currentPreviewId !== id) {
      // Add a small delay before hiding to create a smooth transition
      const timeout = setTimeout(() => {
        setIsHovering(false);
        setPreviewLoaded(false);
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [currentPreviewId, id, isMobile]);
  
  // Handle mouse enter/leave with delay to prevent flickering
  const handleMouseEnter = () => {
    if (isMobile) return; // Skip for mobile as we use scroll detection instead
    
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    hoverTimerRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 200);
  };
  
  const handleMouseLeave = () => {
    if (isMobile) return; // Skip for mobile
    
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    
    setIsHovering(false);
    setPreviewLoaded(false);
  };
  
  // Handle preview loading
  const handlePreviewLoaded = () => {
    setPreviewLoaded(true);
  };
  
  // Handle preview error
  const handlePreviewError = () => {
    setPreviewError(true);
  };
  
  // Navigate to channel page
  const handleChannelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/channel/${channel.handle || channel.name.toLowerCase().replace(/\s+/g, "-")}`);
  };
  
  // Handle edit video click
  const handleEditVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/edit-video/${id}`);
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  // Use a default duration if none provided
  const videoDuration = duration || "0:00";

  return (
    <motion.div
      ref={cardRef}
      className="group flex flex-col transition-all duration-300 h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ 
        scale: 1.02,
        y: -4
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="block relative cursor-pointer" onClick={() => router.push(`/watch/${id}`)}>
        <div className="aspect-video overflow-hidden relative rounded-lg bg-muted">
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 text-xs font-medium bg-black/80 text-white px-2 py-1 rounded-md z-30 backdrop-blur-sm">
            {videoDuration}
          </div>
          
          {/* Edit button for channel owner */}
          {isOwner && (
            <div 
              className="absolute top-2 right-2 z-40 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-md"
              onClick={handleEditVideo}
            >
              <Edit className="h-4 w-4" />
            </div>
          )}
          
          {/* Base thumbnail image - static, no fade in/out */}
          <div className="absolute inset-0 z-10">
            <Image
              src={validatedThumbnail}
              alt={title}
              fill
              className={cn(
                "object-cover",
                !isHovering && "group-hover:scale-105 transition-transform duration-500"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              unoptimized={validatedThumbnail?.includes('b-cdn.net')}
            />
          </div>
          
          {/* Preview image on hover */}
          {isHovering && !previewError && (
            <div 
              className={cn(
                "absolute inset-0 z-20 transition-opacity duration-300",
                previewLoaded ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={previewUrl}
                alt={`Preview of ${title}`}
                fill
                className={cn(
                  "object-cover scale-110 transition-transform duration-500",
                  isMobile && "transform-gpu" // Add hardware acceleration for mobile
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoad={handlePreviewLoaded}
                onError={handlePreviewError}
                unoptimized
              />
            </div>
          )}
          
          {/* Progress bar for history videos */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/60 z-40">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-3 px-1 flex-1">
        {/* Channel avatar */}
        <div 
          onClick={handleChannelClick}
          className="flex-shrink-0 cursor-pointer transform transition-all duration-200 hover:scale-110 mt-0.5"
        >
          <Avatar className="h-9 w-9 rounded-full border border-muted shadow-sm hover:border-primary/50 transition-all">
            {validatedAvatar ? (
              <AvatarImage src={validatedAvatar} alt={channel.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                {channel.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        {/* Video details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div 
            className="block cursor-pointer"
            onClick={() => router.push(`/watch/${id}`)}
          >
            <h3 className="font-semibold text-base text-foreground/80 leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {title}
            </h3>
          </div>
          
          {/* Channel name */}
          <div className="mt-1.5">
            <div
              onClick={handleChannelClick}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center cursor-pointer"
            >
              {channel.name}
            </div>
          </div>
          
          {/* Video stats */}
          <div className="flex flex-wrap gap-x-3 mt-1 text-muted-foreground text-xs">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 opacity-70" />
              <span>{views} views</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 opacity-70" />
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
