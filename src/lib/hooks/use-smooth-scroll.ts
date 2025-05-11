"use client";

import { useEffect } from 'react';

export function useSmoothScroll() {
  useEffect(() => {
    // This hook now restores default browser scrolling
    // Remove any custom scroll behavior
    
    // Reset scroll behavior to default
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    
    // Reset overscroll behavior to browser default
    document.documentElement.style.overscrollBehavior = 'auto';
    document.body.style.overscrollBehavior = 'auto';
    
    // Remove any will-change properties
    document.documentElement.style.willChange = 'auto';
    document.body.style.willChange = 'auto';
    
    // Remove any transform properties
    document.documentElement.style.transform = '';
    document.body.style.transform = '';
    
    // Remove any perspective properties
    document.documentElement.style.perspective = '';
    document.body.style.perspective = '';
    
    // Restore normal scrolling for all elements
    const scrollableElements = Array.from(
      document.querySelectorAll('.overflow-y-auto, .overflow-auto, [data-scroll-container]')
    );
    
    scrollableElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.scrollBehavior = 'auto';
        el.style.overscrollBehavior = 'auto';
        el.style.willChange = 'auto';
        el.style.transform = '';
        el.style.backfaceVisibility = '';
        el.style.perspective = '';
      }
    });
    
    // Clean up function
    return () => {
      // Nothing to clean up as we're using browser defaults
    };
  }, []);
} 