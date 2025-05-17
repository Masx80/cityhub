"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  ArrowLeft, 
  Upload, 
  Trash, 
  Loader2, 
  Save,
  Camera,
  X,
  MapPin,
  AtSign,
  User,
  FileText,
  Crop
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/countries";
import Image from "next/image";
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ensureValidImageUrl } from "@/lib/utils/image";

export default function ChannelSettingsPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  
  // Form state
  const [channelName, setChannelName] = useState("");
  const [channelHandle, setChannelHandle] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelLocation, setChannelLocation] = useState("");
  
  // Original values for checking if changes were made
  const [originalData, setOriginalData] = useState({
    channelName: "",
    channelHandle: "",
    channelDescription: "",
    channelLocation: "",
    channelAvatarUrl: "",
    channelBannerUrl: "",
  });
  
  // Upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ avatar: 0, banner: 0 });
  
  // Crop state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [completedCrop, setCompletedCrop] = useState<CropType | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's channel data
  useEffect(() => {
    const fetchUserChannel = async () => {
      if (!isLoaded || !isSignedIn) return;
      
      try {
        setIsLoading(true);
        const response = await fetch("/api/user/channel/me");
        
        if (!response.ok) {
          throw new Error("Failed to fetch channel data");
        }
        
        const channelData = await response.json();
        
        // Set form values
        setChannelName(channelData.channelName || "");
        setChannelHandle((channelData.channelHandle || "").replace(/^@/, ""));
        setChannelDescription(channelData.channelDescription || "");
        setChannelLocation(channelData.channelLocation || "");
        
        // Set preview images
        if (channelData.channelAvatarUrl) {
          setAvatarPreview(ensureValidImageUrl(channelData.channelAvatarUrl));
        }
        
        if (channelData.channelBannerUrl) {
          setBannerPreview(ensureValidImageUrl(channelData.channelBannerUrl));
        }
        
        // Store original data for comparison
        setOriginalData({
          channelName: channelData.channelName || "",
          channelHandle: (channelData.channelHandle || "").replace(/^@/, ""),
          channelDescription: channelData.channelDescription || "",
          channelLocation: channelData.channelLocation || "",
          channelAvatarUrl: channelData.channelAvatarUrl || "",
          channelBannerUrl: channelData.channelBannerUrl || "",
        });
      } catch (error) {
        console.error("Error fetching channel data:", error);
        toast.error("Failed to load channel information");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserChannel();
  }, [isLoaded, isSignedIn]);
  
  // If user is not logged in, redirect to auth page
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/auth");
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Handle file selection for avatar
  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be less than 5MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file for your avatar");
      return;
    }
    
    // Create preview for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);
  
  // Apply the crop to the avatar image
  const applyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
      toast.error("Please complete cropping the image");
      return;
    }
    
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Set canvas dimensions - limit to max 400x400 for avatar
    const maxDimension = 400;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    
    // Determine the target dimensions while maintaining aspect ratio
    let targetWidth = cropWidth;
    let targetHeight = cropHeight;
    
    if (cropWidth > maxDimension || cropHeight > maxDimension) {
      if (cropWidth > cropHeight) {
        targetWidth = maxDimension;
        targetHeight = (cropHeight / cropWidth) * maxDimension;
      } else {
        targetHeight = maxDimension;
        targetWidth = (cropWidth / cropHeight) * maxDimension;
      }
    }
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast.error("Could not create canvas context");
      return;
    }
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );
    
    // Convert canvas to blob with quality setting
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to create image");
        return;
      }
      
      // Create a File from the Blob
      const croppedFile = new File([blob], 'cropped-avatar.png', { 
        type: 'image/png',
      });
      
      // Set the cropped file and preview
      setAvatarFile(croppedFile);
      setAvatarPreview(canvas.toDataURL('image/png', 0.85));
      
      // Close dialog
      setCropDialogOpen(false);
    }, 'image/png', 0.85); // Use 0.85 quality for good balance of size and quality
  }, [completedCrop]);
  
  // Optimize image before upload
  const optimizeImage = useCallback((file: File, maxWidth: number, maxHeight: number, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Create an HTML Image element
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }
          
          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with quality setting
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Failed to create optimized image"));
              return;
            }
            
            // Create a File from the Blob with the original filename
            const optimizedFile = new File(
              [blob], 
              file.name, 
              { 
                type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                lastModified: Date.now()
              }
            );
            
            resolve(optimizedFile);
          }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
        };
        
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      reader.readAsDataURL(file);
    });
  }, []);
  
  // Handle file selection for banner
  const handleBannerChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Banner image must be less than 10MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file for your banner");
      return;
    }
    
    try {
      // Show loading indicator
      toast.loading("Optimizing banner image...");
      
      // Optimize the banner image (2048x512 for banner)
      const optimizedFile = await optimizeImage(file, 2048, 512);
      
      // Update state with optimized file
      setBannerFile(optimizedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
        toast.dismiss();
        toast.success("Banner image optimized");
      };
      reader.readAsDataURL(optimizedFile);
    } catch (error) {
      console.error("Error optimizing banner image:", error);
      toast.dismiss();
      toast.error("Failed to optimize image. Please try another image.");
    }
  }, [optimizeImage]);
  
  // Clear avatar file and preview
  const clearAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };
  
  // Clear banner file and preview
  const clearBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };
  
  // Reset avatar to original
  const resetAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(originalData.channelAvatarUrl ? originalData.channelAvatarUrl : null);
  };
  
  // Reset banner to original
  const resetBanner = () => {
    setBannerFile(null);
    setBannerPreview(originalData.channelBannerUrl ? ensureValidImageUrl(originalData.channelBannerUrl) : null);
  };

  // Delete image from Bunny storage (if it exists)
  const deleteImageFromBunny = async (url: string) => {
    if (!url) return;
    
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        console.error('Failed to delete image from storage');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Upload files to Bunny.net storage
  const uploadFilesToBunny = async () => {
    try {
      setIsUploading(true);
      let avatarUrl = originalData.channelAvatarUrl;
      let bannerUrl = originalData.channelBannerUrl;
      
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        formData.append('type', 'avatar');
        
        setUploadProgress(prev => ({ ...prev, avatar: 10 }));
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        setUploadProgress(prev => ({ ...prev, avatar: 90 }));
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload avatar');
        }
        
        const data = await response.json();
        avatarUrl = data.url;
        
        // Delete previous avatar if different
        if (originalData.channelAvatarUrl && originalData.channelAvatarUrl !== avatarUrl) {
          await deleteImageFromBunny(originalData.channelAvatarUrl);
        }
        
        setUploadProgress(prev => ({ ...prev, avatar: 100 }));
      }
      
      if (bannerFile) {
        const formData = new FormData();
        formData.append('file', bannerFile);
        formData.append('type', 'banner');
        
        setUploadProgress(prev => ({ ...prev, banner: 10 }));
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        setUploadProgress(prev => ({ ...prev, banner: 90 }));
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload banner');
        }
        
        const data = await response.json();
        bannerUrl = data.url;
        
        // Delete previous banner if different
        if (originalData.channelBannerUrl && originalData.channelBannerUrl !== bannerUrl) {
          await deleteImageFromBunny(originalData.channelBannerUrl);
        }
        
        setUploadProgress(prev => ({ ...prev, banner: 100 }));
      }
      
      return {
        avatarUrl,
        bannerUrl,
      };
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload images");
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress({ avatar: 0, banner: 0 });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!channelName.trim()) {
      newErrors.channelName = "Channel name is required";
    }
    
    if (!channelHandle.trim()) {
      newErrors.channelHandle = "Channel handle is required";
    } else if (!/^[a-zA-Z0-9_]+$/.test(channelHandle)) {
      newErrors.channelHandle = "Handle can only contain letters, numbers, and underscores";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if any changes were made
      const hasTextChanges = 
        channelName !== originalData.channelName ||
        channelHandle !== originalData.channelHandle ||
        channelDescription !== originalData.channelDescription ||
        channelLocation !== originalData.channelLocation;
      
      const hasImageChanges = avatarFile !== null || bannerFile !== null;
      
      // If no changes, return
      if (!hasTextChanges && !hasImageChanges) {
        toast.info("No changes detected");
        router.push(`/channel/${channelHandle}`);
        return;
      }
      
      // Upload files if needed
      const { avatarUrl, bannerUrl } = hasImageChanges ? await uploadFilesToBunny() : {
        avatarUrl: originalData.channelAvatarUrl,
        bannerUrl: originalData.channelBannerUrl
      };
      
      // Update user channel info
      const response = await fetch("/api/user/channel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channelName,
          channelHandle: channelHandle.startsWith("@") ? channelHandle : `@${channelHandle}`,
          channelDescription,
          channelLocation,
          channelAvatarUrl: avatarUrl,
          channelBannerUrl: bannerUrl,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update channel");
      }
      
      toast.success("Channel updated successfully!");
      
      // Update original data
      setOriginalData({
        channelName,
        channelHandle,
        channelDescription,
        channelLocation,
        channelAvatarUrl: avatarUrl || "",
        channelBannerUrl: bannerUrl || "",
      });
      
      // Redirect to the user's channel page
      router.push(`/channel/${channelHandle.replace(/^@/, "")}`);
    } catch (error) {
      console.error("Error updating channel:", error);
      toast.error("Failed to update channel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render upload progress
  const renderUploadProgress = (type: 'avatar' | 'banner') => {
    const progress = type === 'avatar' ? uploadProgress.avatar : uploadProgress.banner;
    if (progress <= 0) return null;
    
    return (
      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
        <div 
          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Check if any changes were made
  const hasChanges = 
    channelName !== originalData.channelName ||
    channelHandle !== originalData.channelHandle ||
    channelDescription !== originalData.channelDescription ||
    channelLocation !== originalData.channelLocation ||
    avatarFile !== null ||
    bannerFile !== null ||
    (avatarPreview === null && originalData.channelAvatarUrl) ||
    (bannerPreview === null && originalData.channelBannerUrl);

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Channel Settings</h1>
        </div>
        
        <Button
          variant="default"
          className="flex items-center gap-2"
          disabled={isSubmitting || !hasChanges}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      
      <Separator className="mb-6" />
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Banner Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="banner" className="text-base font-medium flex items-center gap-2">
            Channel Banner
          </Label>
          <div 
            className="w-full h-48 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group"
            onClick={() => bannerInputRef.current?.click()}
          >
            {bannerPreview ? (
              <>
                <Image
                  src={bannerPreview ? bannerPreview : undefined}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-black/60 rounded-full p-2">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={clearBanner}
                >
                  <Trash className="h-4 w-4" />
                </Button>
                
                {bannerFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background"
                    onClick={resetBanner}
                  >
                    Undo
                  </Button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center p-4">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm font-medium">
                  Click to upload banner image
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Recommended size: 2048 x 512 pixels
                </p>
              </div>
            )}
            <input
              ref={bannerInputRef}
              id="banner"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleBannerChange}
            />
          </div>
          {renderUploadProgress('banner')}
        </div>
        
        {/* Avatar and Channel Info */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Upload */}
          <div className="mb-4 md:mb-0">
            <Label htmlFor="avatar" className="mb-2 block text-base font-medium">
              Channel Avatar
            </Label>
            <div 
              className="w-32 h-32 bg-muted rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center relative overflow-hidden cursor-pointer group"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview ? (
                <>
                  <Image
                    src={avatarPreview ? avatarPreview : undefined}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-black/60 rounded-full p-2">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute bottom-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={clearAvatar}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {avatarFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background"
                      onClick={resetAvatar}
                    >
                      Undo
                    </Button>
                  )}
                </>
              ) : user?.imageUrl ? (
                <>
                  <Image
                    src={user.imageUrl}
                    alt="User avatar"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </>
              ) : (
                <Camera className="h-10 w-10 text-muted-foreground" />
              )}
              <input
                ref={avatarInputRef}
                id="avatar"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            {renderUploadProgress('avatar')}
          </div>
          
          {/* Channel Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Channel Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="channel-name"
                placeholder="Your Channel Name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className={errors.channelName ? "border-red-500" : ""}
              />
              {errors.channelName && (
                <p className="text-red-500 text-sm">{errors.channelName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel-handle" className="flex items-center gap-2">
                <AtSign className="h-4 w-4 text-muted-foreground" />
                Channel Handle <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </div>
                <Input
                  id="channel-handle"
                  placeholder="yourchannel"
                  value={channelHandle.replace(/^@/, "")}
                  onChange={(e) => setChannelHandle(e.target.value)}
                  className={`pl-7 ${errors.channelHandle ? "border-red-500" : ""}`}
                />
              </div>
              {errors.channelHandle ? (
                <p className="text-red-500 text-sm">{errors.channelHandle}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This will be your unique identifier on the platform
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Channel Description
          </Label>
          <Textarea
            id="description"
            placeholder="Tell viewers about your channel"
            rows={4}
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Maximum 500 characters
          </p>
        </div>
        
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Location
          </Label>
          <Select value={channelLocation} onValueChange={setChannelLocation}>
            <SelectTrigger id="location" className="w-full">
              <SelectValue placeholder="Select your country">
                {channelLocation ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {countries.find(c => c.code === channelLocation)?.name || channelLocation}
                  </div>
                ) : (
                  "Select your country"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.code} value={country.code} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-5">
                      {country.code === 'US' ? '🇺🇸' : country.code === 'GB' ? '🇬🇧' : ''}
                    </span>
                    {country.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This helps viewers find content from their region
          </p>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
      
      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-xl bg-background/95 backdrop-blur-sm border-muted">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Perfect Your Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="my-6 flex justify-center overflow-hidden bg-black/5 rounded-lg p-4">
            {tempImageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="rounded-lg max-w-full"
              >
                <img 
                  src={tempImageSrc} 
                  ref={imgRef} 
                  alt="Crop preview" 
                  className="max-h-[50vh] object-contain rounded-lg"
                  style={{ maxWidth: "100%" }}
                />
              </ReactCrop>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground text-center mb-4">
            Drag to position and resize the circle to crop your profile picture
          </p>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setCropDialogOpen(false);
                setTempImageSrc(null);
              }}
              className="px-5"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={applyCrop}
              className="bg-primary hover:bg-primary/90 px-5"
            >
              <Crop className="h-4 w-4 mr-2" />
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
