"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { subscribe, unsubscribe, checkSubscriptionStatus } from "@/actions/subscriptions";
import { useUser } from "@clerk/nextjs";
import AuthPromptModal from "./auth-prompt-modal";

interface SubscribeButtonProps {
  creatorId: string;
  channelName: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function SubscribeButton({
  creatorId,
  channelName,
  className = "",
  variant = "default",
  size = "sm",
}: SubscribeButtonProps) {
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

  // Check initial subscription status
  useEffect(() => {
    const checkSubStatus = async () => {
      if (isSignedIn && creatorId) {
        try {
          const response = await checkSubscriptionStatus(creatorId);
          if (response.success) {
            setIsSubscribed(response.isSubscribed || false);
          }
        } catch (error) {
          console.error("Error checking subscription status:", error);
        }
      }
    };
    
    checkSubStatus();
  }, [creatorId, isSignedIn]);

  const closeAuthPrompt = () => {
    setIsAuthPromptOpen(false);
  };

  const handleSubscribe = async () => {
    // If user is not signed in, show auth prompt
    if (!isSignedIn) {
      setIsAuthPromptOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      if (isSubscribed) {
        // Unsubscribe from channel
        const response = await unsubscribe(creatorId);
        
        if (response.success) {
          setIsSubscribed(false);
          toast({
            title: "Unsubscribed",
            description: `You have unsubscribed from ${channelName}`,
            variant: "default"
          });
        } else {
          throw new Error(response.error || "Failed to unsubscribe");
        }
      } else {
        // Subscribe to channel
        const response = await subscribe(creatorId);
        
        if (response.success) {
          setIsSubscribed(true);
          toast({
            title: "Subscribed!",
            description: `You are now subscribed to ${channelName}`,
            variant: "default"
          });
        } else {
          throw new Error(response.error || "Failed to subscribe");
        }
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong with your subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if this is the user's own channel
  const isOwnChannel = isSignedIn && user?.id === creatorId;
  
  // Don't show subscribe button for own channel
  if (isOwnChannel) return null;

  return (
    <>
      <Button
        className={`${isSubscribed 
          ? "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600" 
          : "bg-primary hover:bg-primary/90 text-white"} ${className}`}
        onClick={handleSubscribe}
        disabled={isLoading}
        size={size}
        variant={isSubscribed ? "outline" : variant}
      >
        {isLoading ? (
          "Loading..."
        ) : (
          isSubscribed ? "Subscribed" : "Subscribe"
        )}
      </Button>

      {/* Auth prompt modal */}
      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={closeAuthPrompt}
        actionType="subscribe"
      />
    </>
  );
} 