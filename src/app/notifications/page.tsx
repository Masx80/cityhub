"use client";

import { useState, useEffect, useCallback } from "react";
import { format, formatDistanceToNow } from "date-fns";
import PageTransition from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  type: string;
  read: boolean;
  content?: string;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    imageUrl: string;
    channelName: string;
    channelHandle?: string;
  };
  video?: {
    id: string;
    title: string;
    thumbnail?: string;
  };
}

interface PaginationData {
  total: number;
  unreadCount: number;
  pages: number;
  page: number;
  limit: number;
}

// Helper function to get avatar background color based on notification type
const getAvatarColor = (type: string) => {
  switch (type) {
    case "comment":
      return "bg-blue-500";
    case "subscription":
      return "bg-green-500";
    case "like":
      return "bg-purple-500";
    case "dislike":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    unreadCount: 0,
    pages: 1,
    page: 1,
    limit: 20
  });
  
  const { toast } = useToast();

  // Fetch notifications from the API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // Determine the URL based on the active tab
      let url = `/api/notifications?page=1&limit=20`;
      if (activeTab === "unread") {
        url += "&unread=true";
      } else if (activeTab !== "all") {
        url += `&type=${activeTab}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setPagination(data.pagination || {
        total: 0,
        unreadCount: 0,
        pages: 1,
        page: 1,
        limit: 20
      });
      
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  // Fetch notifications when the page loads or when the active tab changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
      
      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }
      
      // Update local notification state to mark all as read
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setPagination(prev => ({
        ...prev,
        unreadCount: 0
      }));
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "default"
      });
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };

  // Mark a single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: notificationId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
      
      // Update local notification state to mark this notification as read
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      setPagination(prev => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  // Clear all notifications (for demo purposes, just refresh with empty array)
  const clearAll = () => {
    toast({
      title: "Info",
      description: "This feature is not yet implemented",
      variant: "default"
    });
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

  // Filter notifications based on active tab
  const filteredNotifications = notifications;

  // Calculate unread count
  const unreadCount = pagination.unreadCount;

  return (
    <PageTransition>
      <div className="container py-6 md:py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold flex items-center">
            <Bell className="h-5 w-5 md:h-6 md:w-6 mr-2 text-orange-500" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-orange-500">{unreadCount} new</Badge>
            )}
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs md:text-sm"
            >
              <Check className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Mark all as read</span>
              <span className="sm:hidden">Mark all</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAll}
              disabled={filteredNotifications.length === 0}
              className="text-xs md:text-sm"
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Clear all</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center justify-center">
              <span>Unread</span>
              {unreadCount > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comment">
              <span className="hidden md:inline">Comments</span>
              <span className="md:hidden">Com.</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="hidden md:block">Subscriptions</TabsTrigger>
            <TabsTrigger value="like" className="hidden md:block">Likes</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="text-center py-8 md:py-12 bg-muted/30 rounded-lg">
                <Bell className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                <h3 className="text-base md:text-lg font-medium">Loading notifications...</h3>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 md:py-12 bg-muted/30 rounded-lg">
                <Bell className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-base md:text-lg font-medium">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any {activeTab !== "all" ? activeTab : ""} notifications at the moment.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex gap-3 md:gap-4 p-3 md:p-4 rounded-lg relative ${
                    notification.read ? "bg-card" : "bg-orange-500/5 border border-orange-500/20"
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                    {notification.actor.imageUrl ? (
                      <AvatarImage src={notification.actor.imageUrl} alt={notification.actor.name} />
                    ) : (
                      <AvatarFallback className={`${getAvatarColor(notification.type)} text-white`}>
                        {notification.actor.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                      <h3 className="font-medium text-sm md:text-base truncate">
                        {notification.actor.channelName || notification.actor.name} 
                        {notification.type === "comment" && " commented on your video"}
                        {notification.type === "subscription" && " subscribed to your channel"}
                        {notification.type === "like" && " liked your video"}
                        {notification.type === "dislike" && " disliked your video"}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>
                    
                    {notification.content && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {notification.content}
                      </p>
                    )}
                    
                    {notification.video && (
                      <p className="text-xs font-medium mt-1 truncate">
                        <span className="text-muted-foreground">On: </span>
                        <span className="text-primary">{notification.video.title}</span>
                      </p>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <div className="absolute right-3 top-3 md:right-4 md:top-4 w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
} 