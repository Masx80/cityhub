"use client";
import { Loader2, CheckIcon, Server, Video, SettingsIcon, Code, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useUpload } from "@/components/upload/upload-provider";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// Processing steps
const PROCESSING_STEPS = [
  {
    id: "transcoding",
    label: "Transcoding Video",
    description: "Converting your video for optimal playback",
    icon: Video,
    color: "text-blue-500",
    durationMs: 2000
  },
  {
    id: "quality",
    label: "Generating Quality Versions",
    description: "Creating different quality formats for all devices",
    icon: SettingsIcon,
    color: "text-purple-500",
    durationMs: 3000
  },
  {
    id: "optimization",
    label: "Optimizing",
    description: "Optimizing your video for streaming",
    icon: Code,
    color: "text-orange-500",
    durationMs: 2500
  },
  {
    id: "analysis",
    label: "Running Analysis",
    description: "Analyzing content for recommendations",
    icon: BarChart,
    color: "text-amber-500",
    durationMs: 2000
  },
  {
    id: "publishing",
    label: "Publishing",
    description: "Making your video available for viewing",
    icon: Server, 
    color: "text-green-500",
    durationMs: 5000  // Extended duration for publishing to give webhook time to respond
  }
];

export default function ProcessingStep() {
  const { videoDetails, videoFile } = useUpload();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isPublishingExtended, setIsPublishingExtended] = useState(false);

  useEffect(() => {
    // Total expected duration for all processing
    const totalDuration = PROCESSING_STEPS.reduce((sum, step) => sum + step.durationMs, 0);
    let elapsed = 0;
    
    // Move through each step automatically
    const advanceStep = (stepIndex: number) => {
      if (stepIndex >= PROCESSING_STEPS.length) return;
      
      const currentStepDuration = PROCESSING_STEPS[stepIndex].durationMs;
      const stepInterval = 50; // Update progress every 50ms
      const totalIncrements = currentStepDuration / stepInterval;
      let currentIncrement = 0;
      
      const progressInterval = setInterval(() => {
        currentIncrement++;
        
        // Update step progress
        const newStepProgress = Math.min(100, (currentIncrement / totalIncrements) * 100);
        setStepProgress(newStepProgress);
        
        // Update overall progress
        elapsed += stepInterval;
        // For publishing step, pause at 95% overall if extended waiting
        const cappedOverallProgress = isPublishingExtended && stepIndex === PROCESSING_STEPS.length - 1 
          ? Math.min(95, (elapsed / totalDuration) * 100)
          : Math.min(100, (elapsed / totalDuration) * 100);
        setOverallProgress(cappedOverallProgress);
        
        // Move to next step when current step completes
        if (currentIncrement >= totalIncrements) {
          clearInterval(progressInterval);
          setCompletedSteps(prev => [...prev, stepIndex]);
          
          // Handle the publishing step specially
          if (stepIndex === PROCESSING_STEPS.length - 1) {
            // Don't advance, just keep publishing at 100% until provider moves to next step
            setIsPublishingExtended(true);
          } else if (stepIndex < PROCESSING_STEPS.length - 1) {
            // Advance to next step
            setCurrentStep(stepIndex + 1);
            setStepProgress(0);
            setTimeout(() => advanceStep(stepIndex + 1), 300);
          }
        }
      }, stepInterval);
      
      return () => clearInterval(progressInterval);
    };
    
    // Start the processing simulation with a slight delay
    const initialDelay = setTimeout(() => {
      advanceStep(0);
    }, 1000);
    
    return () => clearTimeout(initialDelay);
  }, [isPublishingExtended]);

  // Render publishing step differently when extended
  const renderPublishingStep = (step: typeof PROCESSING_STEPS[0], index: number) => {
    const isActive = currentStep === index;
    const isCompleted = completedSteps.includes(index);
    const isPending = index > currentStep;
    const isPublishing = step.id === "publishing";
    
    return (
      <div 
        key={step.id}
        className={cn(
          "border rounded p-3 flex items-start transition-all",
          isActive ? "border-primary/40 bg-primary/5" : 
          isCompleted ? "border-green-500/40 bg-green-500/5" : 
          "border-muted bg-background"
        )}
      >
        <div className="mr-3 mt-0.5">
          {isCompleted && !isPublishingExtended ? (
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
              <CheckIcon className="h-3.5 w-3.5 text-white" />
            </div>
          ) : isActive || (isPublishing && isPublishingExtended) ? (
            <div className="relative">
              <motion.div 
                className="h-6 w-6 rounded-full border-2 border-primary absolute"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 0.9, 0.7]
                }} 
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", step.color)}>
                <step.icon className="h-3.5 w-3.5" />
              </div>
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full border-2 border-muted flex items-center justify-center text-muted-foreground">
              <step.icon className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className={cn(
              "font-medium text-sm",
              isActive ? step.color : 
              isCompleted && !isPublishingExtended ? "text-green-500" : 
              isPublishing && isPublishingExtended ? step.color :
              "text-muted-foreground"
            )}>
              {step.label}
              {isPublishing && isPublishingExtended && (
                <span className="ml-2 text-xs">
                  Waiting for server...
                </span>
              )}
            </h5>
            {isActive && !isPublishingExtended && (
              <span className="text-xs text-primary">{Math.round(stepProgress)}%</span>
            )}
            {isPublishing && isPublishingExtended && (
              <span className="text-xs text-primary">100%</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {step.description}
          </p>
          
          {(isActive || (isPublishing && isPublishingExtended)) && (
            <Progress 
              value={isPublishingExtended && isPublishing ? 100 : stepProgress} 
              className="h-1.5 mt-2 bg-secondary/50" 
              indicatorClassName={cn("bg-gradient-to-r", 
                step.color === "text-blue-500" ? "from-blue-400 to-blue-600" :
                step.color === "text-purple-500" ? "from-purple-400 to-purple-600" :
                step.color === "text-orange-500" ? "from-orange-400 to-orange-600" :
                step.color === "text-amber-500" ? "from-amber-400 to-amber-600" :
                "from-green-400 to-green-600"
              )}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border rounded-lg overflow-hidden bg-card"
    >
      <div className="border-b p-4 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
          Processing Your Video
        </h3>
        <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}% Complete</span>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Left column - status and steps */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress 
                value={overallProgress} 
                className="h-2 bg-secondary"
                indicatorClassName="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Processing Steps</h4>
              <div className="space-y-2 sm:space-y-3">
                {PROCESSING_STEPS.map((step, index) => renderPublishingStep(step, index))}
              </div>
            </div>
          </div>
          
          {/* Right column - video info and preview */}
          <div className="space-y-4">
            <div className="aspect-video bg-black/90 rounded-md overflow-hidden border relative hidden sm:block">
              {videoDetails.selectedThumbnail ? (
                <img 
                  src={videoDetails.selectedThumbnail} 
                  alt="Video thumbnail" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Processing thumbnail...</p>
                </div>
              )}
            </div>
            
            <div className="border rounded-md p-3 sm:p-4 bg-muted/30 space-y-2 sm:space-y-3">
              <div>
                <h4 className="font-medium mb-1">Video Information</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">{videoDetails.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">00:03:27</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="font-medium">{videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Format</p>
                  <p className="font-medium">{videoFile ? videoFile.type.split('/')[1].toUpperCase() : "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium text-amber-500">Processing</p>
                </div>
              </div>
              
              <div className="pt-1 text-sm">
                <p className="text-muted-foreground text-xs sm:text-sm">Your video is currently being processed and will be available shortly. This typically takes a few minutes depending on the video length and quality.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/30 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center border-t text-sm gap-2">
        <p className="text-muted-foreground text-xs sm:text-sm text-center sm:text-left">Please don't close this page. We'll notify you when processing is complete.</p>
        <p className="text-primary font-medium whitespace-nowrap">
          <motion.span 
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Processing...
          </motion.span>
        </p>
      </div>
    </motion.div>
  );
}
