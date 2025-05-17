"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Search, X, User, Film, Tag, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ThemeToggle from "@/components/theme-toggle"
import Link from "next/link"
import { globalSearch } from "@/actions/admin"
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
