import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// In a production app, this would be a secure environment variable
const ADMIN_SECRET_KEY = "your-secret-admin-key";

export async function POST(req: NextRequest) {
  try {
    const { clerkId, secretKey } = await req.json();

    // Validate the request
    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if the admin key is valid
    if (secretKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the user and update their admin status
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update the user's admin status
    await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.clerkId, clerkId));

    return NextResponse.json(
      { success: true, message: "User is now an admin" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error making user admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { clerkId, secretKey } = await req.json();

    // Validate the request
    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if the admin key is valid
    if (secretKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the user and update their admin status
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update the user's admin status
    await db
      .update(users)
      .set({ isAdmin: false })
      .where(eq(users.clerkId, clerkId));

    return NextResponse.json(
      { success: true, message: "User is no longer an admin" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing admin privileges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 