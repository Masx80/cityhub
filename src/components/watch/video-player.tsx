"use client";

import { useEffect, useRef } from "react";
import { addToWatchHistory } from "@/actions/watch-history";

interface VideoPlayerProps {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Track progress and save to history
  useEffect(() => {
    if (!videoRef.current) return;
    
    let progressTimer: NodeJS.Timeout;
    let lastSavedProgress = 0;
    
    const updateProgress = async () => {
      if (!videoRef.current) return;
      
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      if (!duration) return; // Can't calculate progress without duration
      
      // Calculate progress as percentage
      const progressPercentage = Math.floor((currentTime / duration) * 100);
      
      // Only update if progress changed by at least 5% to reduce database writes
      if (Math.abs(progressPercentage - lastSavedProgress) >= 5) {
        try {
          await addToWatchHistory(src, progressPercentage.toString());
          lastSavedProgress = progressPercentage;
        } catch (error) {
          console.error("Failed to update watch history:", error);
        }
      }
    };
    
    const handleTimeUpdate = () => {
      // Clear any existing timer
      if (progressTimer) {
        clearTimeout(progressTimer);
      }
      
      // Debounce the progress update to avoid too many calls
      progressTimer = setTimeout(updateProgress, 2000);
    };
    
    // Add event listener for progress updates
    const videoElement = videoRef.current;
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    
    // Save progress when unmounting
    return () => {
      if (progressTimer) {
        clearTimeout(progressTimer);
      }
      
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        
        // Final save on unmount
        if (videoElement.currentTime > 0 && videoElement.duration) {
          const finalProgress = Math.floor((videoElement.currentTime / videoElement.duration) * 100);
          addToWatchHistory(src, finalProgress.toString()).catch(console.error);
        }
      }
    };
  }, [src]);
  
  return (
    <video 
      ref={videoRef}
      src={src} 
      controls
      className="w-full h-full"
    />
  );
} 