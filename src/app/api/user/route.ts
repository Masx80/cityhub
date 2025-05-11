import { auth } from "@clerk/nextjs/server";
import { findUserByClerkId, createUser, hasCompletedOnboarding } from "@/lib/user";
import { NextResponse } from "next/server";

// GET: Check if user exists and has completed onboarding
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    
    const user = await findUserByClerkId(userId);
    const hasOnboarded = await hasCompletedOnboarding(userId);
    
    // Add caching headers
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=300'); // Cache for 5 minutes
    
    return new NextResponse(
      JSON.stringify({
        exists: !!user,
        hasCompletedOnboarding: hasOnboarded,
      }),
      { 
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    
    const { name, imageUrl } = await request.json();
    
    if (!name) {
      return new NextResponse(JSON.stringify({ error: "Name is required" }), {
        status: 400,
      });
    }
    
    const user = await createUser({
      clerkId: userId,
      name,
      imageUrl: imageUrl || '/placeholder-user.jpg',
    });
    
    // Explicitly include the hasCompletedOnboarding status in the response
    return new NextResponse(
      JSON.stringify({
        ...user,
        hasCompletedOnboarding: user?.hasCompletedOnboarding || false
      }), 
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
} 