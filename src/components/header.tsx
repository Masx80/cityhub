"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Search, Menu, Bell, Upload, LogIn, Mic, X, History, TrendingUp, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Sidebar from "@/components/sidebar";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { useUser, useClerk } from "@clerk/nextjs";
import { useState as useReactState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import { format, formatDistanceToNow } from "date-fns";
import { UploadButton } from "@/components/upload-button";

export default function Header() {
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [channelId, setChannelId] = useReactState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const { toast } = useToast();
  const { isSignedIn, user, isLoaded: authLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  
  const authLoading = !authLoaded;
  const { handleSearch: contextHandleSearch } = useSearch();

  // Check if user is logged in
  const isLoggedIn = !!user;
  const [channelHandle, setChannelHandle] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  // Fetch user's channel info
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/user/channel/me')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.channelHandle) {
            setChannelHandle(data.channelHandle);
          }
        })
        .catch(err => console.error('Error fetching channel data:', err));
      
      // Also check if the user has completed onboarding
      fetch('/api/user')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.hasCompletedOnboarding !== undefined) {
            setHasCompletedOnboarding(data.hasCompletedOnboarding);
          }
        })
        .catch(err => console.error('Error fetching user onboarding status:', err));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isSignedIn && user) {
      // Check if we have a cached channel ID
      const cachedChannelId = localStorage.getItem('userChannelId');
      const cachedTimestamp = localStorage.getItem('userChannelIdTimestamp');
      const now = Date.now();
      
      // Use cached data if less than 1 hour old
      if (cachedChannelId && cachedTimestamp && (now - parseInt(cachedTimestamp) < 3600000)) {
        console.log('Using cached channel ID:', cachedChannelId);
        setChannelId(cachedChannelId);
        return;
      }
      
      // Fallback ID to use while loading - use the Clerk user ID rather than a handle
      const fallbackChannelId = user.id;
      console.log('Using fallback channel ID (Clerk user ID):', fallbackChannelId);
      
      // Set fallback immediately to avoid loading state
      setChannelId(fallbackChannelId);
      
      // Fetch channel data silently in the background
      fetch('/api/user/channel/me')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch channel');
          return res.json();
        })
        .then(data => {
          console.log('Channel data from API:', data);
          
          // Prefer the database UUID as the channel ID for routing
          if (data.id) {
            console.log('Using database UUID as channel ID:', data.id);
            setChannelId(data.id);
            
            // Cache the ID
            localStorage.setItem('userChannelId', data.id);
            localStorage.setItem('userChannelIdTimestamp', now.toString());
          } else if (data.channelHandle) {
            // Fallback to handle if no ID (shouldn't happen)
            const channelHandle = data.channelHandle.replace(/^@/, '');
            console.log('Falling back to channel handle:', channelHandle);
            setChannelId(channelHandle);
            
            // Cache the channel ID
            localStorage.setItem('userChannelId', channelHandle);
            localStorage.setItem('userChannelIdTimestamp', now.toString());
          } else {
            // Cache the fallback ID
            console.log('No channel data found, using fallback ID:', fallbackChannelId);
            localStorage.setItem('userChannelId', fallbackChannelId);
            localStorage.setItem('userChannelIdTimestamp', now.toString());
          }
        })
        .catch(err => {
          console.error("Failed to fetch user channel:", err);
          // Cache the fallback ID on error
          localStorage.setItem('userChannelId', fallbackChannelId);
          localStorage.setItem('userChannelIdTimestamp', now.toString());
        });
    }
  }, [isSignedIn, user, setChannelId]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showMobileSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showMobileSearch]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);
  
  // Generate search suggestions from API
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const fetchSuggestions = async () => {
      if (search.trim().length > 0) {
        try {
          setShowSuggestions(true); // Show immediately with existing suggestions
          
          const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(search.trim())}`);
          
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions);
          }
        } catch (error) {
          console.error("Error fetching search suggestions:", error);
        }
      } else {
        setShowSuggestions(false);
      }
    };
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set a new timer to delay the API call (ultra-short debounce time for faster response)
    debounceTimer = setTimeout(fetchSuggestions, 50);
    
    // Cleanup on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [search]);
  
  // Load user search history
  useEffect(() => {
    const fetchSearchHistory = async () => {
      if (isSignedIn) {
        try {
          const response = await fetch('/api/search/history');
          
          if (response.ok) {
            const data = await response.json();
            setRecentSearches(data.history || []);
          }
        } catch (error) {
          console.error("Error fetching search history:", error);
        }
      }
    };
    
    fetchSearchHistory();
  }, [isSignedIn]);
  
  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Save recent search to API if user is signed in
  const saveRecentSearch = async (query: string) => {
    // Update local state first for immediate feedback
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    
    // Save to localStorage as fallback
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // If signed in, also save to API
    if (isSignedIn) {
      try {
        await fetch('/api/search/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ searchTerm: query }),
        });
      } catch (error) {
        console.error("Error saving search history:", error);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // Save to recent searches
      saveRecentSearch(search.trim());
      
      toast({
        title: "Search initiated",
        description: `Searching for "${search}"`,
        variant: "default"
      });
      
      // Use router.push with the shallow option to prevent full page refresh
      const currentPath = pathname === "/" ? "/" : "/?";
      const query = `q=${encodeURIComponent(search.trim())}`;
      
      router.push(`${currentPath}${currentPath.includes('?') ? '&' : '?'}${query}`, { 
        scroll: false 
      });
      
      if (showMobileSearch) {
        setShowMobileSearch(false);
      }
      
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    saveRecentSearch(suggestion);
    
    // Use router.push with the shallow option to prevent full page refresh
    const currentPath = pathname === "/" ? "/" : "/?";
    const query = `q=${encodeURIComponent(suggestion)}`;
    
    router.push(`${currentPath}${currentPath.includes('?') ? '&' : '?'}${query}`, { 
      scroll: false 
    });
    
    setShowSuggestions(false);
  };

  const handleVoiceSearch = () => {
    toast({
      title: "Voice Search",
      description: "Voice search activated. Please speak now.",
      variant: "default"
    });
  };

  const handleSignOut = async () => {
    try {
      setLoadingAuth(true);
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Sign-out failed:", error);
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingAuth(false);
    }
  };

  // Fetch notifications when component mounts and when dropdown opens
  useEffect(() => {
    // Initial fetch when component mounts (if user is signed in)
    if (isSignedIn) {
      fetchNotifications();
    }

    // Setup interval to periodically fetch notifications (every minute)
    const intervalId = setInterval(() => {
      if (isSignedIn) {
        fetchNotifications();
      }
    }, 60000); // 60 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [isSignedIn]);

  // Also fetch when notification dropdown opens
  useEffect(() => {
    if (notificationsOpen && isSignedIn) {
      fetchNotifications();
    }
  }, [notificationsOpen, isSignedIn]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await fetch('/api/notifications?limit=5');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.pagination.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        // Update local notification state to mark all as read
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  // Format timestamp for readability
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  // Get avatar background color based on notification type
  const getAvatarColor = (type: string) => {
    switch (type) {
      case "comment":
        return "bg-blue-500";
      case "subscription":
        return "bg-green-500";
      case "like":
        return "bg-purple-500";
      default:
        return "bg-orange-500";
    }
  };

  // Get avatar text from user name
  const getAvatarText = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle notification click based on type
  const handleNotificationClick = (notification: any) => {
    // Mark this notification as read
    markNotificationAsRead(notification.id);
    
    // Navigate to appropriate page based on notification type
    if (notification.type === "comment" && notification.video) {
      router.push(`/watch/${notification.video.id}`);
    } else if (notification.type === "subscription" && notification.actor) {
      router.push(`/channel/${notification.actor.channelHandle || notification.actor.id}`);
    } else if (notification.type === "like" && notification.video) {
      router.push(`/watch/${notification.video.id}`);
    }
  };

  // Mark a single notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: notificationId }),
      });
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-30 h-16 border-b px-4 md:px-6 bg-background ${
        scrolled ? "bg-background/80 backdrop-blur-md" : ""
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between h-full gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-lg md:text-xl"
          >
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </div>
            <div className="hidden md:block">
              <span className="text-orange-500">SexCity</span>
              <span className="bg-gradient-to-r from-white to-muted-foreground text-transparent bg-clip-text">Hub</span>
            </div>
            </Link>
        </div>

        {!isAuthPage && (
          <>
            <div className="flex-1 flex items-center gap-2 md:gap-4 justify-center max-w-6xl mx-auto">
              <form
                className="hidden md:flex flex-1 items-center max-w-2xl transition-all duration-300 relative"
                onSubmit={handleSearch}
              >
                <div className="relative w-full flex items-center">
                  <Input
                    type="search"
                    placeholder="Search videos..."
                    className="w-full bg-muted pr-12 focus-visible:ring-orange-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </div>
                
                {/* Search Suggestions */}
                {showSuggestions && (search.trim().length > 0 || recentSearches.length > 0) && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 w-full mt-1.5 bg-background/95 border border-border rounded-lg shadow-lg z-50 overflow-hidden backdrop-blur-md animate-in fade-in-50 duration-100"
                  >
                    {recentSearches.length > 0 && (
                      <div className="p-2">
                        <h3 className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center uppercase tracking-wider">
                          <History className="h-3 w-3 mr-1.5" />
                          Recent Searches
                        </h3>
                        <div className="grid grid-cols-1 gap-0.5 mt-1">
                          {recentSearches.map((item, index) => (
                            <button
                              key={`recent-${index}`}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 active:bg-accent rounded flex items-center truncate transition-colors"
                              onClick={() => handleSuggestionClick(item)}
                              type="button"
                            >
                              <History className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{item}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {search.trim().length > 0 && suggestions.length > 0 && (
                      <div className={`p-2 ${recentSearches.length > 0 ? 'border-t border-border' : ''}`}>
                        <h3 className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center uppercase tracking-wider">
                          <TrendingUp className="h-3 w-3 mr-1.5" />
                          Search Suggestions
                        </h3>
                        <div className="grid grid-cols-1 gap-0.5 mt-1">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={`suggestion-${index}`}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/50 active:bg-accent rounded flex items-center truncate transition-colors"
                              onClick={() => handleSuggestionClick(suggestion)}
                              type="button"
                            >
                              <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>

              {/* Mobile Search */}
              <div className="flex md:hidden items-center gap-2 flex-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileSearch(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3 md:gap-5">
              <ThemeToggle />

              <UploadButton />

              {isSignedIn && !loadingAuth ? (
                <>
                  <DropdownMenu onOpenChange={setNotificationsOpen}>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className={`text-muted-foreground relative rounded-full border-muted-foreground/20 hover:bg-orange-50 dark:hover:bg-orange-500/10 ${unreadCount > 0 ? 'text-orange-500 border-orange-300 dark:border-orange-500/30' : ''}`}
                        >
                          <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'fill-orange-500' : ''}`} />
                          {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                          )}
                          <span className="sr-only">Notifications</span>
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[350px] p-0 overflow-hidden rounded-xl border border-orange-100 dark:border-orange-500/20 shadow-lg">
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-900/20 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">{unreadCount} new</Badge>
                        )}
                      </div>
                      
                      <div className="max-h-[70vh] overflow-y-auto py-1">
                        {/* Notification Items */}
                        {loadingNotifications ? (
                          <div className="text-center py-8 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-3">
                              <Bell className="h-5 w-5 animate-pulse text-orange-500" />
                            </div>
                            <p className="text-sm text-muted-foreground">Loading notifications...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="text-center py-10 px-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                              <Bell className="h-8 w-8 text-orange-500/60" />
                            </div>
                            <p className="text-sm font-medium text-foreground/80 mb-1">No notifications yet</p>
                            <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">We'll notify you about activity on your videos and from channels you follow</p>
                          </div>
                        ) : (
                          <div>
                            {notifications.map((notification) => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0.8, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <DropdownMenuItem 
                                  className={`cursor-pointer flex items-start gap-3 py-3 px-4 hover:bg-orange-50 dark:hover:bg-orange-900/10 focus:bg-orange-50 dark:focus:bg-orange-900/10 ${!notification.read ? 'bg-orange-50/70 dark:bg-orange-900/5' : ''}`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <Avatar className="h-10 w-10 shrink-0 rounded-full shadow-sm">
                                    <AvatarImage 
                                      src={notification.actor.imageUrl} 
                                      alt={notification.actor.name}
                                    />
                                    <AvatarFallback className={`${getAvatarColor(notification.type)} text-white`}>
                                      {getAvatarText(notification.actor.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="grid gap-1 flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none">
                                      {notification.actor.name} 
                                      <span className="text-muted-foreground font-normal ml-1">
                                        {notification.type === "comment" && "commented on your video"}
                                        {notification.type === "subscription" && "subscribed to your channel"}
                                        {notification.type === "like" && "liked your video"}
                                      </span>
                                    </p>
                                    {notification.content && (
                                      <p className="text-xs text-foreground/70 truncate max-w-[220px]">
                                        "{notification.content}"
                                      </p>
                                    )}
                                    {notification.video && (
                                      <p className="text-xs text-muted-foreground truncate max-w-[220px] mt-0.5">
                                        On: <span className="text-foreground/70">{notification.video.title}</span>
                                      </p>
                                    )}
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                      {formatTimestamp(notification.createdAt)}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full shrink-0 shadow-sm" />
                                  )}
                                </DropdownMenuItem>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {unreadCount > 0 && (
                        <div className="px-4 py-2 bg-orange-50/50 dark:bg-orange-900/5 border-t border-orange-100 dark:border-orange-950/10">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-orange-500 border-orange-200 dark:border-orange-500/20 hover:bg-orange-100/50 dark:hover:bg-orange-900/10"
                            onClick={markAllAsRead}
                          >
                            Mark all as read
                          </Button>
                        </div>
                      )}
                      
                      <div className="px-4 py-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center text-sm"
                          asChild
                        >
                          <Link href="/notifications">
                            View all notifications
                          </Link>
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer"
                      >
                        <div className="relative rounded-full overflow-hidden group border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-500/30 transition-all">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarImage src={user?.imageUrl || ""} alt={user?.firstName || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                              {user?.firstName?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {isSignedIn && (
                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-background">
                              <span className="absolute inset-0 rounded-full bg-green-500 animate-spread" />
                            </span>
                          )}
                        </div>
                        <style jsx>{`
                          @keyframes spread {
                            0% {
                              transform: scale(1);
                              opacity: 0.6;
                            }
                            100% {
                              transform: scale(2.5);
                              opacity: 0;
                            }
                          }
                          .animate-spread {
                            animation: spread 1.8s ease-out infinite;
                          }
                        `}</style>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 p-0 rounded-xl overflow-hidden shadow-lg" align="end" forceMount>
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-900/20 p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                            <AvatarImage src={user?.imageUrl || ""} alt={user?.firstName || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                              {user?.firstName?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="font-medium">{user?.firstName || "User"}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {user?.emailAddresses?.[0]?.emailAddress || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer flex items-center h-9 px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/10">
                          <Link 
                            href={hasCompletedOnboarding ? (channelHandle ? `/channel/${channelHandle.replace(/^@/, '')}` : "/settings") : "/onboarding/channel"} 
                            className="flex w-full"
                          >
                            <UserCircle className="mr-2 h-4 w-4 text-orange-500" />
                            <span>{hasCompletedOnboarding ? "Your Channel" : "Create Channel"}</span>
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer flex items-center h-9 px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/10">
                          <Link href="/settings" className="flex w-full">
                            <svg className="mr-2 h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>Settings</span>
                          </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer flex items-center h-9 px-3 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/10">
                          <Link href="/subscriptions" className="flex w-full">
                            <svg className="mr-2 h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 11a9 9 0 0 1 9 9"></path>
                              <path d="M4 4a16 16 0 0 1 16 16"></path>
                              <circle cx="5" cy="19" r="2"></circle>
                            </svg>
                            <span>Subscriptions</span>
                          </Link>
                        </DropdownMenuItem>
                      </div>
                      
                      <div className="p-2 border-t border-border mt-1">
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          disabled={loadingAuth}
                          className="rounded-lg cursor-pointer flex items-center h-9 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          {loadingAuth ? "Signing out..." : "Sign out"}
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/auth">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs md:text-sm px-2 md:px-3"
                  >
                    <LogIn className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="whitespace-nowrap">Sign In</span>
                  </Button>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden">
          <div className="absolute left-0 top-0 h-full w-64 bg-background border-r border-border overflow-y-auto">
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar isMobile={true} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile search overlay */}
      {showMobileSearch && (
        <motion.div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            className="flex items-center justify-center w-full h-16 relative px-4"
            onSubmit={handleSearch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-full flex items-center">
              <Input
                type="search"
                placeholder="Search videos..."
                className="w-full bg-muted pr-10 focus-visible:ring-orange-500 text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowMobileSearch(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Mobile Search Suggestions */}
            {(search.trim().length > 0 || recentSearches.length > 0) && (
              <div 
                className="absolute top-full left-0 w-full mt-2 bg-background/95 border border-border rounded-lg shadow-lg z-50 max-h-[60vh] overflow-y-auto backdrop-blur-md animate-in fade-in-50 duration-100 mx-4"
              >
                {recentSearches.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center uppercase tracking-wider">
                      <History className="h-3 w-3 mr-1.5" />
                      Recent Searches
                    </h3>
                    <div className="grid grid-cols-1 gap-0.5 mt-1">
                      {recentSearches.map((item, index) => (
                        <button
                          key={`mobile-recent-${index}`}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent/50 active:bg-accent rounded flex items-center truncate transition-colors"
                          onClick={() => handleSuggestionClick(item)}
                          type="button"
                        >
                          <History className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {search.trim().length > 0 && suggestions.length > 0 && (
                  <div className={`p-2 ${recentSearches.length > 0 ? 'border-t border-border' : ''}`}>
                    <h3 className="text-xs font-medium text-muted-foreground px-2 py-1.5 flex items-center uppercase tracking-wider">
                      <TrendingUp className="h-3 w-3 mr-1.5" />
                      Search Suggestions
                    </h3>
                    <div className="grid grid-cols-1 gap-0.5 mt-1">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={`mobile-suggestion-${index}`}
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent/50 active:bg-accent rounded flex items-center truncate transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                          type="button"
                        >
                          <Search className="h-3.5 w-3.5 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.form>
        </motion.div>
      )}
    </motion.header>
  );
}
