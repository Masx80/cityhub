"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const { handleRedirectCallback, user, isSignedIn } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (redirecting) return; // Prevent multiple redirects

    async function handleSSOCallback() {
      try {
        // Only handle callback if not already done
        if (!isSignedIn && !user) {
          await handleRedirectCallback({redirectUrl: window.location.href});
        }
        
        // If we still don't have a user, we can't proceed
        if (!user) return;
        
        setRedirecting(true); // Prevent further redirects
        
        // Check if user exists in our database and has completed onboarding
        const response = await fetch("/api/user");
        const data = await response.json();
        
        if (!data.exists) {
          // User doesn't exist in our database yet, create them
          const createResponse = await fetch("/api/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.emailAddresses[0]?.emailAddress || 'User',
              imageUrl: user.imageUrl,
            }),
          });
          
          if (!createResponse.ok) {
            throw new Error("Failed to create user account");
          }
        }
        
        // Always redirect to home after successful authentication
        window.location.href = "/";
      } catch (error) {
        console.error("SSO Callback Error:", error);
        setError("Failed to authenticate. Please try again.");
        window.location.href = "/auth";
      } finally {
        setIsLoading(false);
      }
    }

    // Run callback immediately when component mounts
    handleSSOCallback();
  }, [handleRedirectCallback, user, isSignedIn, redirecting]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.href = '/auth'} 
          className="text-primary hover:underline"
        >
          Return to login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground">Finalizing your sign-in...</p>
    </div>
  );
}
