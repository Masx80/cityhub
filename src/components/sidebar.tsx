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
    expanded: { width: isMobile ? "16rem" : "12rem" },
    collapsed: { width: isMobile ? "16rem" : "4rem" },
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
        className="flex items-center justify-between p-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {(!isCollapsed || isMobile) && (
          <motion.span
            className="text-sm font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          ></motion.span>
        )}
        {!isMobile && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
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
                className="flex items-center px-2 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
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
                  <Link
                    href={route.href}
                    className={cn(
                      "relative flex items-center rounded-lg px-2 py-2 text-sm transition-all hover:bg-accent gap-2",
                      route.active
                        ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-primary font-medium"
                        : "text-muted-foreground",
                      isCollapsed && !isMobile && "justify-center"
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
                    {(!isCollapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {route.label}
                      </motion.span>
                    )}
                    {route.active && (!isCollapsed || isMobile) && (
                      <motion.div
                        className="absolute left-0 w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full"
                        initial={{ height: 0 }}
                        animate={{ height: "1.25rem" }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
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
                className="flex items-center px-2 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
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
                  <Link
                    href={route.href}
                    className={cn(
                      "relative flex items-center rounded-lg px-2 py-2 text-sm transition-all hover:bg-accent gap-2",
                      route.active
                        ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-primary font-medium"
                        : "text-muted-foreground",
                      isCollapsed && !isMobile && "justify-center"
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
                    {(!isCollapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {route.label}
                      </motion.span>
                    )}
                    {route.active && (!isCollapsed || isMobile) && (
                      <motion.div
                        className="absolute left-0 w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full"
                        initial={{ height: 0 }}
                        animate={{ height: "1.25rem" }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
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
                className="flex items-center px-2 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
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
                      className="flex items-center gap-2 rounded-lg px-2 py-2 animate-pulse"
                    >
                      <div className="h-7 w-7 rounded-full bg-muted"></div>
                      {(!isCollapsed || isMobile) && <div className="h-4 w-24 bg-muted rounded"></div>}
                    </div>
                  ))
                ) : channelsToShow.length > 0 ? (
                  // Show channel list (either subscriptions or all channels)
                  channelsToShow.map((item) => {
                    const handle = item.handle || `@${item.name.toLowerCase().replace(/\s+/g, '-')}`;
                    const channelPath = `/channel/${handle.replace(/^@/, '')}`;
                    
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          <Link
                            href={channelPath}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-all",
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
                            {(isCollapsed && !isMobile) ? null : (
                              <div className="flex-1 text-xs truncate max-w-[7rem]">
                                {item.name}
                                {pathname === channelPath && isActive && (
                                  <span className="ml-1 text-[10px] text-red-500">LIVE</span>
                                )}
                              </div>
                            )}
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
                    );
                  })
                ) : (
                  // No channels or subscriptions found message
                  <div className="px-3 py-2 text-sm text-muted-foreground">
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
