"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { MoreHorizontal, Reply, Trash, Edit, AlertTriangle } from "lucide-react";
import { addComment, updateComment } from "@/actions/comments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: string) => void;
  videoId: string;
}

export default function CommentItem({ comment, onDelete, videoId }: CommentItemProps) {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  const isCommentOwner = isSignedIn && user?.id === comment.userId;
  
  // Format date
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { 
    addSuffix: true
  });

  // Submit a reply to this comment
  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      setIsSubmittingReply(true);
      
      const response = await addComment({
        content: replyText,
        videoId,
        parentId: comment.id,
      });
      
      if (!response.success) {
        throw new Error(response.error || "Failed to submit reply");
      }
      
      const newReply = response.comment;
      
      // Add user information for display and ensure all required fields are present
      const replyWithUser: Comment = {
        id: newReply?.id || "",
        content: newReply?.content || "",
        userId: newReply?.userId || "",
        videoId: newReply?.videoId || videoId,
        parentId: newReply?.parentId || comment.id,
        createdAt: newReply?.createdAt ? new Date(newReply.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: newReply?.updatedAt ? new Date(newReply.updatedAt).toISOString() : new Date().toISOString(),
        isEdited: newReply?.isEdited || false,
        user: {
          name: user?.fullName || "",
          imageUrl: user?.imageUrl || "",
          channelHandle: user?.username || "",
        },
      };
      
      setReplies([...replies, replyWithUser]);
      setReplyText("");
      setIsReplying(false);
      toast({
        title: "Reply posted",
        description: "Your reply has been posted successfully.",
      });
    } catch (error) {
      console.error("Error submitting reply:", error);
      toast({
        title: "Error",
        description: "Failed to post your reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Update comment
  const handleUpdateComment = async () => {
    if (!editText.trim() || editText === comment.content) {
      setIsEditing(false);
      setEditText(comment.content);
      return;
    }
    
    try {
      setIsSubmittingEdit(true);
      
      const response = await updateComment(comment.id, editText);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to update comment");
      }
      
      // Update the comment locally
      comment.content = editText;
      comment.isEdited = true;
      
      setIsEditing(false);
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({
        title: "Error",
        description: "Failed to update your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div>
      <div className="flex gap-4">
        <Link 
          href={comment.user?.channelHandle ? `/channel/${comment.user.channelHandle}` : '#'}
          className="flex-shrink-0"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.user?.imageUrl} alt={comment.user?.name || "User"} />
            <AvatarFallback>
              {(comment.user?.name || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link 
              href={comment.user?.channelHandle ? `/channel/${comment.user.channelHandle}` : '#'}
              className="font-medium text-sm hover:text-primary transition-colors"
            >
              {comment.user?.name || "Unknown User"}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formattedDate}
              {comment.isEdited && " (edited)"}
            </span>
          </div>
          
          {isEditing ? (
            <div>
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="mb-2 resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                  disabled={isSubmittingEdit}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateComment}
                  disabled={!editText.trim() || isSubmittingEdit || editText === comment.content}
                  size="sm"
                >
                  {isSubmittingEdit ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mb-2">{comment.content}</p>
          )}
          
          <div className="flex items-center gap-4">
            {isSignedIn && !isEditing && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 h-8 px-2"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </Button>
            )}
            
            {isCommentOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 h-8 px-2"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit comment
                  </DropdownMenuItem>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete comment
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete comment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your comment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(comment.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Reply form */}
          {isReplying && (
            <div className="mt-4">
              <Textarea
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="mb-2 resize-none"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText("");
                  }}
                  disabled={isSubmittingReply}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSubmittingReply}
                  size="sm"
                >
                  {isSubmittingReply ? "Replying..." : "Reply"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-14 mt-4 space-y-4 border-l-2 border-muted/30 pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-4">
              <Link 
                href={`/channel/${reply.user.channelHandle || ''}`}
                className="flex-shrink-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.user.imageUrl} alt={reply.user.name} />
                  <AvatarFallback>
                    {reply.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link 
                    href={`/channel/${reply.user.channelHandle || ''}`}
                    className="font-medium text-sm hover:text-primary transition-colors"
                  >
                    {reply.user.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    {reply.isEdited && " (edited)"}
                  </span>
                </div>
                
                <p className="text-sm">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 