"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, KeyboardEvent, useMemo } from "react";

interface Category {
  id: string;
  name: string;
}

interface CategoriesBarProps {
  categories: Category[];
  loading: boolean;
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export default function CategoriesBar({ 
  categories, 
  loading,
  selectedCategory = "all",
  onSelectCategory 
}: CategoriesBarProps) {
  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const categoryButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Initialize refs array when categories change
  useEffect(() => {
    categoryButtonsRef.current = Array(categories.length).fill(null);
  }, [categories.length]);

  // Set ref for a button at specific index - using a callback ref pattern
  const getButtonRef = (index: number) => (element: HTMLButtonElement | null) => {
    categoryButtonsRef.current[index] = element;
  };

  // Check if scrolling is possible
  const checkScrollability = () => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      const hasHorizontalScroll = scrollArea.scrollWidth > scrollArea.clientWidth;
      setCanScrollLeft(scrollArea.scrollLeft > 0);
      setCanScrollRight(
        hasHorizontalScroll && scrollArea.scrollLeft < scrollArea.scrollWidth - scrollArea.clientWidth
      );
    }
  };
  
  // Initialize scroll check
  useEffect(() => {
    checkScrollability();
    // Add scroll event listener to update button visibility during scrolling
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.addEventListener('scroll', checkScrollability);
    }
    window.addEventListener('resize', checkScrollability);
    
    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', checkScrollability);
    };
  }, [categories]);

  // Scroll functions
  const scrollLeft = () => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkScrollability, 100);
    }
  };

  const scrollRight = () => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkScrollability, 100);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button')) return;
    
    const currentIndex = categoryButtonsRef.current.findIndex(
      btn => btn === document.activeElement
    );
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < categoryButtonsRef.current.length - 1) {
          const nextButton = categoryButtonsRef.current[currentIndex + 1];
          nextButton?.focus();
          
          // Ensure the focused button is visible
          const buttonRect = nextButton?.getBoundingClientRect();
          const scrollAreaElem = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
          if (buttonRect && scrollAreaElem) {
            const scrollAreaRect = scrollAreaElem.getBoundingClientRect();
            if (buttonRect.right > scrollAreaRect.right) {
              scrollRight();
            }
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevButton = categoryButtonsRef.current[currentIndex - 1];
          prevButton?.focus();
          
          // Ensure the focused button is visible
          const buttonRect = prevButton?.getBoundingClientRect();
          const scrollAreaElem = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
          if (buttonRect && scrollAreaElem) {
            const scrollAreaRect = scrollAreaElem.getBoundingClientRect();
            if (buttonRect.left < scrollAreaRect.left) {
              scrollLeft();
            }
          }
        }
        break;
      case 'Home':
        e.preventDefault();
        categoryButtonsRef.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        categoryButtonsRef.current[categoryButtonsRef.current.length - 1]?.focus();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="relative mb-4 sm:mb-6 bg-background py-0 mx-0 px-4 sm:px-0 shadow-sm mt-2"
      role="region"
      aria-label="Video categories"
    >
      <ScrollArea 
        className="w-full whitespace-nowrap py-1" 
        ref={scrollAreaRef} 
        onScroll={checkScrollability}
      >
        <div 
          className="flex w-max space-x-3 pl-0 pr-6"
          role="tablist"
          aria-orientation="horizontal"
          onKeyDown={handleKeyDown}
        >
          {loading
            ? Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-10 sm:h-10 w-24 sm:w-28 rounded-full bg-muted"
                    aria-hidden="true"
                  />
                ))
            : categories.map((category, index) => {
                const isSelected = category.id === selectedCategory;
                return (
                  <button
                    key={category.id}
                    ref={getButtonRef(index)}
                    onClick={() => handleCategoryClick(category.id)}
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`panel-${category.id}`}
                    id={`tab-${category.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    className={cn(
                      "inline-flex h-10 sm:h-10 items-center justify-center rounded-full border bg-card px-4 sm:px-5 py-2 text-sm font-medium transition-colors hover:bg-accent focus:ring-0 focus:outline-none",
                      isSelected
                        ? "border-orange-500 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-500 font-semibold shadow-sm"
                        : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
      
      {/* Left scroll button */}
      <button
        onClick={scrollLeft}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/95 backdrop-blur-sm border shadow-sm z-10 transition-all hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary",
          canScrollLeft ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        aria-hidden={!canScrollLeft}
        aria-label="Scroll categories left"
        tabIndex={canScrollLeft ? 0 : -1}
        disabled={!canScrollLeft}
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      
      {/* Right scroll button */}
      <button
        onClick={scrollRight}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/95 backdrop-blur-sm border shadow-sm z-10 transition-all hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary",
          canScrollRight ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
        aria-hidden={!canScrollRight}
        aria-label="Scroll categories right"
        tabIndex={canScrollRight ? 0 : -1}
        disabled={!canScrollRight}
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  );
}
