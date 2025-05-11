"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, ThumbsDown, Share2, Flag, Clock, BellIcon, BellOff, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { likeVideo, unlikeVideo, getLikeStatus } from "@/actions/likes";
import { dislikeVideo, undislikeVideo } from "@/actions/dislikes";
import { subscribe, unsubscribe, checkSubscriptionStatus } from "@/actions/subscriptions";
import { addToWatchLater, removeFromWatchLater, checkWatchLaterStatus } from "@/actions/watch-later";
import { useAuthPrompt } from "@/lib/hooks/use-auth-prompt";
import AuthPromptModal from "@/components/auth-prompt-modal";

interface ClientVideoActionsProps {
  videoId: string;
  videoTitle: string;
  channelName: string;
  creatorId: string;
  channelHandle?: string;
  initialLikes: number;
}

export default function ClientVideoActions({
  videoId,
  videoTitle,
  channelName,
  creatorId,
  channelHandle,
  initialLikes,
}: ClientVideoActionsProps) {
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(0);
  
  // Auth prompt hook
  const { 
    isAuthPromptOpen, 
    promptType, 
    customTitle, 
    customDescription, 
    openAuthPrompt, 
    closeAuthPrompt, 
    handleAuthAction 
  } = useAuthPrompt();
  
  // Check if current user is the creator of the video
  const isCreator = isSignedIn && user?.id === creatorId;

  // Check if user is already subscribed and if video is liked/disliked when component mounts
  useEffect(() => {
    if (isSignedIn && user?.id) {
      if (creatorId && !isCreator) {
        checkSubStatus();
      }
      checkLikeStatus();
      checkSaveStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user?.id, creatorId, isCreator, videoId]);

  // Function to check subscription status
  const checkSubStatus = async () => {
    try {
      if (creatorId && !isCreator) {
        const response = await checkSubscriptionStatus(creatorId);
        if (response.success) {
          setIsSubscribed(response.isSubscribed ?? false);
        }
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  };

  // Function to check like/dislike status
  const checkLikeStatus = async () => {
    try {
      const response = await getLikeStatus(videoId);
      if (response.success) {
        setIsLiked(response.isLiked ?? false);
        setIsDisliked(response.isDisliked ?? false);
        setLikes(response.likeCount ?? 0);
        setDislikes(response.dislikeCount ?? 0);
      }
    } catch (error) {
      console.error("Error checking like/dislike status:", error);
    }
  };

  // Function to check if video is in watch later
  const checkSaveStatus = async () => {
    try {
      const response = await checkWatchLaterStatus(videoId);
      if (response.success) {
        setIsSaved(response.inWatchLater);
      }
    } catch (error) {
      console.error("Error checking save status:", error);
    }
  };

  const handleLike = async () => {
    if (!handleAuthAction(!!isSignedIn, "like", async () => {
      setLikeLoading(true);

      try {
        if (isLiked) {
          // Unlike video
          const response = await unlikeVideo(videoId);

          if (response.success) {
            setIsLiked(false);
            setLikes(response.likeCount ?? 0);
            setDislikes(response.dislikeCount ?? 0);
            
            toast({
              title: "Like removed",
              description: "This video has been removed from your liked videos",
              variant: "default"
            });
          } else {
            throw new Error(response.error || "Failed to unlike video");
          }
        } else {
          // Like video
          const response = await likeVideo(videoId);

          if (response.success) {
            setIsLiked(true);
            setIsDisliked(false); // Server action automatically removes dislike
            setLikes(response.likeCount ?? 0);
            setDislikes(response.dislikeCount ?? 0);
            
            toast({
              title: "Video liked",
              description: "This video has been added to your liked videos",
              variant: "default"
            });
          } else {
            throw new Error(response.error || "Failed to like video");
          }
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
        console.error("Like/unlike error:", error);
      } finally {
        setLikeLoading(false);
      }
    })) return;
  };

  const handleDislike = async () => {
    if (!handleAuthAction(!!isSignedIn, "like", async () => {
      setDislikeLoading(true);

      try {
        if (isDisliked) {
          // Remove dislike
          const response = await undislikeVideo(videoId);

          if (response.success) {
            setIsDisliked(false);
            setLikes(response.likeCount ?? 0);
            setDislikes(response.dislikeCount ?? 0);
            
            toast({
              title: "Dislike removed",
              description: "Dislike has been removed from this video",
              variant: "default"
            });
          } else {
            throw new Error(response.error || "Failed to remove dislike");
          }
        } else {
          // Dislike video
          const response = await dislikeVideo(videoId);

          if (response.success) {
            setIsDisliked(true);
            setIsLiked(false); // Server action automatically removes like
            setLikes(response.likeCount ?? 0);
            setDislikes(response.dislikeCount ?? 0);
            
            toast({
              title: "Video disliked",
              description: "You have disliked this video",
              variant: "default"
            });
          } else {
            throw new Error(response.error || "Failed to dislike video");
          }
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
        console.error("Dislike error:", error);
      } finally {
        setDislikeLoading(false);
      }
    })) return;
  };

  const handleSave = async () => {
    if (!handleAuthAction(!!isSignedIn, "save", async () => {
      try {
        if (isSaved) {
          // Remove from watch later
          const response = await removeFromWatchLater(videoId);
          
          if (response.success) {
            setIsSaved(false);
            toast({
              title: "Removed from Watch Later",
              description: "This video has been removed from your Watch Later playlist",
              variant: "default"
            });
          } else {
            console.error("Error removing from Watch Later:", response.error);
            toast({
              title: "Error",
              description: response.error || "Failed to remove from Watch Later",
              variant: "destructive"
            });
          }
        } else {
          // Add to watch later
          const response = await addToWatchLater(videoId);
          
          if (response.success) {
            setIsSaved(true);
            toast({
              title: "Saved to Watch Later",
              description: "This video has been added to your Watch Later playlist",
              variant: "default"
            });
          } else {
            console.error("Error adding to Watch Later:", response.error);
            toast({
              title: "Error",
              description: response.error || "Failed to save to Watch Later",
              variant: "destructive"
            });
          }
        }
      } catch (error: any) {
        console.error("Save error:", error);
        toast({
          title: "Error",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    })) return;
  };

  const handleSubscribe = async () => {
    if (!handleAuthAction(!!isSignedIn, "subscribe", async () => {
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
    })) return;
  };

  const handleShare = () => {
    // Copy the current URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Video link copied to clipboard",
          variant: "default"
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard",
          variant: "destructive"
        });
      });
  };

  return (
    <>
      <div className="flex items-center gap-1 flex-wrap w-full">
        <div className="flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-l-full px-3 ${isLiked ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-600 dark:text-zinc-400"}`}
            onClick={handleLike}
            disabled={likeLoading || dislikeLoading}
          >
            <ThumbsUp className={`h-5 w-5 mr-1 ${isLiked ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </Button>
          <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700"></div>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-r-full px-3 ${isDisliked ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-600 dark:text-zinc-400"}`}
            onClick={handleDislike}
            disabled={likeLoading || dislikeLoading}
          >
            <ThumbsDown className={`h-5 w-5 ${isDisliked ? "fill-current" : ""}`} />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={`rounded-full bg-zinc-100 dark:bg-zinc-800 ${isSaved ? "text-zinc-900 dark:text-zinc-100 font-medium" : "text-zinc-600 dark:text-zinc-400"} hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3`}
          onClick={handleSave}
        >
          <Clock className={`h-5 w-5 mr-1 ${isSaved ? "fill-current" : ""}`} />
          Save
        </Button>

        <div className="ml-auto">
          {!isCreator ? (
            <Button
              className={`${isSubscribed 
                ? "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600" 
                : "bg-red-600 hover:bg-red-700 text-white"}`}
              onClick={handleSubscribe}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Link href={`/edit-video/${videoId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </Button>
              </Link>
              <Link href={`/channel/${channelHandle || creatorId}`}>
                <Button
                  className="bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                  size="sm"
                >
                  <User className="h-4 w-4 mr-1" />
                  Manage Videos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Auth prompt modal */}
      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={closeAuthPrompt}
        actionType={promptType}
        title={customTitle}
        description={customDescription}
      />
    </>
  );
} 