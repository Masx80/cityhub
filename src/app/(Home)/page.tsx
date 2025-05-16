import PageTransition from "@/components/page-transition";
import HomepageClient from "@/components/homepage-client";
import type { Metadata } from "next";
import Script from 'next/script';

// Define metadata for SEO
export const metadata: Metadata = {
  title: "SexCity Hub - Free Adult Videos and XXX Content",
  description: "Watch free adult videos on SexCity Hub. Browse our vast collection of high-quality XXX content, featuring the hottest adult performers and categories.",
  keywords: "adult videos, xxx videos, porn videos, free porn, adult content streaming, sex videos, adult entertainment",
  openGraph: {
    title: "SexCity Hub - Free Adult Videos and XXX Content",
    description: "Watch free adult videos on SexCity Hub. Browse our vast collection of high-quality XXX content.",
    url: "https://sexcityhub.com",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SexCity Hub - Adult Videos",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SexCity Hub - Free Adult Videos",
    description: "Watch free adult videos on SexCity Hub. Browse our vast collection of high-quality XXX content.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://sexcityhub.com",
  }
};

// Define interfaces for the server component to match what HomepageClient expects
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

interface Category {
  id: string;
  name: string;
  icon?: string;
  slug?: string;
  description?: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalVideos: number;
  hasMore: boolean;
}

interface SearchParamsData {
  q?: string;
  categoryId?: string;
  page?: string;
}

// Server component that fetches initial data
export default async function Home({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParamsData>
}) {
  // Await the searchParams Promise
  const params = await searchParams;
  
  // Access properties from the resolved Promise
  const query = params.q || "";
  const categoryId = params.categoryId || "all";
  const pageStr = params.page || "1";
  const page = parseInt(pageStr, 10);
  
  // Fetch initial data server-side
  let initialVideos: Video[] = [];
  let initialCategories: Category[] = [];
  let initialPagination: PaginationData = {
    currentPage: page,
    totalPages: 1,
    totalVideos: 0,
    hasMore: false
  };
  let initialError = null;
  
  try {
    // Build the API URL with query parameters for server-side fetch
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    // Fetch categories first since they don't depend on other params
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`, { 
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        // Add "All" category
        initialCategories = [{ id: "all", name: "All" }, ...categoriesData];
      } else {
        initialCategories = [{ id: "all", name: "All" }];
      }
    } else {
      initialCategories = [{ id: "all", name: "All" }];
    }
    
    // Fetch videos
    const urlParams = new URLSearchParams();
    urlParams.append("page", page.toString());
    if (categoryId !== "all") {
      urlParams.append("categoryId", categoryId);
    }
    if (query) {
      urlParams.append("q", query);
    }
    
    const videosUrl = `${baseUrl}/api/videos?${urlParams.toString()}`;
    const response = await fetch(videosUrl, { 
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch videos. Status: ${response.status}`);
    }
    
    const data = await response.json();
    initialVideos = data.videos || [];
    initialPagination = data.pagination || initialPagination;
  } catch (error) {
    console.error("Error during server-side fetch:", error);
    initialError = {
      message: error instanceof Error ? error.message : "Failed to load initial data"
    };
    // Set default categories when fetch fails if not already set
    if (initialCategories.length === 0) {
      initialCategories = [{ id: "all", name: "All" }];
    }
  }

  // Create structured data for website
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SexCity Hub",
    "url": "https://sexcityhub.com",
    "description": "Watch free adult videos on SexCity Hub. Browse our vast collection of high-quality XXX content, featuring the hottest adult performers and categories.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://sexcityhub.com?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SexCity Hub",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sexcityhub.com/main-logo.svg",
        "width": 600,
        "height": 60
      }
    }
  };

  // Pass all initial data to the client component
  return (
    <PageTransition>
      {/* Add structured data for SEO */}
      <Script
        id="website-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container px-4 pt-1 pb-2 md:pb-3">
        <HomepageClient 
          initialVideos={initialVideos}
          initialCategories={initialCategories}
          initialPagination={initialPagination}
          initialError={initialError}
          initialQuery={query}
          initialCategoryId={categoryId}
          initialPage={page}
        />
      </div>
    </PageTransition>
  );
}
