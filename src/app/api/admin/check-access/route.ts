import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    // Get the current user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find the user in the database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if the user is an admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 403 }
      );
    }

    // Return success if the user is an admin
    return NextResponse.json(
      { success: true, isAdmin: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking admin access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 