export const bunnyVideoLibraryId =
  process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID ?? "";
export const bunnyStreamKey = process.env.BUNNY_STREAM_KEY ?? "";
export const bunnyStreamUrl =
  process.env.BUNNY_STREAM_URL ?? "https://video.bunnycdn.com";
export const bunnyStorageApiKey = process.env.BUNNY_STORAGE_API_KEY ?? "";
export const bunnyStorageHostName = process.env.BUNNY_STORAGE_HOSTNAME ?? "";
export const bunnyStorageUrl = process.env.BUNNY_STORAGE_URL ?? "";
export const bunnyStorageZone = process.env.BUNNY_STORAGE_ZONE ?? "";
export const bunnyWebhookAPIKey = process.env.BUNNY_WEBHOOK_API_KEY ?? "";

// Get the base URL for API calls
export function getBaseUrl() {
  if (process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Browser should use relative path
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // SSR should use localhost
  return process.env.APP_URL || 'http://localhost:3000';
}

// The base URL as a constant for static contexts
export const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : process.env.APP_URL || 'http://localhost:3000');
