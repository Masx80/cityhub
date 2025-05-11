"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function Toast() {
  const { toast, dismissToast } = useToast();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50 max-w-md"
        >
          <div className="bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3">
            {toast.icon && <div className="text-primary">{toast.icon}</div>}
            <div className="flex-1">
              {toast.title && <h4 className="font-medium">{toast.title}</h4>}
              {toast.description && (
                <p className="text-sm text-muted-foreground">
                  {toast.description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={dismissToast}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
