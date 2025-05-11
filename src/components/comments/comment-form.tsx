"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { addComment } from "@/actions/comments";
import { useAuthPrompt } from "@/lib/hooks/use-auth-prompt";
import AuthPromptModal from "@/components/auth-prompt-modal";

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

interface CommentFormProps {
  videoId: string;
  onCommentAdded?: (comment: Comment) => void;
}

export default function CommentForm({ videoId, onCommentAdded }: CommentFormProps) {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auth prompt hook
  const { 
    isAuthPromptOpen, 
    promptType, 
    customTitle, 
    customDescription, 
    openAuthPrompt, 
    closeAuthPrompt 
  } = useAuthPrompt();

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await addComment({
        content: commentText,
        videoId
      });
      
      if (!response.success || !response.comment) {
        throw new Error(response.error || "Failed to submit comment");
      }
      
      // Make sure all required fields are present to satisfy the Comment interface
      const commentWithUser: Comment = {
        id: response.comment.id || "",
        content: response.comment.content || "",
        userId: response.comment.userId || "",
        videoId: response.comment.videoId || "",
        parentId: response.comment.parentId || null,
        createdAt: response.comment.createdAt ? new Date(response.comment.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: response.comment.updatedAt ? new Date(response.comment.updatedAt).toISOString() : new Date().toISOString(),
        isEdited: response.comment.isEdited || false,
        user: {
          name: user?.fullName || "",
          imageUrl: user?.imageUrl || "",
          channelHandle: user?.username || "",
        },
        replies: [],
      };
      
      setCommentText("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded(commentWithUser);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // For client-side handling (JavaScript enabled)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitComment();
  };

  if (!isSignedIn) {
    return (
      <>
        <div className="flex gap-4 mb-6">
          <Avatar className="h-10 w-10">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <form className="flex-1" onClick={() => openAuthPrompt("comment")}>
            <Textarea
              placeholder="Add a comment..."
              className="mb-2 resize-none cursor-pointer"
              rows={3}
              readOnly
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button"
                variant="ghost" 
                disabled
              >
                Cancel
              </Button>
              <Button 
                type="button"
                disabled
                className="bg-primary hover:bg-primary/90"
              >
                Comment
              </Button>
            </div>
          </form>
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

  return (
    <div className="flex gap-4 mb-6">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
        <AvatarFallback>
          {user?.fullName?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <form className="flex-1" onSubmit={handleSubmit}>
        <input type="hidden" name="videoId" value={videoId} />
        <Textarea
          name="content"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="mb-2 resize-none"
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <Button 
            type="button"
            variant="ghost" 
            onClick={() => setCommentText("")}
            disabled={!commentText.trim() || isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
} 