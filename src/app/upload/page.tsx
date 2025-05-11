"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { uploadVideoSchema } from "@/lib/validations/upload";
import UploadStepper from "@/components/upload/upload-stepper";
import UploadProvider from "@/components/upload/upload-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function UploadPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isSignedIn, user, isLoaded } = useUser();
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; description?: string }>
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has completed onboarding first
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function checkOnboardingStatus() {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        
        // If user doesn't exist or hasn't completed onboarding, redirect immediately
        if (!data.exists || !data.hasCompletedOnboarding) {
          toast({
            title: "Channel Required",
            description: "You need to create a channel before uploading videos",
            duration: 5000,
          });
          router.replace("/onboarding/channel");
          return;
        }
        
        // Only proceed if user exists and has completed onboarding
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify your account status",
        });
        router.replace("/");
      }
    }

    checkOnboardingStatus();
  }, [isLoaded, isSignedIn, router, toast]);

  // Fetch categories on mount
  useEffect(() => {
    if (isLoading) return;
    
    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoryList = await response.json();
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load categories.",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, [toast, isLoading]);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect=/upload");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking onboarding status
  if (!isLoaded || isLoading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not signed in, don't render anything (redirect will happen in useEffect)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-6 sm:py-8 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Upload Video
      </h1>

      {isLoadingCategories ? (
        <div className="space-y-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <UploadProvider
          userId={user.id}
          categories={categories}
          validationSchema={uploadVideoSchema}
          router={router}
        >
          <UploadStepper />
        </UploadProvider>
      )}
    </div>
  );
}
