"use server";
import {
  bunnyStorageApiKey,
  bunnyStorageHostName,
  bunnyStorageUrl,
  bunnyStorageZone,
  bunnyStreamKey,
  bunnyStreamUrl,
  bunnyVideoLibraryId,
} from "@/config";
import crypto from "crypto";

export async function getPresignedSignature(
  videoId: string,
  expiresIn: number
) {
  const data =
    bunnyVideoLibraryId + bunnyStreamKey + expiresIn.toString() + videoId;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function createVideo(title: string) {
  try {
    const uniqueTitle = `${title}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const res = await fetch(
      `${bunnyStreamUrl}/library/${bunnyVideoLibraryId}/videos`,
      {
        method: "POST",
        body: JSON.stringify({ title: uniqueTitle }),
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          AccessKey: bunnyStreamKey,
        },
      }
    );

    if (!res.ok) {
      return { message: res.statusText };
    }

    const result = await res.json();
    return { data: result, message: "Success" };
  } catch (error: any) {
    console.error("Error creating video:", error.message);
    return { message: "Failed to create video" };
  }
}

export async function uploadVideoThumbnail(
  file: File,
  videoId: string,
  filename: string,
  prevThumbnail?: string | null
) {
  try {
    const res = await fetch(
      `https://${bunnyStorageHostName}/${bunnyStorageZone}/${videoId}/${filename}`,
      {
        method: "PUT",
        body: file,
        headers: {
          "content-type": "application/octet-stream",
          AccessKey: bunnyStorageApiKey,
        },
      }
    );

    if (!res.ok) {
      return { message: "Failed to upload thumbnail" };
    }

    const fileUrl = `${bunnyStorageUrl}/${videoId}/${filename}`;
    const result = await updateVideoThumbnail(videoId, fileUrl);

    if (!result.data) {
      await deleteBunnyFile(videoId, filename);
      return { message: "Failed to update thumbnail" };
    }

    if (prevThumbnail) {
      await deleteBunnyFile(videoId, prevThumbnail);
    }

    return {
      data: {
        videoId,
        filename,
        url: fileUrl,
        thumbnail: `${videoId}/${filename}`,
      },
      message: "Thumbnail uploaded",
    };
  } catch (error: any) {
    console.error("Error uploading thumbnail:", error.message);
    return { message: "Failed to upload thumbnail" };
  }
}

export async function updateVideoThumbnail(
  videoId: string,
  thumbnailUrl: string
) {
  try {
    const res = await fetch(
      `${bunnyStreamUrl}/library/${bunnyVideoLibraryId}/videos/${videoId}/thumbnail?thumbnailUrl=${encodeURIComponent(
        thumbnailUrl
      )}`,
      {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          AccessKey: bunnyStreamKey,
        },
      }
    );

    const result = await res.json();
    return { data: result, message: result.message || "Success" };
  } catch (error: any) {
    console.error("Error updating thumbnail:", error.message);
    return { message: "Failed to update thumbnail" };
  }
}

export async function deleteBunnyFile(path: string, filename: string) {
  try {
    const res = await fetch(
      `https://${bunnyStorageHostName}/${bunnyStorageZone}/${path}/${filename}`,
      {
        method: "DELETE",
        headers: {
          "content-type": "application/octet-stream",
          AccessKey: bunnyStorageApiKey,
        },
      }
    );

    if (!res.ok) {
      return { message: "Failed to delete file" };
    }

    return { data: { path, filename }, message: "File deleted" };
  } catch (error: any) {
    console.error("Error deleting file:", error.message);
    return { message: "Failed to delete file" };
  }
}
