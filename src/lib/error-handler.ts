/**
 * Generic error handler for server actions and API routes
 */
export function errorHandler(error: unknown, defaultMessage: string = "Something went wrong") {
  console.error(error);
  
  // Format the error for client-side consumption
  if (error instanceof Error) {
    return {
      success: false,
      message: error.message || defaultMessage,
      error: process.env.NODE_ENV === "development" ? error : null
    };
  }
  
  // For unknown error types
  return {
    success: false,
    message: defaultMessage,
    error: process.env.NODE_ENV === "development" ? String(error) : null
  };
}

/**
 * Helper to handle errors in try/catch blocks and provide standardized responses
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage: string = "An error occurred"
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    console.error(errorMessage, error);
    const message = error instanceof Error ? error.message : errorMessage;
    return { data: null, error: message };
  }
} 