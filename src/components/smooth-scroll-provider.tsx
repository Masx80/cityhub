"use client";

import { ReactNode } from "react";
import { useSmoothScroll } from "@/lib/hooks/use-smooth-scroll";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  // Initialize default scrolling
  useSmoothScroll();
  
  // Simply render children without applying any custom scroll behavior
  return <>{children}</>;
} 