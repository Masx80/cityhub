"use client"

import { useState, useEffect } from "react"
import { getAdminNotifications, markAdminNotificationAsRead, deleteAdminNotification } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Bell, Check, ChevronLeft, ChevronRight, Clock, Film, Filter, RefreshCcw, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

// Match the exact structure returned by the API
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

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState("10");

  // Fetch notifications with pagination and filter
  const fetchNotifications = async (page: number, showUnreadOnly: boolean = false) => {
    try {
      setIsLoading(true);
      const result = await getAdminNotifications(
        page,
        parseInt(itemsPerPage),
        showUnreadOnly
      );
      
      // Convert Date objects to ISO strings
      const formattedNotifications = result.notifications.map(notification => ({
        ...notification,
        createdAt: notification.createdAt instanceof Date 
          ? notification.createdAt.toISOString() 
          : String(notification.createdAt)
      }));
      
      setNotifications(formattedNotifications);
      setTotalPages(result.pagination.pages);
      setTotalNotifications(result.pagination.total);
      setUnreadCount(result.pagination.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications on component mount and when dependencies change
  useEffect(() => {
    fetchNotifications(currentPage, activeTab === "unread");
  }, [currentPage, itemsPerPage, activeTab]);

  // Handle marking a notification as read
  const markAsRead = async (id: string) => {
    try {
      await markAdminNotificationAsRead(id);
      
      // Update the local state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
      
      // Update unread count
      if (activeTab !== "read") {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  // Handle marking all notifications as read
  const markAllAsRead = async () => {
    try {
      await markAdminNotificationAsRead();
      
      // Update the local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  // Handle deleting a notification
  const deleteNotification = async (id: string) => {
    try {
      await deleteAdminNotification(id);
      
      // Remove the notification from the list
      const updatedNotifications = notifications.filter(notification => notification.id !== id);
      setNotifications(updatedNotifications);
      
      // Update counts
      setTotalNotifications(prev => Math.max(0, prev - 1));
      
      // Update unread count if needed
      const wasUnread = notifications.find(n => n.id === id)?.read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Handle refreshing the notifications
  const refreshNotifications = () => {
    fetchNotifications(currentPage, activeTab === "unread");
  };

  // Handle changing page
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust start and end to show 3 pages
      if (startPage === 2) endPage = Math.min(totalPages - 1, startPage + 2);
      if (endPage === totalPages - 1) startPage = Math.max(2, endPage - 2);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) items.push('ellipsis1');
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) items.push('ellipsis2');
      
      // Always show last page
      items.push(totalPages);
    }
    
    return items;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage all system notifications and updates
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "all" && unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={refreshNotifications}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 border rounded-lg bg-card">
            <h2 className="font-medium text-lg mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Tabs 
                  value={activeTab} 
                  onValueChange={(value) => {
                    setActiveTab(value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                    <TabsTrigger value="read" className="flex-1">Read</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Items per page</label>
                <Select
                  value={itemsPerPage}
                  onValueChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg bg-card">
            <h2 className="font-medium text-lg mb-2">Notification Stats</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-medium">{totalNotifications}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Unread:</span>
                <span className="font-medium">{unreadCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Read:</span>
                <span className="font-medium">{totalNotifications - unreadCount}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-6">
              <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-6">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">No notifications</h3>
              <p className="text-muted-foreground text-center max-w-md mt-1">
                {activeTab === "all" 
                  ? "You don't have any notifications yet" 
                  : activeTab === "unread" 
                    ? "You don't have any unread notifications" 
                    : "You don't have any read notifications"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Notification List</h3>
                    <p className="text-sm text-muted-foreground">
                      Showing {Math.min((currentPage - 1) * parseInt(itemsPerPage) + 1, totalNotifications)} - {Math.min(currentPage * parseInt(itemsPerPage), totalNotifications)} of {totalNotifications}
                    </p>
                  </div>
                </div>
                
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-muted/30" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {notification.actor ? (
                          <Avatar className="h-10 w-10">
                            {notification.actor.imageUrl ? (
                              <AvatarImage src={notification.actor.imageUrl} alt={notification.actor.name} />
                            ) : (
                              <AvatarFallback>{notification.actor.name.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                        ) : (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>S</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {notification.actor?.name || "System"}
                            </span>
                            {!notification.read && (
                              <span className="inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                            )}
                          </div>
                          
                          <p className="mb-2">{notification.content}</p>
                          
                          {notification.video && (
                            <div className="flex items-center gap-3 mb-3 p-2 bg-muted rounded-md">
                              <div className="w-16 h-9 overflow-hidden rounded bg-background">
                                {notification.video.thumbnail ? (
                                  <img src={notification.video.thumbnail} alt="" className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full bg-background flex items-center justify-center">
                                    <Film className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{notification.video.title}</p>
                                <Link 
                                  href={`/admin/content/${notification.video.id}`}
                                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  View video
                                </Link>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 text-xs"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark as read
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 text-xs text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {getPaginationItems().map((item, index) => (
                      typeof item === 'number' ? (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => handlePageChange(item)}
                            isActive={currentPage === item}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 