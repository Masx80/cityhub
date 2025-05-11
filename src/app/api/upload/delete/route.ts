import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the URL from the request body
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract the path from the URL
    // Example URL: https://storage.bunnycdn.com/{storageZoneName}/{path}
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Remove the first part (empty string due to leading slash) and the storage zone name
    pathParts.splice(0, 2);
    
    // Reconstruct the path
    const path = pathParts.join('/');

    if (!path) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Delete from Bunny storage
    const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
    const accessKey = process.env.BUNNY_STORAGE_API_KEY;

    if (!storageZoneName || !accessKey) {
      return NextResponse.json({ error: "Storage configuration missing" }, { status: 500 });
    }

    const deleteResponse = await fetch(
      `https://storage.bunnycdn.com/${storageZoneName}/${path}`,
      {
        method: "DELETE",
        headers: {
          AccessKey: accessKey,
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error(`Error deleting from storage: ${errorText}`);
      
      // Return success even if file doesn't exist (404)
      if (deleteResponse.status === 404) {
        return NextResponse.json({ success: true });
      }
      
      return NextResponse.json(
        { error: "Failed to delete file from storage" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 