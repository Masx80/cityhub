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
        className="relative rounded-full border-muted-foreground/20 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500 flex items-center gap-1.5 px-3 md:px-4"
      >
        <Upload className="h-5 w-5" />
        <span className="hidden md:inline font-medium">Upload</span>
      </Button>
    </Link>
  );
} 