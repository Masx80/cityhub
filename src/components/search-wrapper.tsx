"use client";

import React, { useState } from 'react';
import { SearchProvider } from '@/contexts/SearchContext';
import { useRouter, usePathname } from 'next/navigation';

interface SearchWrapperProps {
  children: React.ReactNode;
}

export default function SearchWrapper({ children }: SearchWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Use client-side navigation without refresh
    if (query) {
      // Determine if we're already on the homepage or need to redirect
      const currentPath = pathname === "/" ? "/" : "/?";
      router.push(`${currentPath}${currentPath.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`, {
        scroll: false
      });
    } else {
      // If query is empty, navigate to homepage without query params
      router.push(pathname === "/" ? "/" : "/", { 
        scroll: false 
      });
    }
  };

  return (
    <SearchProvider onSearch={handleSearch} initialQuery={searchQuery}>
      {children}
    </SearchProvider>
  );
} 