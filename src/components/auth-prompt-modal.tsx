"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionType?: "like" | "subscribe" | "comment" | "save" | "interaction";
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  title = "Sign in required",
  description,
  actionType = "interaction",
}: AuthPromptModalProps) {
  const router = useRouter();
  
  // Default descriptions based on action type
  const getDefaultDescription = () => {
    switch (actionType) {
      case "like":
        return "Sign in to like videos and help creators know what you enjoy.";
      case "subscribe":
        return "Sign in to subscribe to channels and get updates when they post new videos.";
      case "comment":
        return "Sign in to join the conversation and share your thoughts.";
      case "save":
        return "Sign in to save videos to watch later.";
      default:
        return "Sign in to unlock all features and enjoy a personalized experience.";
    }
  };

  const finalDescription = description || getDefaultDescription();

  const handleSignIn = () => {
    router.push("/auth");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{finalDescription}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-xl mb-1">🎥</div>
              <h3 className="font-semibold text-sm">Personalized Feed</h3>
            </div>
            
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-xl mb-1">💬</div>
              <h3 className="font-semibold text-sm">Join Discussions</h3>
            </div>
            
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-xl mb-1">🔔</div>
              <h3 className="font-semibold text-sm">Get Notifications</h3>
            </div>
            
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-xl mb-1">📊</div>
              <h3 className="font-semibold text-sm">Track History</h3>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="sm:w-auto w-full"
          >
            Not Now
          </Button>
          <Button 
            onClick={handleSignIn} 
            className="sm:w-auto w-full"
          >
            Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 