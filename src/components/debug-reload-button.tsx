"use client";

import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function DebugReloadButton() {
  const handleReload = () => {
    window.location.reload();
  };
  
  return (
    <Button 
      variant="outline" 
      size="icon"
      className="fixed bottom-4 right-4 z-50 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white"
      onClick={handleReload}
    >
      <RefreshCcw className="h-5 w-5" />
    </Button>
  );
} 