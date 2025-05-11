"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2, Upload, Camera, X, Check, ChevronDown, Flag, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PageTransition from "@/components/page-transition";
import Image from "next/image";
import { countries } from "@/lib/countries";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import type { Crop as CropType } from 'react-image-crop';
// Import CSS directly for react-image-crop
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";

// Dynamically import ReactCrop with SSR disabled
const ReactCrop = dynamic(
  () => import('react-image-crop').then((mod) => mod.default),
  { ssr: false }
);

// Define validation schemas
const nameSchema = z.string()
  .min(2, "Channel name must be at least 2 characters")
  .max(50, "Channel name must be 50 characters or less")
  .refine(name => name.trim().length > 0, "Channel name cannot be only whitespace");

const handleSchema = z.string()
  .min(3, "Handle must be at least 3 characters")
  .max(30, "Handle must be 30 characters or less")
  .regex(/^[a-zA-Z0-9_]+$/, "Handle can only contain letters, numbers, and underscores")
  .refine(handle => !handle.includes("admin"), "Handle cannot contain 'admin'");

const descriptionSchema = z.string()
  .max(500, "Description must be less than 500 characters")
  .optional()
  .or(z.literal(""));

const locationSchema = z.string()
  .optional()
  .or(z.literal(""));

// Add form validation schema
const channelFormSchema = z.object({
  channelName: nameSchema,
  channelHandle: handleSchema,
  channelDescription: descriptionSchema,
  channelLocation: locationSchema,
});

