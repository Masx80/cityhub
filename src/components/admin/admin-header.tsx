"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Search, X, User, Film, Tag, LayoutDashboard, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "@/components/theme-toggle"
import Link from "next/link"
import { globalSearch, getAdminNotifications, markAdminNotificationAsRead, deleteAdminNotification } from "@/actions/admin"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow, format } from "date-fns"
import { toast } from "sonner"

type AdminHeaderProps = {
  user?: any
}

// Explicitly define notification response type to match what comes from the server
type ServerNotification = {
  id: string;
  type: string;
  recipientId: string;
  actorId: string | null;
  content: string;
  read: boolean;
  createdAt: Date;
  videoId: string | null;
  commentId: string | null;
  actor: {
    id: string;
    clerkId: string;
    name: string;
    imageUrl: string;
    channelName: string | null;
    channelHandle: string | null;
  } | null;
  video: {
    id: string;
    videoId: string;
    title: string;
    thumbnail: string;
  } | null;
}

// Define client-side notification type with string createdAt
interface AdminNotification {
  id: string;
  type: string;
  recipientId: string;
  actorId: string | null;
  content: string;
  read: boolean;
  createdAt: string;
  videoId: string | null;
  commentId: string | null;
  actor?: {
    id: string;
    clerkId: string;
    name: string;
    imageUrl: string;
    channelName: string | null;
    channelHandle: string | null;
  } | null;
  video?: {
    id: string;
    videoId: string;
    title: string;
    thumbnail: string;
  } | null;
}

type SearchResult = {
  users: any[];
  videos: any[];
  categories: any[];
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true)
      const result = await getAdminNotifications(1, 5)
      
      // Convert server notification to client notification format
      const processedNotifications: AdminNotification[] = result.notifications.map(notification => ({
        ...notification,
        createdAt: notification.createdAt instanceof Date 
          ? notification.createdAt.toISOString() 
          : String(notification.createdAt)
      }))
      
      setNotifications(processedNotifications)
      setUnreadCount(result.pagination.unreadCount)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }
  
  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Perform search
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (search.trim().length >= 2) {
        try {
          setIsSearching(true)
          const results = await globalSearch(search)
          setSearchResults(results)
          setShowResults(true)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults(null)
        setShowResults(false)
      }
    }, 300)
    
    return () => clearTimeout(searchTimer)
  }, [search])
  
  // Handle search input submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(search.trim())}`)
      setShowResults(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await markAdminNotificationAsRead(id)
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ))
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      toast.error("Failed to mark notification as read")
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAdminNotificationAsRead() // No ID means mark all as read
      setNotifications(notifications.map(notification => ({ ...notification, read: true })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      toast.error("Failed to mark all notifications as read")
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await deleteAdminNotification(id)
      const updatedNotifications = notifications.filter(notification => notification.id !== id)
      setNotifications(updatedNotifications)
      
      // Update unread count if the removed notification was unread
      const wasUnread = notifications.find(n => n.id === id)?.read === false
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      toast.success("Notification removed")
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast.error("Failed to delete notification")
    }
  };
  
  const navigateToResult = (type: string, id: string) => {
    let url = '/admin'
    switch (type) {
      case 'user':
        url = `/admin/users/${id}`
        break
      case 'video':
        url = `/admin/content/${id}`
        break
      case 'category':
        url = `/admin/categories/${id}`
        break
    }
    router.push(url)
    setShowResults(false)
    setSearch('')
  }

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

      <div className="flex-1 max-w-md mx-4" ref={searchRef}>
        <div className="relative">
          <form onSubmit={handleSearchSubmit}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users, videos, or categories..."
              className="w-full pl-8 bg-muted pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (searchResults && search.trim().length >= 2) {
                  setShowResults(true)
                }
              }}
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => {
                  setSearch("")
                  setShowResults(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border border-border rounded-md shadow-md overflow-hidden">
              {isSearching ? (
                <div className="p-4 text-center">
                  <div className="inline-block h-5 w-5 border-2 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
                  <p className="text-sm mt-2">Searching...</p>
                </div>
              ) : (
                searchResults && (
                  <div className="max-h-[400px] overflow-y-auto">
                    {searchResults.users.length === 0 && 
                     searchResults.videos.length === 0 && 
                     searchResults.categories.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No results found for "{search}"
                      </div>
                    ) : (
                      <>
                        {/* Users Section */}
                        {searchResults.users.length > 0 && (
                          <div>
                            <div className="px-3 py-2 bg-muted/50 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="text-xs font-medium">Users</span>
                            </div>
                            <ul>
                              {searchResults.users.map(user => (
                                <li 
                                  key={user.id} 
                                  className="px-3 py-2 hover:bg-muted cursor-pointer"
                                  onClick={() => navigateToResult('user', user.clerkId)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      {user.imageUrl ? (
                                        <AvatarImage src={user.imageUrl} alt={user.name} />
                                      ) : (
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{user.name}</p>
                                      {user.channelHandle && (
                                        <p className="text-xs text-muted-foreground">@{user.channelHandle}</p>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Videos Section */}
                        {searchResults.videos.length > 0 && (
                          <div>
                            <div className="px-3 py-2 bg-muted/50 flex items-center gap-2">
                              <Film className="h-4 w-4" />
                              <span className="text-xs font-medium">Videos</span>
                            </div>
                            <ul>
                              {searchResults.videos.map(video => (
                                <li 
                                  key={video.id} 
                                  className="px-3 py-2 hover:bg-muted cursor-pointer"
                                  onClick={() => navigateToResult('video', video.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-10 h-6 overflow-hidden rounded bg-muted">
                                      {video.thumbnail ? (
                                        <img src={video.thumbnail} alt="" className="object-cover w-full h-full" />
                                      ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                          <Film className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{video.title}</p>
                                      <p className="text-xs text-muted-foreground">{video.userName}</p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Categories Section */}
                        {searchResults.categories.length > 0 && (
                          <div>
                            <div className="px-3 py-2 bg-muted/50 flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              <span className="text-xs font-medium">Categories</span>
                            </div>
                            <ul>
                              {searchResults.categories.map(category => (
                                <li 
                                  key={category.id} 
                                  className="px-3 py-2 hover:bg-muted cursor-pointer"
                                  onClick={() => navigateToResult('category', category.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">{category.name}</p>
                                      {category.description && (
                                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                                          {category.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* View All Results Link */}
                        <div className="px-3 py-2 border-t border-border">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-center"
                            onClick={() => {
                              router.push(`/admin/search?q=${encodeURIComponent(search)}`)
                              setShowResults(false)
                            }}
                          >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            View all results
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )
              )}
            </div>
          )}
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
              {isLoadingNotifications ? (
                <div className="py-4 text-center">
                  <div className="inline-block h-5 w-5 border-2 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
                  <p className="text-sm mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <DropdownMenuGroup>
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <div 
                        className={`flex items-start gap-2 w-full p-2 cursor-default ${!notification.read ? "bg-muted/50" : ""}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex-1 min-w-0">
                          {notification.actor ? (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                {notification.actor.imageUrl ? (
                                  <AvatarImage src={notification.actor.imageUrl} alt={notification.actor.name} />
                                ) : (
                                  <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-xs font-medium">{notification.actor.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>S</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">System</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{notification.content}</p>
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
                          
                          {notification.video && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-8 h-5 overflow-hidden rounded bg-muted">
                                {notification.video.thumbnail ? (
                                  <img src={notification.video.thumbnail} alt="" className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Film className="h-3 w-3 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{notification.video.title}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                          </div>
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
