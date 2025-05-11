import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// In a real app, this would be stored in a database tied to the user ID
// For simplicity, we're using memory storage here
// You would use Redis or a DB table in production
const userSearchHistory: Record<string, string[]> = {};

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user's search history (up to 10 recent searches)
    const history = userSearchHistory[userId] || [];
    
    return NextResponse.json({
      history
    });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return NextResponse.json(
      { error: "Failed to fetch search history", history: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchTerm } = await req.json();
    
    if (!searchTerm || typeof searchTerm !== "string") {
      return NextResponse.json(
        { error: "Invalid search term" },
        { status: 400 }
      );
    }
    
    // Initialize user history if it doesn't exist
    if (!userSearchHistory[userId]) {
      userSearchHistory[userId] = [];
    }
    
    // Remove the search term if it exists to avoid duplicates
    userSearchHistory[userId] = userSearchHistory[userId]
      .filter(term => term.toLowerCase() !== searchTerm.toLowerCase());
    
    // Add the search term to the beginning of the array
    userSearchHistory[userId].unshift(searchTerm);
    
    // Keep only the 10 most recent searches
    userSearchHistory[userId] = userSearchHistory[userId].slice(0, 10);
    
    return NextResponse.json({
      success: true,
      history: userSearchHistory[userId]
    });
  } catch (error) {
    console.error("Error saving search history:", error);
    return NextResponse.json(
      { error: "Failed to save search history" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Clear user's search history
    userSearchHistory[userId] = [];
    
    return NextResponse.json({
      success: true,
      message: "Search history cleared"
    });
  } catch (error) {
    console.error("Error clearing search history:", error);
    return NextResponse.json(
      { error: "Failed to clear search history" },
      { status: 500 }
    );
  }
} 