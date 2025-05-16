"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, EyeIcon, Trash2, AlertCircle, CheckCircle2, Ban, Edit, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionDropdownProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onApprove?: () => void
  onReject?: () => void
  onFeature?: () => void
  onBan?: () => void
  actionType?: "content" | "user" | "generic"
  small?: boolean
}

export function ActionDropdown({
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onFeature,
  onBan,
  actionType = "generic",
  small = false,
}: ActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={small ? "sm" : "icon"} className={cn("h-8 w-8 p-0", small && "h-7 w-7")}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className={cn("h-4 w-4", small && "h-3.5 w-3.5")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {onView && (
          <DropdownMenuItem onClick={onView} className="cursor-pointer">
            <EyeIcon className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        
        {actionType === "content" && onApprove && (
          <DropdownMenuItem onClick={onApprove} className="cursor-pointer">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
            Approve
          </DropdownMenuItem>
        )}
        
        {actionType === "content" && onReject && (
          <DropdownMenuItem onClick={onReject} className="cursor-pointer">
            <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
            Reject
          </DropdownMenuItem>
        )}
        
        {actionType === "content" && onFeature && (
          <DropdownMenuItem onClick={onFeature} className="cursor-pointer">
            <Star className="mr-2 h-4 w-4 text-blue-500" />
            Feature
          </DropdownMenuItem>
        )}
        
        {actionType === "user" && onBan && (
          <DropdownMenuItem onClick={onBan} className="cursor-pointer">
            <Ban className="mr-2 h-4 w-4 text-red-500" />
            Ban User
          </DropdownMenuItem>
        )}
        
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onDelete} 
              className="cursor-pointer text-red-500 focus:text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 