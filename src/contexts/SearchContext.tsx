"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  handleSearch: (query: string) => void;
  searchQuery: string;
}

// Create context with default values
const SearchContext = createContext<SearchContextType>({
  handleSearch: () => {},
  searchQuery: '',
});

// Hook to use the search context
export const useSearch = () => useContext(SearchContext);

interface SearchProviderProps {
  children: ReactNode;
  onSearch: (query: string) => void;
  initialQuery?: string;
}

// Provider component
export const SearchProvider: React.FC<SearchProviderProps> = ({ 
  children, 
  onSearch,
  initialQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <SearchContext.Provider value={{ handleSearch, searchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}; 