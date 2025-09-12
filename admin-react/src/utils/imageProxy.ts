/**
 * Convert image URLs to proxied URLs that bypass CSP restrictions
 */
export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;
  
  // Define URLs that need to be proxied to bypass CSP
  const needsProxy = [
    'http://localhost:3001/',
    'https://images.unsplash.com/',
    'https://unsplash.com/',
    'https://via.placeholder.com/'
  ];
  
  const shouldProxy = needsProxy.some(domain => originalUrl.startsWith(domain));
  
  if (shouldProxy) {
    return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  }
  
  // For other URLs (like data: or blob: URLs), return as-is
  return originalUrl;
}