"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  title?: string
  description?: string
  type?: ToastType
  icon?: ReactNode
  duration?: number
}

interface ToastContextType {
  toast: Toast | null
  showToast: (toast: Toast) => void
  dismissToast: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showToast = (newToast: Toast) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set default icon based on type
    let icon = newToast.icon
    if (!icon && newToast.type) {
      switch (newToast.type) {
        case "success":
          icon = <CheckCircle className="h-5 w-5" />
          break
        case "error":
          icon = <AlertCircle className="h-5 w-5" />
          break
        case "info":
          icon = <Info className="h-5 w-5" />
          break
      }
    }

    setToast({ ...newToast, icon })

    const id = setTimeout(() => {
      setToast(null)
    }, newToast.duration || 5000)

    setTimeoutId(id)
  }

  const dismissToast = () => {
    setToast(null)
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }

  return <ToastContext.Provider value={{ toast, showToast, dismissToast }}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
