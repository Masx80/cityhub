"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import CommentItem from "./comment-item";
import CommentForm from "./comment-form";
import { addComment, getVideoComments, deleteComment } from "@/actions/comments";

interface Comment {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  user: {
    name: string;
    imageUrl: string;
    channelHandle?: string;
  };
  replies?: Comment[];
}

interface CommentsSectionProps {
  videoId: string;
}

export default function CommentsSection({ videoId }: CommentsSectionProps) {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch comments for the video using server action
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching comments for videoId:", videoId);
      
      const response = await getVideoComments(videoId);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch comments");
      }
      
      const data = response.comments || [];
      console.log("Comments loaded successfully:", data.length);
      
      // Add fallback user information if it's missing
      const processedComments = data.map((comment: any) => ({
        ...comment,
        user: comment.user || {
          name: "Unknown User",
          imageUrl: "",
          channelHandle: "",
        },
        replies: Array.isArray(comment.replies) ? comment.replies : [],
      }));
      
      setComments(processedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [videoId, toast]);

  // Delete a comment using server action
  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await deleteComment(commentId);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to delete comment");
      }
      
      // Remove the deleted comment from state
      setComments(comments.filter(comment => comment.id !== commentId));
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete your comment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle new comment added
  const handleCommentAdded = (newComment: Comment) => {
    setComments([newComment, ...comments]);
  };

  // Load comments when component mounts
  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId, fetchComments]);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">
        {loading ? "Comments" : `${comments.length} Comments`}
      </h2>
      
      {/* Comment form with progressive enhancement */}
      <CommentForm 
        videoId={videoId} 
        onCommentAdded={handleCommentAdded} 
      />
      
      {/* Comments list */}
      {loading ? (
        // Loading skeletons
        <div className="space-y-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
                videoId={videoId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
} 