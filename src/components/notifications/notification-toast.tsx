"use client";

import { useEffect, useState } from "react";
import { 
  Toast, 
  ToastClose, 
  ToastDescription, 
  ToastProvider, 
  ToastTitle, 
  ToastViewport 
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { BellIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "info" | "warning" | "subscription";

interface Notification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
}

export function NotificationToast() {
  const { toast, toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const type = props.variant === "destructive" 
          ? "error" 
          : props.variant === "default" 
            ? "info" 
            : props.variant as NotificationType;
            
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              <NotificationIcon type={type} />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "success":
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case "error":
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    case "warning":
      return <InfoIcon className="h-5 w-5 text-yellow-500" />;
    case "subscription":
      return <BellIcon className="h-5 w-5 text-primary" />;
    case "info":
    default:
      return <InfoIcon className="h-5 w-5 text-blue-500" />;
  }
}

// Helper hook to show notifications
export function useShowNotification() {
  const { toast } = useToast();
  
  const showNotification = (
    title: string, 
    description?: string, 
    type: NotificationType = "info"
  ) => {
    toast({
      title,
      description,
      variant: type === "error" 
        ? "destructive" 
        : type === "info" 
          ? "default" 
          : "default",
    });
  };
  
  return showNotification;
} 