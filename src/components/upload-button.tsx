"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export function UploadButton() {
  const { isSignedIn, isLoaded } = useUser();
  const { toast } = useToast();
  
  // Determine the correct link href based on user status
  const getUploadLink = () => {
    // If not signed in, go to auth page
    if (!isLoaded || !isSignedIn) {
      return "/auth";
    }
    
    // Otherwise, go directly to upload page
    return "/upload";
  };

  return (
    <Link href={getUploadLink()} passHref>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center justify-center rounded-full border-muted-foreground/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-500 transition-colors min-w-10 h-10 sm:h-auto"
      >
        <Upload className="h-5 w-5" />
        <span className="hidden md:inline ml-1">Upload</span>
      </Button>
    </Link>
  );
} 