"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  TrendingUp,
  History,
  Users,
  Bookmark,
  Clock,
  Heart,
  Compass,
  Menu,
  X,
  User,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { useUser } from "@clerk/nextjs";

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

// Define a proper type for subscriptions
interface Subscription {
  id: string;
  name: string;
  handle?: string;
  image?: string;
  avatar?: string;
  creator?: {
    channelAvatarUrl?: string;
    imageUrl?: string;
  };
}

// Define a proper type for channels
interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  image?: string;
  description?: string;
}

// Define types for API responses
interface SubscriptionApiData {
  id: string;
  creator?: {
    channelName?: string;
    name?: string;
    channelHandle?: string;
    channelAvatarUrl?: string;
    imageUrl?: string;
  };
  [key: string]: any;
}

export default function Sidebar({ isMobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { isSignedIn, isLoaded: authLoaded } = useUser();

  // Initialize with a default value that works for server and client
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isTablet, setIsTablet] = useState(false);
  const [isActive, setIsActive] = useState(false); // Add isActive state
  const [channels, setChannels] = useState<Channel[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all channels
  useEffect(() => {
    async function fetchChannels() {
      try {
        const response = await fetch("/api/channels");
        if (response.ok) {
          const data = await response.json();
          setChannels(data);
        } else {
          console.error("Failed to fetch channels");
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);

  // Fetch user subscriptions if authenticated
  useEffect(() => {
    if (isSignedIn) {
      async function fetchSubscriptions() {
        try {
          const response = await fetch("/api/subscriptions");
          if (response.ok) {
            const data = await response.json();
            // Map subscription data to match expected format
            const formattedSubscriptions = (data.subscriptions || []).map((sub: SubscriptionApiData) => ({
              id: sub.id,
              name: sub.creator?.channelName || sub.creator?.name || "Unknown Channel",
              handle: sub.creator?.channelHandle || "",
              image: sub.creator?.channelAvatarUrl || sub.creator?.imageUrl || "",
              avatar: sub.creator?.channelAvatarUrl || sub.creator?.imageUrl || ""
            }));
            setSubscriptions(formattedSubscriptions);
          } else {
            console.error("Failed to fetch subscriptions");
          }
        } catch (error) {
          console.error("Error fetching subscriptions:", error);
        }
      }

      fetchSubscriptions();
    }
  }, [isSignedIn]);

  useEffect(() => {
    // Update the collapsed state based on window width only on the client side
    const width = window.innerWidth;
    setIsCollapsed(width >= 768);
    
    const handleResize = () => {
      const width = window.innerWidth;
      const tabletMode = width >= 768 && width <= 1024;
      setIsTablet(tabletMode);
      if (!isMobile) {
        setIsCollapsed(width >= 768);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mainRoutes = [
    { label: "Home", icon: Home, href: "/", active: pathname === "/" },
    {
      label: "Trending",
      icon: TrendingUp,
      href: "/trending",
      active: pathname === "/trending",
    },
    {
      label: "Latest",
      icon: Clock,
      href: "/latest",
      active: pathname === "/latest",
    },
  ];

  const libraryRoutes = [
    {
      label: "All Channels",
      icon: Users,
      href: "/all-channels",
      active: pathname === "/all-channels",
      description: "Browse all channels on the platform"
    },
    {
      label: "History",
      icon: History,
      href: "/history",
      active: pathname === "/history",
    },
    {
      label: "Watch Later",
      icon: Clock,
      href: "/watch-later",
      active: pathname === "/watch-later",
    },
    {
      label: "Liked Videos",
      icon: Heart,
      href: "/liked",
      active: pathname === "/liked",
    },
  ];

  const sidebarVariants = {
    expanded: { width: isMobile ? "100%" : "12rem" },
    collapsed: { width: isMobile ? "100%" : "4rem" },
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Determine what to show in the subscriptions/channels section
  const hasSubscriptions = subscriptions.length > 0;
  const sectionTitle = isSignedIn && hasSubscriptions ? "Subscriptions" : "Channels";
  const channelsToShow = isSignedIn && hasSubscriptions ? subscriptions : channels;

  const getAvatarSrc = (item: Channel | Subscription) => {
    // Check for all possible avatar/image properties
    return item.image || 
           item.avatar || 
           (item as Subscription).creator?.channelAvatarUrl || 
           (item as Subscription).creator?.imageUrl || 
           "";
  };

  // Helper function to handle navigation click
  const handleNavClick = () => {
    if (isMobile && onNavigate) {
      onNavigate();
    }
  };

  // Render different sidebar for mobile and desktop
  if (isMobile) {
    return (
      <motion.div
        className="flex flex-col h-full w-full bg-card/90 backdrop-blur-sm border-r border-border overflow-hidden"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Mobile Header with App Logo/Brand */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center space-x-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg gradient-text">SexCityHub</span>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="flex-1 overflow-auto p-2 pt-3 scrollbar-hide">
          {/* Main Section */}
          <div className="mb-5">
            <div className="flex items-center px-3 mb-2">
              <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Main
              </h2>
            </div>
            <div className="space-y-1">
              {mainRoutes.map((route, index) => (
                <motion.div
                  key={route.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center p-3 rounded-xl text-sm transition-all",
                      route.active
                        ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                    onClick={handleNavClick}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-full mr-3",
                      route.active ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20" : "bg-secondary"
                    )}>
                      <route.icon
                        className={cn(
                          "h-5 w-5",
                          route.active ? "text-primary" : "text-foreground/70"
                        )}
                      />
                    </div>
                    <span className="font-medium">{route.label}</span>
                    {route.active && (
                      <div className="ml-auto">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Library Section */}
          <div className="mb-5">
            <div className="flex items-center px-3 mb-2">
              <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Library
              </h2>
            </div>
            <div className="space-y-1">
              {libraryRoutes.map((route, index) => (
                <motion.div
                  key={route.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center p-3 rounded-xl text-sm transition-all",
                      route.active
                        ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                    onClick={handleNavClick}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-full mr-3",
                      route.active ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20" : "bg-secondary"
                    )}>
                      <route.icon
                        className={cn(
                          "h-5 w-5",
                          route.active ? "text-primary" : "text-foreground/70"
                        )}
                      />
                    </div>
                    <span className="font-medium">{route.label}</span>
                    {route.active && (
                      <div className="ml-auto">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Channels/Subscriptions Section */}
          <div className="mb-5">
            <div className="flex items-center px-3 mb-2">
              <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                {sectionTitle}
              </h2>
            </div>
            <div className="space-y-1">
              {loading ? (
                // Show loading skeleton for channels
                Array(4).fill(0).map((_, i) => (
                  <div 
                    key={`skeleton-${i}`}
                    className="flex items-center p-3 rounded-xl animate-pulse"
                  >
                    <div className="h-9 w-9 rounded-full bg-muted mr-3"></div>
                    <div className="h-4 w-28 bg-muted rounded"></div>
                  </div>
                ))
              ) : channelsToShow.length > 0 ? (
                channelsToShow.map((item) => {
                  const handle = item.handle || `@${item.name.toLowerCase().replace(/\s+/g, '-')}`;
                  const channelPath = `/channel/${handle.replace(/^@/, '')}`;
                  const isChannelActive = pathname === channelPath;
                  
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={channelPath}
                        className={cn(
                          "flex items-center p-3 rounded-xl text-sm transition-all",
                          isChannelActive
                            ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/50"
                        )}
                        onClick={handleNavClick}
                      >
                        <Avatar className={cn(
                          "h-9 w-9 mr-3",
                          isChannelActive ? "ring-2 ring-primary/40" : ""
                        )}>
                          <AvatarImage 
                            src={getAvatarSrc(item)} 
                            alt={item.name} 
                          />
                          <AvatarFallback className="uppercase bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                            {item.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[8rem]">
                            {handle}
                            {isActive && isChannelActive && (
                              <span className="ml-1 text-red-500 font-bold">· LIVE</span>
                            )}
                          </p>
                        </div>
                        {isChannelActive && (
                          <div className="ml-auto">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          </div>
                        )}
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-3 text-sm text-muted-foreground">
                  {isSignedIn ? "No subscriptions yet" : "No channels available"}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Original desktop sidebar code
  return (
    <motion.div
      className={cn(
        "flex h-full flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
        isMobile ? "w-64" : isCollapsed ? "w-16" : "hidden md:flex w-48"
      )}
      variants={sidebarVariants}
      animate={isCollapsed && !isMobile ? "collapsed" : "expanded"}
      transition={{ duration: 0.1, ease: "easeInOut" }}
    >
      <motion.div
        className="flex items-center justify-between p-3 border-b border-border/40"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {(!isCollapsed || isMobile) && (
          <motion.div className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isMobile && (
              <>
                <Compass className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm gradient-text">SexCityHub</span>
              </>
            )}
          </motion.div>
        )}
        {!isMobile && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-full hover:bg-accent"
            >
              {isCollapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        )}
      </motion.div>

      <div className="flex-1 overflow-auto py-3 scrollbar-hide">
        <nav className={cn("space-y-5", isCollapsed ? "px-2" : "px-2")}>
          <div>
            {(!isCollapsed || isMobile) && (
              <motion.div
                className="flex items-center px-3 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  Main
                </h2>
              </motion.div>
            )}
            <div className="space-y-1">
              {mainRoutes.map((route, index) => (
                <motion.div
                  key={route.href}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCollapsed && !isMobile ? (
                    <Link
                      href={route.href}
                      className={cn(
                        "relative flex items-center rounded-lg px-2 py-2 text-sm transition-all hover:bg-accent gap-2",
                        route.active
                          ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-primary font-medium"
                          : "text-muted-foreground",
                        "justify-center"
                      )}
                      onClick={handleNavClick}
                    >
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <route.icon
                          className={cn(
                            "h-5 w-5",
                            route.active && "text-primary animate-pulse-glow"
                          )}
                        />
                      </motion.div>
                      {route.active && (
                        <motion.div
                          className="absolute left-0 w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full"
                          initial={{ height: 0 }}
                          animate={{ height: "1.25rem" }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  ) : (
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center p-3 rounded-xl text-sm transition-all",
                        route.active
                          ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                      onClick={handleNavClick}
                    >
                      <div className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-full mr-3",
                        route.active ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20" : "bg-secondary"
                      )}>
                        <route.icon
                          className={cn(
                            "h-4 w-4",
                            route.active ? "text-primary" : "text-foreground/70"
                          )}
                        />
                      </div>
                      <span className="font-medium">{route.label}</span>
                      {route.active && (
                        <div className="ml-auto">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                      )}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {(!isCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Separator />
            </motion.div>
          )}

          <div>
            {(!isCollapsed || isMobile) && (
              <motion.div
                className="flex items-center px-3 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  Library
                </h2>
              </motion.div>
            )}
            <div className="space-y-1">
              {libraryRoutes.map((route, index) => (
                <motion.div
                  key={route.href}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * (index + mainRoutes.length) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCollapsed && !isMobile ? (
                    <Link
                      href={route.href}
                      className={cn(
                        "relative flex items-center rounded-lg px-2 py-2 text-sm transition-all hover:bg-accent gap-2",
                        route.active
                          ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-primary font-medium"
                          : "text-muted-foreground",
                        "justify-center"
                      )}
                      onClick={handleNavClick}
                    >
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <route.icon
                          className={cn(
                            "h-5 w-5",
                            route.active && "text-primary animate-pulse-glow"
                          )}
                        />
                      </motion.div>
                      {route.active && (
                        <motion.div
                          className="absolute left-0 w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full"
                          initial={{ height: 0 }}
                          animate={{ height: "1.25rem" }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  ) : (
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center p-3 rounded-xl text-sm transition-all",
                        route.active
                          ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                      onClick={handleNavClick}
                    >
                      <div className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-full mr-3",
                        route.active ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20" : "bg-secondary"
                      )}>
                        <route.icon
                          className={cn(
                            "h-4 w-4",
                            route.active ? "text-primary" : "text-foreground/70"
                          )}
                        />
                      </div>
                      <span className="font-medium">{route.label}</span>
                      {route.active && (
                        <div className="ml-auto">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                      )}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {(!isCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Separator />
            </motion.div>
          )}

          <div>
            {(!isCollapsed || isMobile) && (
              <motion.div
                className="flex items-center px-3 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                  {sectionTitle}
                </h2>
              </motion.div>
            )}
            <div className="space-y-1">
              <TooltipProvider>
                {loading ? (
                  // Show loading skeleton for channels
                  Array(4).fill(0).map((_, i) => (
                    <div 
                      key={`skeleton-${i}`}
                      className={cn(
                        "flex items-center gap-2 animate-pulse",
                        isCollapsed && !isMobile ? "px-2 py-2" : "p-3 rounded-xl"
                      )}
                    >
                      <div className={cn(
                        "rounded-full bg-muted", 
                        isCollapsed && !isMobile ? "h-7 w-7" : "h-8 w-8 mr-3"
                      )}></div>
                      {(!isCollapsed || isMobile) && <div className="h-4 w-24 bg-muted rounded"></div>}
                    </div>
                  ))
                ) : channelsToShow.length > 0 ? (
                  // Show channel list (either subscriptions or all channels)
                  channelsToShow.map((item) => {
                    const handle = item.handle || `@${item.name.toLowerCase().replace(/\s+/g, '-')}`;
                    const channelPath = `/channel/${handle.replace(/^@/, '')}`;
                    const isChannelActive = pathname === channelPath;
                    
                    return isCollapsed && !isMobile ? (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Link
                            href={channelPath}
                            className={cn(
                              "flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm transition-all",
                              pathname === channelPath ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                            )}
                            onClick={handleNavClick}
                          >
                            <Avatar className="flex-shrink-0 h-6 w-6">
                              <AvatarImage 
                                src={getAvatarSrc(item)} 
                                alt={item.name} 
                              />
                              <AvatarFallback className="uppercase text-xs">
                                {item.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="start" className="font-medium">
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            {pathname === channelPath && isActive && (
                              <span className="text-xs text-red-500">LIVE NOW</span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={channelPath}
                          className={cn(
                            "flex items-center p-3 rounded-xl text-sm transition-all",
                            isChannelActive
                              ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent/50"
                          )}
                          onClick={handleNavClick}
                        >
                          <Avatar className={cn(
                            "h-8 w-8 mr-3",
                            isChannelActive ? "ring-2 ring-primary/40" : ""
                          )}>
                            <AvatarImage 
                              src={getAvatarSrc(item)} 
                              alt={item.name} 
                            />
                            <AvatarFallback className="uppercase bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                              {item.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-xs">{item.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[7rem]">
                              {handle}
                              {isActive && isChannelActive && (
                                <span className="ml-1 text-red-500 font-bold">· LIVE</span>
                              )}
                            </p>
                          </div>
                          {isChannelActive && (
                            <div className="ml-auto">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                            </div>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })
                ) : (
                  // No channels or subscriptions found message
                  <div className={cn(
                    "text-sm text-muted-foreground",
                    isCollapsed && !isMobile ? "px-3 py-2" : "p-3"
                  )}>
                    {isSignedIn ? "No subscriptions yet" : "No channels available"}
                  </div>
                )}
              </TooltipProvider>
            </div>
          </div>
        </nav>
      </div>
    </motion.div>
  );
}
