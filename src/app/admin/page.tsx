"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import StatCard from "@/components/admin/stat-card"
import { Users, Film, Eye, Clock, Flag } from "lucide-react"
import AreaChart from "@/components/admin/area-chart"
import DonutChart from "@/components/admin/donut-chart"
import DataTable from "@/components/admin/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAdminDashboardStats, getViewsOverTime, getCategoryDistribution, getRecentVideos, getRecentUsers } from "@/actions/admin"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    userCount: 0,
    videoCount: 0,
    totalViews: 0,
    pendingVideosCount: 0,
    reportedCommentsCount: 0
  })
  const [viewsData, setViewsData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [recentVideos, setRecentVideos] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [dashboardStats, views, categories, videos, users] = await Promise.all([
          getAdminDashboardStats(),
          getViewsOverTime(30),
          getCategoryDistribution(),
          getRecentVideos(5),
          getRecentUsers(5)
        ])
        
        setStats(dashboardStats)
        setViewsData(views)
        setCategoryData(categories)
        setRecentVideos(videos)
        setRecentUsers(users)
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const videoColumns = [
    { 
      key: "title", 
      title: "Title",
      render: (value: string, item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-10 h-6 overflow-hidden rounded">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt={value} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
          <div className="font-medium truncate max-w-[200px]">{value}</div>
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (value: string) => (
        <Badge
          className={
            value === "PUBLISHED" ? "bg-green-500" : 
            value === "PROCESSING" ? "bg-yellow-500" : 
            value === "FAILED" ? "bg-red-500" : 
            "bg-muted"
          }
        >
          {value.toLowerCase()}
        </Badge>
      ),
    },
    { key: "views", title: "Views" },
    { key: "likes", title: "Likes" },
    { 
      key: "createdAt", 
      title: "Upload Date",
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString();
      }
    },
    { key: "userName", title: "Channel" },
    {
      key: "actions",
      title: "Actions",
      render: (value: string, item: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/admin/content/${item.id}`}>View</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/admin/content/${item.id}/edit`}>Edit</a>
          </Button>
        </div>
      ),
    },
  ]

  const userColumns = [
    {
      key: "name",
      title: "User",
      render: (value: string, item: any) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {item.imageUrl ? (
              <AvatarImage src={item.imageUrl} alt={value} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                {value.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-muted-foreground">{item.email || 'No email'}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value: string) => (
        <Badge className={value === "active" ? "bg-green-500" : value === "pending" ? "bg-yellow-500" : "bg-red-500"}>
          {value}
        </Badge>
      ),
    },
    { 
      key: "createdAt", 
      title: "Join Date",
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString();
      }
    },
    { key: "videos", title: "Videos" },
    { key: "subscribers", title: "Subscribers" },
    {
      key: "actions",
      title: "Actions",
      render: (value: string, item: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/admin/users/${item.clerkId}`}>View</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/admin/users/${item.clerkId}/edit`}>Edit</a>
          </Button>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the SexCity Hub admin dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <StatCard 
            title="Total Users" 
            value={stats.userCount.toLocaleString()} 
            icon={Users} 
            trend={{ value: 12, isPositive: true }} 
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatCard 
            title="Total Videos" 
            value={stats.videoCount.toLocaleString()} 
            icon={Film} 
            trend={{ value: 8, isPositive: true }} 
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatCard 
            title="Total Views" 
            value={stats.totalViews.toLocaleString()} 
            icon={Eye} 
            trend={{ value: 15, isPositive: true }} 
          />
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <AreaChart title="Views Over Time" data={viewsData} xKey="date" yKey="views" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <DonutChart title="Content Categories" data={categoryData} />
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>Latest videos uploaded to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={videoColumns} data={recentVideos} pagination={false} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Platform Stats</CardTitle>
              <CardDescription>Key metrics for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="text-sm">Pending Videos</div>
                  <div className="flex items-center gap-1">
                    <Flag className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium">{stats.pendingVideosCount}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Avg. Watch Time</div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span className="font-medium">8m 12s</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest users registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={userColumns} data={recentUsers} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
