"use client"

import { useEffect, useState, useRef } from "react";
import { addToWatchHistory } from "@/actions/watch-history"; 

interface BunnyPlayerProps {
  src?: string  // Can be either videoId directly or a URL containing the videoId
  poster?: string
  title?: string
}

export default function CustomVideoPlayer({ src, poster, title }: BunnyPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = src || "";
  
  // Track video progress for watch history
  useEffect(() => {
    if (!videoId) return;
    
    // Initial record when video loads
    addToWatchHistory(videoId, "0", false)
      .catch(error => console.error("Failed to update watch history:", error));
    
    // Set a timer to record progress periodically
    const progressTimer = setInterval(() => {
      addToWatchHistory(videoId, "50", false) // Use an estimated progress value
        .catch(error => console.error("Failed to update watch history:", error));
    }, 60000); // Update every minute
    
    // Clean up on unmount
    return () => {
      clearInterval(progressTimer);
      
      // Final save on unmount with estimated completion
      addToWatchHistory(videoId, "90", false)
        .catch(error => console.error("Failed to update final watch history:", error));
    };
  }, [videoId]);

  // Return the fixed iframe content exactly as provided with anti-flash modifications
  return (
    <div 
      className="bg-black w-full" // Add black background to container
      style={{ 
        backgroundColor: "#000", // Explicit black background
        overflow: "hidden" // Prevent any potential overflow
      }}
    >
      <div dangerouslySetInnerHTML={{ 
        __html: `<div style="position:relative;padding-top:56.25%;">
          <iframe 
            src="https://iframe.mediadelivery.net/embed/426297/cba7e67d-19cd-4d1a-9e8c-ed92c4e7808e?autoplay=true&loop=true&muted=true&preload=true&responsive=true" 
            loading="lazy" 
            style="border:0;position:absolute;top:0;height:100%;width:100%;" 
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" 
            allowfullscreen="true"
          ></iframe>
        </div>`
      }} />
    </div>
  );
}
