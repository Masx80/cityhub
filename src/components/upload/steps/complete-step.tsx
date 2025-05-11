"use client";
import { CheckCircle2, Copy, Share2, Eye, ArrowRight, Edit, Play, Facebook, Twitter, Linkedin, Link as LinkIcon, Upload, LayoutGrid, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/components/upload/upload-provider";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function CompleteStep() {
  const { videoDetails } = useUpload();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  
  // Real video URL for the watch page
  const videoUrl = `/watch/${videoDetails.videoId}`;
  
  const handleCopyLink = () => {
    // Using the full URL including domain for sharing
    const fullUrl = `${window.location.origin}${videoUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast({
      title: "Link copied",
      description: "Video link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = (platform: string) => {
    toast({
      title: `Share on ${platform}`,
      description: "Sharing functionality would open here",
    });
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Success banner */}
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="flex justify-center mb-4"
        >
          <div className="bg-white dark:bg-green-900/50 h-20 w-20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-2 text-green-800 dark:text-green-400">
            Video Published Successfully!
          </h2>
          <p className="text-green-700 dark:text-green-300 max-w-md mx-auto">
            Your video "{videoDetails.title || "Untitled"}" has been published and is now available for viewing.
          </p>
        </motion.div>
      </div>
      
      {/* Video details and preview */}
      <div className="grid md:grid-cols-5 gap-6">
        {/* Video preview card */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Video Preview</CardTitle>
            <CardDescription>Here's how your video appears to viewers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative group border">
              {videoDetails.selectedThumbnail ? (
                <img 
                  src={videoDetails.selectedThumbnail} 
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-black">
                  <p className="text-muted-foreground">No thumbnail available</p>
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-8 w-8 fill-black text-black ml-1" />
                </div>
              </div>
            </div>
            
            <div className="mt-3">
              <h3 className="font-medium text-lg line-clamp-1">{videoDetails.title || "Untitled Video"}</h3>
              {videoDetails.description && (
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {videoDetails.description}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="text-sm text-muted-foreground">
              <span>Just now • 0 views</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(videoUrl)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/edit-video/${videoDetails.videoId}`)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Share and next steps */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Video</CardTitle>
              <CardDescription>Let others discover your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="border rounded-md flex-1 flex items-center px-3 py-2 bg-muted/30 overflow-hidden">
                  <span className="text-sm truncate text-muted-foreground">{window.location.origin}{videoUrl}</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleCopyLink}
                        className={copied ? "text-green-500 border-green-500" : ""}
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy link to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 dark:border-blue-900/50 dark:text-blue-400"
                        onClick={() => handleShare("Facebook")}
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share on Facebook</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-600 dark:bg-sky-950/30 dark:hover:bg-sky-900/50 dark:border-sky-900/50 dark:text-sky-400" 
                        onClick={() => handleShare("Twitter")}
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share on Twitter</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 dark:border-blue-900/50 dark:text-blue-400"
                        onClick={() => handleShare("LinkedIn")}
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share on LinkedIn</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleShare("Embed")}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Embed video</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Continue creating and sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => router.push("/upload")}
              >
                <span className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Another Video
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => router.push("/channel/user")}
              >
                <span className="flex items-center">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Go to Your Channel
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Home button */}
      <div className="flex justify-center pt-4">
        <Button 
          className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600" 
          size="lg"
          onClick={() => router.push("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          Go to Home
        </Button>
    </div>
    </motion.div>
  );
}
