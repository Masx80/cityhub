"use client";

import React from "react";
import { useUpload } from "./upload-provider";
import FileSelectStep from "./steps/file-select-step";
import UploadProgressStep from "./steps/upload-progress-step";
import DetailsStep from "./steps/details-step";
import ProcessingStep from "./steps/processing-step";
import CompleteStep from "./steps/complete-step";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, FileVideo, Upload, Pencil, Loader, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Step configuration with enhanced metadata
const STEPS = [
  { 
    id: "select", 
    label: "Select File",
    description: "Choose a video to upload",
    icon: FileVideo,
    color: "from-blue-500 to-cyan-400"
  },
  { 
    id: "upload", 
    label: "Upload",
    description: "Upload your video to our servers",
    icon: Upload,
    color: "from-purple-500 to-violet-400"
  },
  { 
    id: "details", 
    label: "Details",
    description: "Add information about your video",
    icon: Pencil,
    color: "from-orange-500 to-amber-400"
  },
  { 
    id: "processing", 
    label: "Processing",
    description: "Your video is being processed",
    icon: Loader,
    color: "from-yellow-500 to-amber-400"
  },
  { 
    id: "complete", 
    label: "Complete",
    description: "Your video is ready to view",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-400"
  },
];

export default function UploadStepper() {
  const { currentStep } = useUpload();

  // Find the current step index
  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="space-y-8">
      {/* Step overview section */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="text-lg font-medium mb-4">Upload Process</h3>
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const isPending = index > currentStepIndex;
            
            return (
              <div key={step.id} className="text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center">
                        <div 
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center relative mb-2 transition-all",
                            isActive && `bg-gradient-to-r ${step.color} ring-2 ring-offset-2 ring-offset-background ring-primary/30`,
                            isCompleted && "bg-gradient-to-r from-green-500 to-emerald-400",
                            isPending && "bg-muted"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-5 w-5 text-white" />
                          ) : (
                            <step.icon className={cn(
                              "h-5 w-5",
                              isActive ? "text-white" : "text-muted-foreground"
                            )} />
                          )}
                          
                          {isActive && (
                            <motion.div 
                              className="absolute inset-0 rounded-full bg-primary/20"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop"
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <span className={cn(
                            "text-xs font-medium block mb-0.5",
                            isActive ? "text-primary" : 
                            isCompleted ? "text-green-500" : 
                            "text-muted-foreground"
                          )}>
                            {step.label}
                          </span>
                          {isActive && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] py-0 h-4 bg-primary/10 border-primary/20 text-primary"
                              )}
                            >
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{step.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </div>
        
        {/* Progress line */}
        <div className="relative mt-4 mx-auto h-1.5 bg-muted rounded-full max-w-xl overflow-hidden">
          <motion.div 
            className="absolute h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"
            initial={{ width: `${Math.max((currentStepIndex / (STEPS.length - 1)) * 100, 5)}%` }}
            animate={{ width: `${Math.max((currentStepIndex / (STEPS.length - 1)) * 100, 5)}%` }}
            transition={{ duration: 0.5 }}
          />
          {STEPS.map((_, index) => (
            <div 
              key={index} 
              className={cn(
                "absolute h-3 w-3 rounded-full top-1/2 -translate-y-1/2 border-2 border-background", 
                index <= currentStepIndex ? "bg-primary" : "bg-muted",
              )}
              style={{ left: `${(index / (STEPS.length - 1)) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Contextual help based on current step */}
      <div className="px-4 py-3 border-l-4 border-primary/50 bg-primary/5 rounded-r-md">
        <p className="text-sm">
          {currentStep === "select" && "Choose a video file to upload. You can drag and drop or browse your files."}
          {currentStep === "upload" && "Your video is being uploaded. Please wait and don't close the page."}
          {currentStep === "details" && "Add title, description, tags and other details to help viewers find your video."}
          {currentStep === "processing" && "We're processing your video to optimize it for different devices and quality levels."}
          {currentStep === "complete" && "Congratulations! Your video has been uploaded and is ready to be watched."}
        </p>
      </div>

      {/* Current step content */}
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === "select" && <FileSelectStep />}
        {currentStep === "upload" && <UploadProgressStep />}
        {currentStep === "details" && <DetailsStep />}
        {currentStep === "processing" && <ProcessingStep />}
        {currentStep === "complete" && <CompleteStep />}
      </motion.div>
    </div>
  );
}
