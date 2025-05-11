// Utility for getting reliable timestamps accounting for time drift

/**
 * Gets a reliable timestamp from the server or uses a safe local timestamp
 * with enough buffer to avoid expiration issues.
 * 
 * @returns Promise<number> - Unix timestamp in seconds with buffer
 */
export async function getReliableTimestamp(): Promise<number> {
  try {
    // Try to get server time first
    const response = await fetch("/api/server-time");
    if (response.ok) {
      const data = await response.json();
      const serverTime = Math.floor(data.timestamp / 1000);
      console.log(`Using server time: ${serverTime}, local time: ${Math.floor(Date.now() / 1000)}`);
      return serverTime;
    } else {
      throw new Error("Failed to get server time");
    }
  } catch (error) {
    console.error("Error getting server time:", error);
    // Fallback to client time with extra buffer
    // Use a massive buffer (24 hours) to ensure it's valid
    const safeTime = Math.floor(Date.now() / 1000) + 86400;
    console.log(`Using fallback time with buffer: ${safeTime}`);
    return safeTime;
  }
} 