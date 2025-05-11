"use client";

import { useEffect, useState, useCallback } from 'react';
import VideoCardSkeleton from './video-card-skeleton';

interface VideoSkeletonsProps {
  count?: number;
  itemWidth?: number;
  defaultCount?: number;
}

/**
 * A responsive grid of video skeletons with a dynamic count based on viewport size
 */
export default function VideoSkeletons({ 
  count, 
  itemWidth = 320,
  defaultCount = 12
}: VideoSkeletonsProps) {
  // Initial state with a safe fallback for SSR
  const [skeletonCount, setSkeletonCount] = useState<number>(count || defaultCount);
  const [mounted, setMounted] = useState(false);
  
  // Safe window access function
  const getWindowDimension = useCallback(() => {
    // Always return the same defaults for server-side rendering
    // This avoids hydration mismatches
    return {
      width: 1280, // Default fallback
      height: 800
    };
  }, []);
  
  // Calculate default count based on viewport size
  const getDefaultCount = useCallback(() => {
    // If specific count is provided, use that (capped at defaultCount)
    if (count) return Math.min(count, defaultCount);
    
    if (!mounted) return defaultCount;
    
    // Only access window dimensions on the client after mounting
    const { width, height } = mounted ? {
      width: window.innerWidth,
      height: window.innerHeight
    } : getWindowDimension();
    
    // Estimate columns based on item width and container padding
    let containerWidth = width;
    if (width >= 1536) containerWidth = width * 0.5; // 2xl - container is 50%
    else if (width >= 1280) containerWidth = width * 0.6; // xl - container is 60%
    else if (width >= 1024) containerWidth = width * 0.7; // lg - container is 70%
    else if (width >= 768) containerWidth = width * 0.8; // md - container is 80%
    else containerWidth = width * 0.95; // sm - container is 95%
    
    // Account for container padding
    containerWidth -= 48; // 24px padding on each side
    
    // Calculate columns based on item width
    const columns = Math.max(1, Math.floor(containerWidth / itemWidth));
    
    // Calculate appropriate rows based on viewport height
    const rows = height < 768 ? 2 : 3;
    
    // Return columns × rows, but cap at defaultCount
    return Math.min(columns * rows, defaultCount);
  }, [count, itemWidth, defaultCount, mounted, getWindowDimension]);
  
  // Handle window resize to recalculate skeleton count
  const handleResize = useCallback(() => {
    if (!count) {
      setSkeletonCount(getDefaultCount());
    }
  }, [count, getDefaultCount]);
  
  // Mark component as mounted and set up window resize listener
  useEffect(() => {
    setMounted(true);
    
    // If count is explicitly provided, use that
    if (count) {
      setSkeletonCount(count);
      return;
    }
    
    // Calculate based on viewport
    handleResize();
    
    // Add resize listener only on client side
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count, handleResize]);
  
  // Update skeleton count when dependencies change
  useEffect(() => {
    if (mounted) {
      handleResize();
    }
  }, [mounted, itemWidth, defaultCount, handleResize]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2 animate-in fade-in duration-300">
      {Array(skeletonCount)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-full">
            <VideoCardSkeleton />
          </div>
        ))}
    </div>
  );
} 