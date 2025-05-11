"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import StatCard from "@/components/admin/stat-card"
import { Users, Film, Eye, DollarSign, TrendingUp, Clock, Flag } from "lucide-react"
import AreaChart from "@/components/admin/area-chart"
import DonutChart from "@/components/admin/donut-chart"
import DataTable from "@/components/admin/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [viewsData, setViewsData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [recentVideos, setRecentVideos] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      // Generate views data for the last 30 days
      const generateViewsData = () => {
        const data = []
        const now = new Date()
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`
          data.push({
            date: formattedDate,
            views: Math.floor(Math.random() * 10000) + 5000,
          })
        }
        return data
      }

      setViewsData(generateViewsData())

      setCategoryData([
        { name: "Technology", value: 35, color: "#f97316" },
        { name: "Entertainment", value: 25, color: "#f59e0b" },
        { name: "Education", value: 20, color: "#10b981" },
        { name: "Gaming", value: 15, color: "#3b82f6" },
        { name: "Music", value: 5, color: "#8b5cf6" },
      ])

      setRecentVideos([
        {
          id: "v1",
          title: "Building a Modern SexCity Hub with Next.js",
          status: "published",
          views: "120K",
          likes: "15K",
          uploadDate: "2 days ago",
          channel: "Dev Insights",
        },
        {
          id: "v2",
          title: "Advanced React Patterns for 2025",
          status: "published",
          views: "45K",
          likes: "5.2K",
          uploadDate: "1 day ago",
          channel: "React Masters",
        },
        {
          id: "v3",
          title: "The Future of Web Development",
          status: "pending",
          views: "0",
          likes: "0",
          uploadDate: "3 hours ago",
          channel: "TechTalk",
        },
        {
          id: "v4",
          title: "UI/UX Design Principles for Developers",
          status: "published",
          views: "31K",
          likes: "4.1K",
          uploadDate: "1 day ago",
          channel: "Design Hub",
        },
        {
          id: "v5",
          title: "Mastering TypeScript: Advanced Types",
          status: "flagged",
          views: "19K",
          likes: "2.8K",
          uploadDate: "3 days ago",
          channel: "TypeScript Pro",
        },
      ])

      setRecentUsers([
        {
          id: "u1",
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          status: "active",
          joinDate: "2023-10-15",
          videos: 12,
          subscribers: "5.2K",
        },
        {
          id: "u2",
          name: "Michael Chen",
          email: "michael.c@example.com",
          status: "active",
          joinDate: "2023-11-02",
          videos: 8,
          subscribers: "3.7K",
        },
        {
          id: "u3",
          name: "Alex Rodriguez",
          email: "alex.r@example.com",
          status: "suspended",
          joinDate: "2023-09-20",
          videos: 5,
          subscribers: "1.2K",
        },
        {
          id: "u4",
          name: "Emily Wilson",
          email: "emily.w@example.com",
          status: "active",
          joinDate: "2023-12-05",
          videos: 3,
          subscribers: "950",
        },
        {
          id: "u5",
          name: "David Kim",
          email: "david.k@example.com",
          status: "pending",
          joinDate: "2024-01-10",
          videos: 0,
          subscribers: "0",
        },
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const videoColumns = [
    { key: "title", title: "Title" },
    {
      key: "status",
      title: "Status",
      render: (value: string) => (
        <Badge
          className={value === "published" ? "bg-green-500" : value === "pending" ? "bg-yellow-500" : "bg-red-500"}
        >
          {value}
        </Badge>
      ),
    },
    { key: "views", title: "Views" },
    { key: "likes", title: "Likes" },
    { key: "uploadDate", title: "Upload Date" },
    { key: "channel", title: "Channel" },
    {
      key: "actions",
      title: "Actions",
      render: () => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            View
          </Button>
          <Button variant="outline" size="sm">
            Edit
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
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              {value.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-muted-foreground">{item.email}</div>
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
    { key: "joinDate", title: "Join Date" },
    { key: "videos", title: "Videos" },
    { key: "subscribers", title: "Subscribers" },
    {
      key: "actions",
      title: "Actions",
      render: () => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            View
          </Button>
          <Button variant="outline" size="sm">
            Edit
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
          <StatCard title="Total Users" value="24,532" icon={Users} trend={{ value: 12, isPositive: true }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatCard title="Total Videos" value="8,651" icon={Film} trend={{ value: 8, isPositive: true }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatCard title="Total Views" value="3.2M" icon={Eye} trend={{ value: 15, isPositive: true }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatCard title="Revenue" value="$42,582" icon={DollarSign} trend={{ value: 5, isPositive: true }} />
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
                  <div className="text-sm">New Users</div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="font-medium">1,245</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">New Videos</div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="font-medium">432</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Avg. Watch Time</div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span className="font-medium">8m 12s</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm">Content Reports</div>
                  <div className="flex items-center gap-1">
                    <Flag className="h-3 w-3 text-red-500" />
                    <span className="font-medium">24</span>
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
