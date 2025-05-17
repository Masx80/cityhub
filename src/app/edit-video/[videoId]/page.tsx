"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

// Ensure URLs are properly formatted
function ensureValidImageUrl(url: string): string {
  if (!url) return '';
  
  // If it already has https://, it should be ok
  if (url.startsWith('https://') || url.startsWith('http://')) {
    // But check for the common mistake where domain and path are joined without a slash
    const domainMatch = url.match(/https:\/\/sexcityhub\.b-cdn\.net([^\/])/);
    if (domainMatch) {
      return url.replace(/sexcityhub\.b-cdn\.net/, 'sexcityhub.b-cdn.net/');
    }
    return url;
  }
  
  // If it starts with a slash, it's a local file
  if (url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, add the domain
  return `https://sexcityhub.b-cdn.net/${url}`;
}

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  visibility: string;
  channel: {
    id: string;
    name: string;
    avatar?: string;
    handle?: string;
  };
}

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const videoId = params?.videoId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    visibility: "public"
  });
  
  // Fetch video details
  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!videoId) return;
      
      setLoading(true);
      
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Video not found");
            router.push("/");
            return;
          }
          
          if (response.status === 403) {
            toast.error("You don't have permission to edit this video");
            router.push(`/watch/${videoId}`);
            return;
          }
          
          throw new Error("Failed to fetch video details");
        }
        
        const data = await response.json();
        
        if (data && data.video) {
          setVideoDetails(data.video);
          setFormData({
            title: data.video.title || "",
            description: data.video.description || "",
            category: data.video.category || "",
            tags: data.video.tags?.join(", ") || "",
            visibility: data.video.visibility || "public"
          });
        } else {
          throw new Error("Invalid video data received");
        }
      } catch (error) {
        console.error("Error fetching video details:", error);
        toast.error("Failed to load video information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoDetails();
  }, [videoId, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Convert tags from comma-separated string to array
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
      
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update video");
      }
      
      toast.success("Video updated successfully");
      
      // Redirect to video page
      router.push(`/watch/${videoId}`);
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("Failed to update video");
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete video");
      }
      
      toast.success("Video deleted successfully");
      
      // Redirect to channel page
      if (videoDetails?.channel?.id) {
        router.push(`/channel/${videoDetails.channel.id}`);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };
  
  // Handle cancel - redirect back to video or channel
  const handleCancel = () => {
    if (videoDetails && videoDetails.id) {
      router.push(`/watch/${videoDetails.id}`);
    } else if (videoDetails && videoDetails.channel) {
      router.push(`/channel/${videoDetails.channel.handle || videoDetails.channel.id}`);
    } else {
      router.push('/');
    }
  };
  
  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col space-y-8 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="bg-muted rounded-full h-10 w-10"></div>
            <div className="h-8 bg-muted rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 bg-muted rounded w-full"></div>
              <div className="h-36 bg-muted rounded w-full"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </div>
            <div className="aspect-video bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!videoDetails) {
    return (
      <div className="container max-w-6xl py-16 text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Video Not Found</h1>
        <p className="text-muted-foreground mb-6">The video you're trying to edit doesn't exist or you don't have permission to edit it.</p>
        <Button onClick={() => router.push("/")}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Video</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>
                Update your video information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title for your video"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your video to viewers..."
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="vlog">Vlog</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select 
                    value={formData.visibility} 
                    onValueChange={(value) => handleSelectChange("visibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Separate tags with commas"
                />
                <p className="text-xs text-muted-foreground">
                  Adding relevant tags can help viewers find your video more easily
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Video
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-xl">Delete Video?</DialogTitle>
                    <DialogDescription className="py-4">
                      This action cannot be undone. The video will be permanently removed from your channel and the platform.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setConfirmDelete(false)}
                      className="sm:mr-2"
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Confirm Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                className="w-full sm:w-auto gap-2" 
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
              <CardDescription>
                How your video appears to viewers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md overflow-hidden relative mb-4">
                {videoDetails.thumbnail ? (
                  <Image
                    src={ensureValidImageUrl(videoDetails.thumbnail)}
                    alt={videoDetails.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">No thumbnail</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium line-clamp-2">{formData.title || videoDetails.title}</h3>
                {formData.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {formData.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {videoDetails.channel?.avatar ? (
                    <Image
                      src={ensureValidImageUrl(videoDetails.channel.avatar)}
                      alt={videoDetails.channel.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                      {videoDetails.channel?.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <span className="text-sm">{videoDetails.channel?.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 