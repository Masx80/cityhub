"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react"
import { Fragment } from "react"

interface AdminLog {
  id: string
  action: string
  adminId: string
  adminName: string
  target: string
  details: string
  timestamp: string
}

interface LogDetailDialogProps {
  log: AdminLog | null
  open: boolean
  onClose: () => void
}

export function LogDetailDialog({ log, open, onClose }: LogDetailDialogProps) {
  if (!log) return null
  
  const getSeverityInfo = (action: string) => {
    if (action.includes("delete") || action.includes("suspend") || action.includes("failed")) {
      return { 
        level: "High",
        icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
        color: "text-red-500 bg-red-50 border-red-200"
      }
    }
    if (action.includes("update") || action.includes("edit") || action.includes("change")) {
      return { 
        level: "Medium", 
        icon: <Info className="h-6 w-6 text-blue-500" />,
        color: "text-blue-500 bg-blue-50 border-blue-200"
      }
    }
    return { 
      level: "Low", 
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      color: "text-green-500 bg-green-50 border-green-200"
    }
  }
  
  const severity = getSeverityInfo(log.action)
  
  // Parse log details for structured display
  const parseLogDetails = (details: string) => {
    try {
      if (details.includes(":") && !details.startsWith("http")) {
        const parts = details.split(/:(.+)/)
        if (parts.length >= 2) {
          return (
            <Fragment>
              <span className="font-medium">{parts[0].trim()}:</span>
              <span>{parts[1].trim()}</span>
            </Fragment>
          )
        }
      }
      
      return details
    } catch (e) {
      return details
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Audit Log Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Complete information about this security audit log entry
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4">
            {severity.icon}
            <div>
              <p className="text-sm text-muted-foreground">Severity</p>
              <p className={`font-medium ${severity.level === "High" ? "text-red-600" : severity.level === "Medium" ? "text-blue-600" : "text-green-600"}`}>
                {severity.level}
              </p>
            </div>
          </div>
          
          <div className={`border rounded-md p-4 ${severity.color}`}>
            <div className="flex flex-col gap-1">
              <Label className="text-xs uppercase">Action</Label>
              <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase">Timestamp</Label>
              <p className="font-medium">
                {format(new Date(log.timestamp), "PPP")}
                <br />
                {format(new Date(log.timestamp), "pp")}
              </p>
            </div>
            
            <div>
              <Label className="text-xs uppercase">Admin User</Label>
              <p className="font-medium">{log.adminName}</p>
              <p className="text-sm text-muted-foreground">ID: {log.adminId.substring(0, 8)}...</p>
            </div>
          </div>
          
          <div>
            <Label className="text-xs uppercase">Target</Label>
            <p className="font-medium">{log.target}</p>
          </div>
          
          <div>
            <Label className="text-xs uppercase">Details</Label>
            <p className="text-sm mt-1 whitespace-pre-wrap">{parseLogDetails(log.details)}</p>
          </div>
          
          <div className="border-t pt-4 mt-2">
            <Label className="text-xs uppercase">Log ID</Label>
            <p className="text-xs text-muted-foreground font-mono">{log.id}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 