export default function ChannelSetupPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  // Declare ALL state hooks at the top
  const [checkingOnboardingStatus, setCheckingOnboardingStatus] = useState(true);
  const [hasAlreadyOnboarded, setHasAlreadyOnboarded] = useState(false);
  
  // Form state
  const [channelName, setChannelName] = useState("");
  const [channelHandle, setChannelHandle] = useState("");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelLocation, setChannelLocation] = useState("");
  
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
  
  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Declare ALL callbacks next
  // Memoized form handlers for better performance
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setChannelName(value);
    
    // Client-side validation for channel name
    const nameValidation = nameSchema.safeParse(value);
    
    if (!nameValidation.success) {
      setErrors(prev => ({
        ...prev,
        channelName: nameValidation.error.issues[0].message
      }));
    } else {
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.channelName;
        return newErrors;
      });
    }
  }, []);

  const handleHandleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^@/, "");
    setChannelHandle(value);
    
    // Client-side validation for channel handle
    const handleValidation = handleSchema.safeParse(value);
    
    if (!handleValidation.success) {
      setErrors(prev => ({
        ...prev,
        channelHandle: handleValidation.error.issues[0].message
      }));
    } else {
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.channelHandle;
        return newErrors;
      });
    }
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setChannelDescription(value);
    
    // Client-side validation for description
    const descriptionValidation = descriptionSchema.safeParse(value);
    
    if (!descriptionValidation.success) {
      setErrors(prev => ({
        ...prev,
        channelDescription: descriptionValidation.error.issues[0].message
      }));
    } else {
      // Clear error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.channelDescription;
        return newErrors;
      });
    }
  }, []);
  
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
  
  // Clear avatar file and preview
  const clearAvatar = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }, []);
  
  // Clear banner file and preview
  const clearBanner = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setBannerFile(null);
    setBannerPreview(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  }, []);
  
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
  
  // Add a function to check if the form is valid
  const isFormValid = useCallback(() => {
    // Check if required fields are filled and valid
    return (
      !errors.channelName &&
      !errors.channelHandle &&
      !errors.channelDescription &&
      channelName.trim().length >= 2 &&
      channelHandle.trim().length >= 3
    );
  }, [errors, channelName, channelHandle]);
  
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
  
  // Upload files to Bunny.net storage
  const uploadFilesToBunny = useCallback(async () => {
    try {
      setIsUploading(true);
      let avatarUrl = null;
      let bannerUrl = null;
      
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
        setUploadProgress(prev => ({ ...prev, banner: 100 }));
      }
      
      return {
        avatarUrl: avatarUrl || user?.imageUrl,
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
  }, [avatarFile, bannerFile, user?.imageUrl]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");
    
    // Reset previous errors
    setErrors({});
    
    try {
      // Validate form data
      const formData = {
        channelName,
        channelHandle,
        channelDescription,
        channelLocation,
      };
      
      console.log("Form data:", formData);
      
      // Pre-check validation before submitting
      if (!isFormValid()) {
        console.log("Form validation failed");
        
        // Manually trigger validations to show error messages
        const nameResult = nameSchema.safeParse(channelName);
        if (!nameResult.success) {
          setErrors(prev => ({ 
            ...prev, 
            channelName: nameResult.error.issues[0].message
          }));
        }
          
        const handleResult = handleSchema.safeParse(channelHandle);
        if (!handleResult.success) {
          setErrors(prev => ({ 
            ...prev, 
            channelHandle: handleResult.error.issues[0].message
          }));
        }
        
        toast.error("Please fix the errors before submitting");
        return;
      }
      
      const validationResult = channelFormSchema.safeParse(formData);
      
      if (!validationResult.success) {
        // Extract and set validation errors
        const fieldErrors: Record<string, string> = {};
        validationResult.error.issues.forEach(issue => {
          const field = issue.path[0].toString();
          fieldErrors[field] = issue.message;
        });
        
        setErrors(fieldErrors);
        console.log("Validation errors:", fieldErrors);
        toast.error("Please fix the form errors and try again");
        return;
      }
      
      setIsSubmitting(true);
      console.log("Validation passed, proceeding with submission");
      
      // Upload files if needed
      let avatarUrl = null;
      let bannerUrl = null;
      
      if (avatarFile || bannerFile) {
        try {
          console.log("Starting file upload");
          const uploadResult = await uploadFilesToBunny();
          avatarUrl = uploadResult.avatarUrl;
          bannerUrl = uploadResult.bannerUrl;
          console.log("File upload complete", { avatarUrl, bannerUrl });
        } catch (error) {
          console.error("Upload failed:", error);
          toast.error("Failed to upload images. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create channel
      console.log("Sending API request to create channel");
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
          channelBannerUrl: bannerUrl,
          channelAvatarUrl: avatarUrl || user?.imageUrl,
        }),
      });
      
      console.log("API response received:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          // Handle duplicate handle error
          setErrors({
            channelHandle: responseData.error || "This handle is already taken"
          });
          setIsSubmitting(false);
          return;
        }
        
        toast.error(responseData.error || "Failed to create channel");
        setIsSubmitting(false);
        return;
      }
      
      // Success! Redirect to the channel page
      toast.success("Channel created successfully!");
      console.log("Channel created successfully, redirecting...");
      const redirectHandle = responseData.channelHandle || `@${formData.channelHandle.replace(/^@/, "")}`;
      
      // Add a slight delay to ensure toast is shown before redirect
      setTimeout(() => {
        router.push(`/channel/${redirectHandle.replace(/^@/, "")}`);
      }, 1000);
      
    } catch (error) {
      console.error("Error creating channel:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    } finally {
      console.log("Form submission process completed");
    }
  };
  
  // Memoize the upload progress renderer to prevent unnecessary re-renders
  const renderUploadProgress = useCallback((type: 'avatar' | 'banner') => {
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
  }, [uploadProgress]);
  
  // Memoize the Select items to prevent re-renders
  const countryOptions = useMemo(() => (
    countries.map(country => (
      <SelectItem key={country.code} value={country.code} className="cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="inline-block w-5">{country.code === 'US' ? '🇺🇸' : country.code === 'GB' ? '🇬🇧' : ''}</span>
          {country.name}
        </div>
      </SelectItem>
    ))
  ), []);

  // Effects come after all other hooks
  // Check if user has already completed onboarding
  useEffect(() => {
    if (!isLoaded || !user) return;
    
    async function checkOnboardingStatus() {
      try {
        const response = await fetch("/api/user/channel/me");
        
        if (response.ok) {
          const data = await response.json();
          
          // If user has already completed onboarding, redirect to homepage
          if (data.hasCompletedOnboarding) {
            toast.info("You've already set up your channel!");
            setHasAlreadyOnboarded(true);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setCheckingOnboardingStatus(false);
      }
    }
    
    checkOnboardingStatus();
  }, [isLoaded, user, router]);
  
  // AFTER all hooks, we can have conditional returns
  // If user is not loaded yet or checking onboarding status, show loading state
  if (!isLoaded || checkingOnboardingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Checking account status...</p>
      </div>
    );
  }
  
  // If user is not logged in, redirect to auth page
  if (!user) {
    router.push("/auth");
    return null;
  }
  
  // If user has already completed onboarding, show a message
  if (hasAlreadyOnboarded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Channel Already Set Up!</h1>
        <p className="text-muted-foreground mb-6">
          You've already completed the channel setup process.
        </p>
        <Button onClick={() => router.push("/")} className="mb-2">
          Back to Home
        </Button>
        <p className="text-sm text-muted-foreground">
          If you'd like to modify your channel settings, please visit your profile settings page.
        </p>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl py-10">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Welcome to SexCity Hub!</h1>
              <p className="text-muted-foreground mt-2">
                Let's set up your channel so you can start sharing videos
              </p>
              <p className="text-muted-foreground/80 mt-1 text-sm">
                This is a one-time setup to get you started
              </p>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Form submitted via onSubmit");
                handleSubmit(e);
              }} 
              className="space-y-8"
            >
              {/* Banner Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="banner">Channel Banner</Label>
                <div 
                  className="w-full h-48 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {bannerPreview ? (
                    <>
                      <Image
                        src={bannerPreview}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10"
                        onClick={clearBanner}
                      >
                        <X className="h-4 w-4" />
                      </Button>
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
                  <Label htmlFor="avatar" className="mb-2 block">
                    Channel Avatar
                  </Label>
                  <div 
                    className="w-32 h-32 bg-muted rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center relative overflow-hidden cursor-pointer"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <>
                        <Image
                          src={avatarPreview}
                          alt="Avatar preview"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute bottom-0 right-0 z-10"
                          onClick={clearAvatar}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : user?.imageUrl ? (
                      <>
                        <Image
                          src={user.imageUrl}
                          alt="User avatar"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
                    <Label htmlFor="channel-name">
                      Channel Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="channel-name"
                      placeholder="Your Channel Name"
                      value={channelName}
                      onChange={handleNameChange}
                      className={errors.channelName ? "border-red-500" : ""}
                      maxLength={50}
                    />
                    {errors.channelName ? (
                      <p className="text-red-500 text-sm">{errors.channelName}</p>
                    ) : (
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">
                          Enter a descriptive name for your channel
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {channelName.length}/50
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="channel-handle">
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
                        onChange={handleHandleChange}
                        className={`pl-7 ${errors.channelHandle ? "border-red-500" : ""}`}
                        maxLength={30}
                      />
                    </div>
                    {errors.channelHandle ? (
                      <p className="text-red-500 text-sm">{errors.channelHandle}</p>
                    ) : (
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">
                          This will be your unique identifier on the platform
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {channelHandle.length}/30
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Channel Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers about your channel"
                  rows={4}
                  value={channelDescription}
                  onChange={handleDescriptionChange}
                  className={errors.channelDescription ? "border-red-500" : ""}
                  maxLength={500}
                />
                <div className="flex justify-between">
                  <p className={`text-xs ${errors.channelDescription ? "text-red-500" : "text-muted-foreground"}`}>
                    {errors.channelDescription || "Maximum 500 characters"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {channelDescription.length}/500
                  </p>
                </div>
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={channelLocation} onValueChange={setChannelLocation}>
                  <SelectTrigger id="location" className="w-full">
                    <SelectValue placeholder="Select your country">
                      {channelLocation ? (
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4" />
                          {countries.find(c => c.code === channelLocation)?.name || channelLocation}
                        </div>
                      ) : (
                        "Select your country"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This helps viewers find content from their region
                </p>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting || isUploading || !isFormValid()}
                  onClick={(e) => {
                    if (!isSubmitting && !isUploading) {
                      console.log("Submit button clicked directly");
                      // Don't prevent default here to allow form submission to proceed
                    }
                  }}
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isUploading ? "Uploading..." : "Creating Channel..."}
                    </>
                  ) : !isFormValid() ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Complete Required Fields
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Channel
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
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
    </PageTransition>
  );
} 