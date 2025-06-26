// Configuration utility for dynamic API URLs
// This allows the app to work on mobile devices when accessed via network IP

/**
 * Get the API base URL dynamically based on the current host
 * This handles both localhost development and network access (mobile devices)
 */
export const getApiBaseUrl = (): string => {
  // Get the current host (e.g., localhost:5173 or 192.168.1.100:5173)
  const currentHost = window.location.host;
  
  // Extract the hostname without port (e.g., localhost or 192.168.1.100)
  const hostname = window.location.hostname;
  
  // Use port 8000 for the API server
  const apiPort = '8000';
  
  // Construct the API base URL
  const apiBaseUrl = `http://${hostname}:${apiPort}`;
  
  // Debug logging
  console.log('🔧 API Configuration Debug:');
  console.log('  Current Host:', currentHost);
  console.log('  Hostname:', hostname);
  console.log('  API Base URL:', apiBaseUrl);
  
  return apiBaseUrl;
};

/**
 * Get the full URL for API endpoints
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;
  
  // Debug logging
  console.log(`🌐 API Call: ${endpoint} -> ${fullUrl}`);
  
  return fullUrl;
};

/**
 * Get the full URL for static assets (uploads, qr codes)
 */
export const getAssetUrl = (assetPath: string): string => {
  const baseUrl = getApiBaseUrl();
  // Ensure assetPath starts with /
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${baseUrl}${cleanPath}`;
}; 