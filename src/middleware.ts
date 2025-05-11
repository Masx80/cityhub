import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Protect these routes (including subroutes)
const isProtectedRoute = createRouteMatcher([
  "/upload",
  "/liked",
  "/watch-later",
  "/settings",
  "/history",
  "/channel(.*)", // <- notice the (.*) to match subroutes too
  // "/subscriptions(.*)" has been removed to make it public
]);

const isAuthRoute = createRouteMatcher(["/auth"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);
const isApiRoute = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If logged in and trying to access /auth, redirect to homepage
  if (userId && isAuthRoute(req)) {
    console.log(`Logged-in user (${userId}) attempted to access /auth - redirecting to homepage`);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check if user has already completed onboarding when trying to access onboarding routes
  if (userId && isOnboardingRoute(req)) {
    try {
      // Find the user record in our database
      const [userRecord] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))
        .limit(1);

      // If user exists and has completed onboarding, redirect to homepage
      if (userRecord && userRecord.hasCompletedOnboarding) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Otherwise, allow access to onboarding
      return NextResponse.next();
    } catch (error) {
      console.error("Error checking onboarding status in middleware:", error);
      // On error, allow access to onboarding by default
      return NextResponse.next();
    }
  }

  // If user is not authenticated and trying to access a protected route, redirect to auth
  if (!userId && isProtectedRoute(req) && !isApiRoute(req)) {
    console.log("Unauthenticated user attempting to access protected route, redirecting to /auth");
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
