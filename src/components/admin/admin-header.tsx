"use client"

import { useState } from "react"
import { Bell, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "@/components/theme-toggle"
import Link from "next/link"
import { ClerkProvider, useUser } from "@clerk/nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

type AdminHeaderProps = {
  user?: any
}

type Notification = {
  id: string;
  title: string;
  description: string;
  time: Date;
  read: boolean;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [search, setSearch] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New User Registered",
      description: "A new user has registered on the platform.",
      time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
    },
    {
      id: "2",
      title: "Content Reported",
      description: "A video has been reported for inappropriate content.",
      time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
    {
      id: "3",
      title: "System Update",
      description: "The platform has been updated to the latest version.",
      time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
    },
    {
      id: "4",
      title: "New Content Uploaded",
      description: "A creator has uploaded new content that needs approval.",
      time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: false,
    },
    {
      id: "5",
      title: "Usage Statistics",
      description: "Weekly usage statistics are now available.",
      time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false,
    },
  ]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2 font-black text-lg md:text-xl">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <div className="hidden lg:block">
            <span className="text-orange-500">SexCity</span>
            <span className="bg-gradient-to-r from-white to-muted-foreground text-transparent bg-clip-text"> Hub Admin</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users, videos, or settings..."
            className="w-full pl-8 bg-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="h-8 text-xs"
                >
                  Mark all as read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                <DropdownMenuGroup>
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <div 
                        className={`flex items-start gap-2 w-full p-2 cursor-default ${!notification.read ? "bg-muted/50" : ""}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{notification.title}</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{format(notification.time, 'MMM d, h:mm a')}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No notifications
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link 
                href="/admin/notifications" 
                className="w-full justify-center text-center text-sm font-medium cursor-pointer"
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
