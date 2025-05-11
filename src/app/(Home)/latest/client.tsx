"use client";

import React, { useTransition, useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Create a context for managing loading state
const LoadingContext = React.createContext<{
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}>({
  isLoading: false,
  setLoading: () => {},
});

// Provider component for loading state
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const previousSearchRef = useRef<string>("");
  
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);
  
  // Listen for navigation changes to reset loading state
  useEffect(() => {
    const handleNavigationEnd = () => {
      // Small delay to ensure rendering completes
      setTimeout(() => setIsLoading(false), 200);
    };
    
    // For App Router, we use state changes to detect navigation
    const previousPath = window.location.pathname;
    previousSearchRef.current = window.location.search;
    
    const interval = setInterval(() => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      
      // If the path or search params changed, navigation completed
      if (previousPath !== currentPath || 
          previousSearchRef.current !== currentSearch) {
        handleNavigationEnd();
        previousSearchRef.current = currentSearch;
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

// Hook to use loading state
export function useLoading() {
  return React.useContext(LoadingContext);
}

interface SortTabsProps {
  defaultSort: string;
}

export function SortTabs({ defaultSort }: SortTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { setLoading } = useLoading();
  
  const handleSortChange = (value: string) => {
    // Set loading state
    setLoading(true);
    
    startTransition(() => {
      // Create a new URLSearchParams instance
      const params = new URLSearchParams(searchParams.toString());
      
      // Update the sort parameter based on the selected value
      if (value === "newest") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }
      
      // Reset to page 1 when sorting changes
      params.delete("page");
      
      // Preserve search query if it exists
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      
      // Update the URL without refreshing the page
      router.push(url, { scroll: false });
    });
  };

  return (
    <Tabs defaultValue={defaultSort} onValueChange={handleSortChange}>
      <TabsList className={isPending ? "opacity-70 pointer-events-none" : ""}>
        <TabsTrigger value="newest">Newest</TabsTrigger>
        <TabsTrigger value="oldest">Oldest</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

interface LoadMoreButtonProps {
  currentPage: number;
}

export function LoadMoreButton({ currentPage }: LoadMoreButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { setLoading } = useLoading();
  
  const handleLoadMore = () => {
    // Set loading state
    setLoading(true);
    
    startTransition(() => {
      // Create a new URLSearchParams instance
      const params = new URLSearchParams(searchParams.toString());
      
      // Update the page parameter
      params.set("page", (currentPage + 1).toString());
      
      // Update the URL without refreshing the page
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };
  
  return (
    <button
      onClick={handleLoadMore}
      disabled={isPending}
      className={`px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-colors ${
        isPending ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {isPending ? "Loading..." : "Load more videos"}
    </button>
  );
}

export function LoadingStateTracker() {
  const { isLoading } = useLoading();
  
  // Return a hidden data attribute that can be used for parent component
  return (
    <div data-loading={isLoading.toString()} className="hidden" />
  );
} 