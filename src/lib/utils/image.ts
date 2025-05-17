/**
 * Ensures that an image URL is properly formatted
 * Handles various URL formats including data URLs, absolute URLs, and relative paths
 * @param url The input URL to process
 * @returns A properly formatted URL
 */
export function ensureValidImageUrl(url: string): string {
  if (!url) return '';
  
  // If it's a data URL, return it as is
  if (url.startsWith('data:')) {
    return url;
  }
  
  // If it already has https://, it should be ok
  if (url.startsWith('https://') || url.startsWith('http://')) {
    // But check for the common mistake where domain and path are joined without a slash
    const domainMatch = url.match(/https:\/\/sexcityhub\.b-cdn\.net([^\/])/);
    if (domainMatch) {
      return url.replace(/sexcityhub\.b-cdn\.net/, 'sexcityhub.b-cdn.net/');
    }
    return url;
  }
  
  // If it starts with a slash, it's a local file
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, add the domain
  return `https://sexcityhub.b-cdn.net/${url}`;
} 