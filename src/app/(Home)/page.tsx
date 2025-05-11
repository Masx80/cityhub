import PageTransition from "@/components/page-transition";
import HomepageClient from "@/components/homepage-client";

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

  // Pass all initial data to the client component
  return (
    <PageTransition>
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
