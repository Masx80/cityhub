"use client";

import { useState, useEffect, useCallback } from "react";
import VideoCard from "@/components/video-card";
import VideoCardSkeleton from "@/components/video-card-skeleton";
import CategoriesBar from "@/components/categories-bar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import React from "react";

// Define video interface
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

// Define category interface
interface Category {
  id: string;
  name: string;
  // Add other potential properties with optional modifier
  icon?: string;
  slug?: string;
  description?: string;
}

// Define pagination interface
interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalVideos: number;
  hasMore: boolean;
}

interface HomepageClientProps {
  initialVideos: Video[];
  initialCategories: Category[];
  initialPagination: PaginationData;
  initialError: { message: string; code?: string } | null;
  initialQuery: string;
  initialCategoryId: string;
  initialPage: number;
}

export default function HomepageClient({
  initialVideos,
  initialCategories,
  initialPagination,
  initialError,
  initialQuery,
  initialCategoryId,
  initialPage
}: HomepageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [visibleVideos, setVisibleVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [error, setError] = useState<{ message: string; code?: string } | null>(initialError);
  const [retryCount, setRetryCount] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [paginationData, setPaginationData] = useState<PaginationData>(initialPagination);
  
  // Get search params from URL and context
  const searchParams = useSearchParams();
  const { searchQuery, handleSearch } = useSearch();

  // Gradually reveal videos for a smoother loading experience
  useEffect(() => {
    // Only apply the staggered reveal if we have videos to show
    if (videos.length === 0) {
      setVisibleVideos([]);
      return;
    }

    // Show the first 4 videos immediately
    const initialBatch = 4;
    setVisibleVideos(videos.slice(0, initialBatch));

    // Gradually reveal the rest with a stagger effect
    const revealBatchSize = 4;
    const revealInterval = 150;
    
    // Keep track of all timeouts to clean them up properly
    const timeouts: NodeJS.Timeout[] = [];

    for (let i = initialBatch; i < videos.length; i += revealBatchSize) {
      const timeout = setTimeout(() => {
        setVisibleVideos(prevVisible => {
          const nextBatch = videos.slice(0, i + revealBatchSize);
          return nextBatch;
        });
      }, revealInterval * (i / revealBatchSize));
      
      timeouts.push(timeout);
    }

    // Cleanup timeouts on unmount
    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [videos]);

  useEffect(() => {
    // Set initial search query if it exists
    if (initialQuery && !searchQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, searchQuery, handleSearch]);
  
  // Fetch real videos from the API (for client-side navigation/updates)
  const fetchVideos = async (page: number, categoryId?: string, query?: string) => {
    // Reset error state before attempting to fetch
    setError(null);
    setLoading(true);
    
    try {
      // Ensure page number is valid
      const validPage = Math.max(1, page);
      
      // Use different API endpoint for search vs regular videos
      let url = query 
        ? `/api/search?page=${validPage}` 
        : `/api/videos?page=${validPage}`;
      
      if (categoryId && categoryId !== "all") {
        url += `&categoryId=${categoryId}`;
      }
      
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }
      
      // Set up fetch with timeout for better user experience
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        // Add cache control to prevent stale data
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'X-Request-Type': query ? 'search' : 'browse' // Helps with analytics/debugging
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Create a more descriptive error based on status code
        const errorMessage = getErrorMessageForStatus(response.status);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Validate pagination data
      const validatedPagination = validatePaginationData(data.pagination);
      
      // Update the videos and pagination data
      setVideos(data.videos || []);
      setPaginationData(validatedPagination);
      
      // Synchronize currentPage with pagination data
      setCurrentPage(validatedPagination.currentPage);
    } catch (error) {
      console.error("Error fetching videos:", error);
      
      // Create a friendly error object
      const errorObj = {
        message: error instanceof Error ? error.message : "Failed to load videos",
        code: error instanceof Error && (error as any).status ? String((error as any).status) : undefined
      };
      
      // Set the error state
      setError(errorObj);
      
      // Show toast only if it's a new error (not from retry)
      if (retryCount === 0) {
        toast.error("Failed to load videos. Please try again.");
      }
      
      // Reset to safe defaults on error, but keep any previously loaded videos
      // so user can still see content while retrying
      setPaginationData(prev => ({
        currentPage: page,
        totalPages: prev.totalPages || 1,
        totalVideos: prev.totalVideos || 0,
        hasMore: false
      }));
      
      // Keep current page at the attempted page
      setCurrentPage(page);
    } finally {
      setLoading(false);
    }
  };
  
  // Get appropriate error message based on HTTP status code
  const getErrorMessageForStatus = (status: number): string => {
    switch (status) {
      case 400:
        return "The request was invalid. Please try again with different parameters.";
      case 401:
        return "You need to be logged in to access this content.";
      case 403:
        return "You don't have permission to access this content.";
      case 404:
        return "The requested videos could not be found.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Server error. Our team has been notified and is working on it.";
      default:
        return "Failed to load videos. Please check your internet connection and try again.";
    }
  };
  
  // Handle retry after error
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchVideos(currentPage, selectedCategory, searchQuery);
  };
  
  // Validate pagination data to ensure consistency
  const validatePaginationData = (pagination: any): PaginationData => {
    // Default pagination object for fallback
    const defaultPagination: PaginationData = {
      currentPage: 1,
      totalPages: 1,
      totalVideos: 0,
      hasMore: false
    };
    
    // Return default if pagination data is missing
    if (!pagination || typeof pagination !== 'object') {
      console.error("Invalid pagination data:", pagination);
      return defaultPagination;
    }
    
    // Validate and normalize each field
    const currentPage = !isNaN(Number(pagination.currentPage)) 
      ? Math.max(1, Number(pagination.currentPage)) 
      : 1;
      
    const totalPages = !isNaN(Number(pagination.totalPages)) 
      ? Math.max(1, Number(pagination.totalPages)) 
      : 1;
      
    const totalVideos = !isNaN(Number(pagination.totalVideos)) 
      ? Math.max(0, Number(pagination.totalVideos)) 
      : 0;
      
    const hasMore = Boolean(pagination.hasMore);
    
    return {
      currentPage,
      totalPages,
      totalVideos,
      hasMore
    };
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    // Validate the requested page number
    if (page < 1 || page > paginationData.totalPages || page === currentPage) {
      return;
    }
    
    // Update URL with new page parameter
    updateUrlParams({ page: page.toString() });
    
    // Scroll to top with smooth behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fetch the new page of videos
    fetchVideos(page, selectedCategory, searchQuery);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when changing category
    
    // Show loading state during transition
    setLoading(true);
    
    // Update URL with new category parameter
    updateUrlParams({ 
      categoryId: categoryId === "all" ? null : categoryId,
      page: "1" // Reset page to 1
    });
    
    // Fetch videos for the new category with a small delay to allow for loading animation
    setTimeout(() => {
      fetchVideos(1, categoryId, searchQuery);
    }, 150);
  };

  // Helper function to update URL parameters
  const updateUrlParams = (params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    
    // Update or remove each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    // Update the URL without refreshing the page
    router.replace(url.pathname + url.search);
  };

  // Load fresh categories if needed - fallback for client-side
  async function fetchCategories() {
    setCategoriesLoading(true);
    try {
      const res = await fetch("/api/categories");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch categories. Status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const allCategory = { id: "all", name: "All" };
        setCategories([allCategory, ...data]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Keep using initial categories
    } finally {
      setCategoriesLoading(false);
    }
  }

  // Handle search params changes - optimized for better performance
  useEffect(() => {
    const q = searchParams.get('q');
    const category = searchParams.get('categoryId') || "all";
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;

    // Update internal state if URL params change
    if (q !== searchQuery && q !== null) {
      handleSearch(q);
    }
    
    if (category !== selectedCategory) {
      setSelectedCategory(category);
    }
    
    if (page !== currentPage) {
      setCurrentPage(page);
    }

    // Do an immediate fetch without waiting - improves perceived performance
    if (q || category !== "all" || page > 1) {
      // Show loading state but use fast data retrieval
      setLoading(true);
      
      const fetchWithTimeout = async () => {
        try {
          // Use a timeout to avoid excessive fetch calls
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          // Build URL with current parameters
          let url = `/api/videos?page=${page}`;
          if (category !== "all") {
            url += `&categoryId=${category}`;
          }
          if (q) {
            url += `&q=${encodeURIComponent(q)}`;
          }
          
          const response = await fetch(url, {
            signal: controller.signal,
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'X-Priority': 'high' // Custom header for indicating priority
            }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            setVideos(data.videos || []);
            setPaginationData(validatePaginationData(data.pagination));
            setError(null);
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            console.log('Fetch aborted due to timeout');
          } else {
            console.error('Error fetching videos:', error);
          }
        } finally {
          setLoading(false);
        }
      };
      
      fetchWithTimeout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Custom empty state component for the video grid
  const EmptyVideoState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">No videos found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        We couldn't find any videos matching your criteria. Try selecting a different category or check back later for new content.
      </p>
      <button 
        onClick={() => handleCategoryChange("all")} 
        className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
      >
        Browse all videos
      </button>
    </div>
  );

  return (
    <>
      {/* Categories */}
      <CategoriesBar 
        categories={categories} 
        loading={categoriesLoading} 
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
      />

      {/* Title with search results indication */}
      <h1 className="text-xl font-bold mb-4 mt-2 flex items-center pl-0">
        <span className="bg-gradient-to-r from-orange-500 to-amber-500 w-2 h-6 rounded-full mr-2 inline-block"></span>
        {searchQuery 
          ? `Search results for "${searchQuery}"`
          : "Recommended"}
      </h1>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading videos</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>{error.message}</p>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              
              {selectedCategory !== "all" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleCategoryChange("all")} 
                  className="flex items-center gap-2"
                >
                  Browse all videos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Video Grid - Now with Infinite Scroll and Progressive Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Initial loading skeletons */}
        {loading && visibleVideos.length === 0 && (
          <>
            {Array(8)
              .fill(0)
              .map((_, i) => <VideoCardSkeleton key={i} />)}
          </>
        )}

        {/* Loaded videos - now using visibleVideos for staggered reveal */}
        {visibleVideos.length > 0 && (
          visibleVideos.map((video, index) => (
            <div key={video.id} className={`animate-fadeIn`} style={{ animationDelay: `${index * 50}ms` }}>
              <VideoCard {...video} />
            </div>
          ))
        )}

        {/* Skeleton placeholders for videos that haven't been revealed yet */}
        {visibleVideos.length > 0 && visibleVideos.length < videos.length && (
          Array(videos.length - visibleVideos.length)
            .fill(0)
            .map((_, i) => (
              <VideoCardSkeleton key={`reveal-skeleton-${i}`} />
            ))
        )}

        {/* Empty state */}
        {!loading && videos.length === 0 && <EmptyVideoState />}
      </div>
      
      {/* Pagination - Only show if infinite scroll is disabled or for accessibility */}
      {!loading && !error && videos.length > 0 && paginationData.totalPages > 1 && (
        <div className="mt-8 mb-10">
          <Pagination aria-label="Pagination navigation">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`cursor-pointer ${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
                  aria-disabled={currentPage <= 1}
                  aria-label="Go to previous page"
                  tabIndex={currentPage <= 1 ? -1 : 0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }
                  }}
                />
              </PaginationItem>
              
              {/* Generate pagination items with better validation */}
              {(() => {
                // Create an array of page numbers to display
                const pageNumbers: number[] = [];
                const maxPagesToShow = 5; // Maximum number of page buttons to show
                
                if (paginationData.totalPages <= maxPagesToShow) {
                  // If we have fewer pages than maxPagesToShow, show all pages
                  for (let i = 1; i <= paginationData.totalPages; i++) {
                    pageNumbers.push(i);
                  }
                } else {
                  // Always include first page
                  pageNumbers.push(1);
                  
                  // Calculate range around current page
                  let startPage = Math.max(2, currentPage - 1);
                  let endPage = Math.min(paginationData.totalPages - 1, currentPage + 1);
                  
                  // Adjust if at the beginning
                  if (currentPage <= 2) {
                    endPage = Math.min(4, paginationData.totalPages - 1);
                  }
                  
                  // Adjust if at the end
                  if (currentPage >= paginationData.totalPages - 1) {
                    startPage = Math.max(2, paginationData.totalPages - 3);
                  }
                  
                  // Add ellipsis before middle pages if needed
                  if (startPage > 2) {
                    pageNumbers.push(-1); // -1 represents ellipsis
                  }
                  
                  // Add middle pages
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                  }
                  
                  // Add ellipsis after middle pages if needed
                  if (endPage < paginationData.totalPages - 1) {
                    pageNumbers.push(-2); // -2 represents ellipsis
                  }
                  
                  // Always include last page if not already included
                  if (paginationData.totalPages > 1) {
                    pageNumbers.push(paginationData.totalPages);
                  }
                }
                
                // Render the pagination items
                return pageNumbers.map((pageNum, i) => {
                  if (pageNum < 0) {
                    // Render ellipsis
                    return (
                      <PaginationItem key={`ellipsis-${pageNum}-${i}`}>
                        <PaginationEllipsis aria-hidden="true" aria-label="More pages" />
                      </PaginationItem>
                    );
                  }
                  
                  // Render page number
                  const isCurrentPage = pageNum === currentPage;
                  return (
                    <PaginationItem key={`page-${pageNum}`}>
                      <PaginationLink 
                        onClick={() => handlePageChange(pageNum)}
                        isActive={isCurrentPage}
                        className="cursor-pointer"
                        aria-current={isCurrentPage ? "page" : undefined}
                        aria-label={`Page ${pageNum}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                });
              })()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`cursor-pointer ${currentPage >= paginationData.totalPages ? "pointer-events-none opacity-50" : ""}`}
                  aria-disabled={currentPage >= paginationData.totalPages}
                  aria-label="Go to next page"
                  tabIndex={currentPage >= paginationData.totalPages ? -1 : 0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (currentPage < paginationData.totalPages) handlePageChange(currentPage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          {/* Add Page Info for accessibility and clarity */}
          <div className="text-center text-sm text-muted-foreground mt-2" aria-live="polite">
            Page {currentPage} of {paginationData.totalPages} {paginationData.totalVideos > 0 && `(${paginationData.totalVideos} total videos)`}
          </div>
        </div>
      )}
    </>
  );
} 