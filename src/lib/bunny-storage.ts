// Bunny Storage client for uploading files

// Environment variables
const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || 'storage.bunnycdn.com';
const BUNNY_STORAGE_URL = process.env.BUNNY_STORAGE_URL || 'https://cityhub.b-cdn.net/';
const BUNNY_STORAGE_KEY = process.env.BUNNY_STORAGE_API_KEY || '';

// Extract storage zone from URL or use default
function getBunnyStorageZone() {
  // Extract subdomains from CDN URL if available
  try {
    if (BUNNY_STORAGE_URL) {
      const url = new URL(BUNNY_STORAGE_URL);
      const hostname = url.hostname;
      // The zone is typically the subdomain of b-cdn.net
      const match = hostname.match(/^([^.]+)\.b-cdn\.net$/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (error) {
    console.error('Failed to parse Bunny Storage URL', error);
  }
  
  // Fallback to default
  return 'cityhub';
}

const BUNNY_STORAGE_ZONE = getBunnyStorageZone();

// Generate a unique filename for uploads
export function generateUniqueFilename(originalFilename: string, userId: string, type: 'avatar' | 'banner') {
  const extension = originalFilename.split('.').pop() || 'jpg';
  const timestamp = Date.now();
  return `${type}_${userId}_${timestamp}.${extension}`;
}

// Generate Bunny Storage URL for a file
export function generateBunnyStorageUrl(filename: string) {
  return `${BUNNY_STORAGE_URL}${filename}`;
}

// Upload a file to Bunny Storage
export async function uploadToBunnyStorage(
  file: ArrayBuffer,
  filename: string
): Promise<string> {
  if (!BUNNY_STORAGE_KEY) {
    console.warn('Bunny Storage API key not found, using mock URL');
    return `${BUNNY_STORAGE_URL}${filename}`;
  }

  try {
    console.log(`Uploading ${filename} to Bunny Storage zone: ${BUNNY_STORAGE_ZONE}`);
    
    const response = await fetch(
      `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${filename}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': BUNNY_STORAGE_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: Buffer.from(file),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Bunny Storage upload failed: ${errorText}`);
      throw new Error(`Failed to upload to Bunny Storage: ${response.status} ${response.statusText}`);
    }

    console.log(`Successfully uploaded ${filename} to Bunny Storage`);
    
    // Return the CDN URL for delivery
    return generateBunnyStorageUrl(filename);
  } catch (error) {
    console.error('Error uploading to Bunny Storage:', error);
    throw error;
  }
} 