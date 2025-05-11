"use client";

import { useState, useCallback } from "react";

type ActionType = "like" | "subscribe" | "comment" | "save" | "interaction";

interface UseAuthPromptOptions {
  onSignIn?: () => void;
}

export function useAuthPrompt(options?: UseAuthPromptOptions) {
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [promptType, setPromptType] = useState<ActionType>("interaction");
  const [customTitle, setCustomTitle] = useState<string | undefined>(undefined);
  const [customDescription, setCustomDescription] = useState<string | undefined>(undefined);
  
  const openAuthPrompt = useCallback(
    (type: ActionType = "interaction", title?: string, description?: string) => {
      setPromptType(type);
      setCustomTitle(title);
      setCustomDescription(description);
      setIsAuthPromptOpen(true);
      
      return false; // Return false to allow for early returns in conditionals
    },
    []
  );
  
  const closeAuthPrompt = useCallback(() => {
    setIsAuthPromptOpen(false);
  }, []);
  
  const handleAuthAction = useCallback((isAuthenticated: boolean, actionType: ActionType = "interaction", action: () => void) => {
    if (isAuthenticated) {
      action();
      return true;
    } else {
      openAuthPrompt(actionType);
      return false;
    }
  }, [openAuthPrompt]);
  
  return {
    isAuthPromptOpen,
    promptType,
    customTitle,
    customDescription,
    openAuthPrompt,
    closeAuthPrompt,
    handleAuthAction,
  };
} 