"use client";

import React, { useEffect, useState, useRef } from 'react';
import { FixedSizeGrid } from 'react-window';
import { useThrottledCallback } from 'use-debounce';
import VideoCard from '@/components/video-card';
import VideoSkeletons from '@/components/video-skeletons';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define video interface to match the one in page.tsx
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: {
    name: string;
    avatar?: string;
    handle: string;
  };
  views: string;
  timestamp: string;
}

interface VirtualizedVideoGridProps {
  videos: Video[];
  loading: boolean;
  error?: { message: string; code?: string } | null;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
  expectedItemCount?: number;
}

export default function VirtualizedVideoGrid({ 
  videos, 
  loading,
  error,
  onRetry,
  emptyState,
  expectedItemCount
}: VirtualizedVideoGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });
  const [columnCount, setColumnCount] = useState(1);
  const [isResizing, setIsResizing] = useState(false);
  
  // Card dimensions
  const itemWidth = 320; // approximate width of each card with margin
  const itemHeight = 350; // reduced height for tighter vertical spacing
  
  // Calculate columns based on container width
  const calculateColumns = useThrottledCallback(() => {
    if (!gridRef.current) return;
    
    setIsResizing(true);
    
    // Get the actual width available
    const width = gridRef.current.clientWidth;
    
    // Calculate how many columns can fit
    const columns = Math.max(1, Math.floor(width / itemWidth));
    
    // Only update state if columns have changed
    if (columns !== columnCount) {
      setColumnCount(columns);
    }
    
    // Set grid dimensions with stable height calculation
    setGridDimensions({
      width: width,
      // Use min of viewport or required height, but maintain stability during transitions
      height: Math.min(
        window.innerHeight * 0.8,
        Math.ceil(videos.length / columns) * itemHeight
      )
    });
    
    // Reset resizing state after a delay to allow smooth transitions
    setTimeout(() => {
      setIsResizing(false);
    }, 300);
  }, 300, { trailing: true, leading: false });
  
  // Set up resize listener with debounce to prevent flickering
  useEffect(() => {
    // Initial calculation
    if (gridRef.current) {
      const width = gridRef.current.clientWidth;
      const columns = Math.max(1, Math.floor(width / itemWidth));
      setColumnCount(columns);
      setGridDimensions({
        width: width,
        height: Math.min(
          window.innerHeight * 0.8,
          Math.ceil(videos.length / columns) * itemHeight
        )
      });
    }
    
    // Debounced resize handling to reduce visual flicker
    const resizeObserver = new ResizeObserver(() => {
      // Debounce the resize calculation
      setIsResizing(true);
      calculateColumns();
    });
    
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateColumns, itemWidth, itemHeight, videos.length]);
  
  // Recalculate only when videos array length changes
  useEffect(() => {
    calculateColumns();
  }, [videos.length, calculateColumns]);
  
  // Row count based on total videos and columns
  const rowCount = Math.ceil(videos.length / columnCount);
  
  // Cell renderer for the grid
  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columnCount + columnIndex;
    
    if (index >= videos.length) {
      return <div style={style} />; // Empty cell
    }
    
    const video = videos[index];
    
    return (
      <div style={{ 
        ...style, 
        padding: '3px 6px', // Less vertical padding, same horizontal padding
        height: '100%', // Ensure full height usage
        transition: 'all 0.3s ease-in-out', // Smooth transition when dimensions change
      }}>
        <VideoCard key={video.id} {...video} />
      </div>
    );
  };
  
  // Render skeletons during loading state
  if (loading) {
    return (
      <div ref={gridRef} className="w-full transition-opacity duration-300">
        <VideoSkeletons 
          count={expectedItemCount} 
          itemWidth={itemWidth} 
          defaultCount={columnCount > 0 ? columnCount * 3 : 12} // Use 3 rows or default to 12
        />
      </div>
    );
  }
  
  // If there's an error but we still have some videos to show (from previous successful fetch)
  // display them but with a lighter error indication at the top of the grid
  if (error && videos.length > 0) {
    // Show error banner above existing videos
    return (
      <div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            Some videos couldn't be loaded. You're viewing previously loaded content.
          </p>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              className="whitespace-nowrap flex items-center gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          )}
        </div>
        
        {/* Display the existing videos */}
        <div 
          ref={gridRef} 
          className="w-full transition-all duration-300 ease-in-out"
        >
          {gridDimensions.width > 0 && gridDimensions.height > 0 && (
            <FixedSizeGrid
              columnCount={columnCount}
              columnWidth={gridDimensions.width / columnCount}
              height={gridDimensions.height}
              rowCount={Math.ceil(videos.length / columnCount)}
              rowHeight={itemHeight}
              width={gridDimensions.width}
              className={isResizing ? 'opacity-90' : 'opacity-100'}
            >
              {Cell}
            </FixedSizeGrid>
          )}
        </div>
      </div>
    );
  }
  
  // Render empty state if no videos and not loading (could be due to error or empty results)
  if (!loading && videos.length === 0) {
    return emptyState || (
      <div className="col-span-full flex items-center justify-center py-6 px-4">
        <div className="w-full max-w-sm bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-5 shadow-md">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
            <h3 className="text-base font-medium mb-1">No videos found</h3>
            <p className="text-muted-foreground text-sm">
              Try selecting a different category.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={gridRef} 
      className="w-full transition-all duration-300 ease-in-out"
    >
      {gridDimensions.width > 0 && gridDimensions.height > 0 && (
        <FixedSizeGrid
          columnCount={columnCount}
          columnWidth={gridDimensions.width / columnCount}
          height={gridDimensions.height}
          rowCount={rowCount}
          rowHeight={itemHeight}
          width={gridDimensions.width}
          className={isResizing ? 'opacity-90' : 'opacity-100'}
        >
          {Cell}
        </FixedSizeGrid>
      )}
    </div>
  );
} 