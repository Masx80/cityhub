"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DataTable from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function ContentManagement() {
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<any[]>([])

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setVideos([
        {
          id: "v1",
          title: "Building a Modern SexCity Hub with Next.js",
          status: "published",
          views: "120K",
          likes: "15K",
          uploadDate: "2024-04-10",
          channel: "Dev Insights",
          category: "Technology",
          duration: "18:24",
        },
        {
          id: "v2",
          title: "Advanced React Patterns for 2025",
          status: "published",
          views: "45K",
          likes: "5.2K",
          uploadDate: "2024-04-11",
          channel: "React Masters",
          category: "Technology",
          duration: "24:15",
        },
        {
          id: "v3",
          title: "The Future of Web Development",
          status: "pending",
          views: "0",
          likes: "0",
          uploadDate: "2024-04-12",
          channel: "TechTalk",
          category: "Technology",
          duration: "15:30",
        },
        {
          id: "v4",
          title: "UI/UX Design Principles for Developers",
          status: "published",
          views: "31K",
          likes: "4.1K",
          uploadDate: "2024-04-11",
          channel: "Design Hub",
          category: "Design",
          duration: "22:08",
        },
        {
          id: "v5",
          title: "Mastering TypeScript: Advanced Types",
          status: "flagged",
          views: "19K",
          likes: "2.8K",
          uploadDate: "2024-04-09",
          channel: "TypeScript Pro",
          category: "Technology",
          duration: "32:45",
        },
        {
          id: "v6",
          title: "Building Responsive Layouts with Tailwind CSS",
          status: "published",
          views: "98K",
          likes: "12.3K",
          uploadDate: "2024-04-01",
          channel: "Tailwind Wizards",
          category: "Design",
          duration: "16:20",
        },
        {
          id: "v7",
          title: "State Management in React: Context API vs Redux",
          status: "published",
          views: "76K",
          likes: "8.9K",
          uploadDate: "2024-04-05",
          channel: "React Masters",
          category: "Technology",
          duration: "28:12",
        },
        {
          id: "v8",
          title: "10 VS Code Extensions Every Developer Should Use",
          status: "published",
          views: "124K",
          likes: "18.5K",
          uploadDate: "2024-04-03",
          channel: "Dev Tools",
          category: "Technology",
          duration: "12:45",
        },
        {
          id: "v9",
          title: "Understanding JavaScript Promises and Async/Await",
          status: "published",
          views: "78K",
          likes: "9.2K",
          uploadDate: "2024-04-07",
          channel: "JS Mastery",
          category: "Technology",
          duration: "20:18",
        },
        {
          id: "v10",
          title: "Building a Design System with Figma and React",
          status: "pending",
          views: "0",
          likes: "0",
          uploadDate: "2024-04-12",
          channel: "Design Hub",
          category: "Design",
          duration: "35:10",
        },
        {
          id: "v11",
          title: "Docker for Frontend Developers",
          status: "published",
          views: "92K",
          likes: "11.4K",
          uploadDate: "2024-04-08",
          channel: "DevOps Simplified",
          category: "Technology",
          duration: "26:30",
        },
        {
          id: "v12",
          title: "Creating Animations with Framer Motion",
          status: "flagged",
          views: "47K",
          likes: "6.3K",
          uploadDate: "2024-04-06",
          channel: "Animation Masters",
          category: "Design",
          duration: "19:55",
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
    { key: "category", title: "Category" },
    { key: "duration", title: "Duration" },
    {
      key: "actions",
      title: "Actions",
      render: (_: any, item: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const pendingVideos = videos.filter((video) => video.status === "pending")
  const flaggedVideos = videos.filter((video) => video.status === "flagged")
  const publishedVideos = videos.filter((video) => video.status === "published")

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
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage all videos on the platform</p>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
            Add New Video
          </Button>
          <Button variant="outline">Import Videos</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
            {pendingVideos.length} Pending
          </Button>
          <Button variant="outline">
            <XCircle className="h-4 w-4 mr-2 text-red-500" />
            {flaggedVideos.length} Flagged
          </Button>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            {publishedVideos.length} Published
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Videos</CardTitle>
              <CardDescription>Manage all videos on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={videoColumns} data={videos} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Videos</CardTitle>
              <CardDescription>Videos awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={videoColumns} data={pendingVideos} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="flagged" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Videos</CardTitle>
              <CardDescription>Videos that have been reported or flagged</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={videoColumns} data={flaggedVideos} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="published" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Published Videos</CardTitle>
              <CardDescription>Videos that are live on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={videoColumns} data={publishedVideos} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>Perform actions on multiple videos at once</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bulk-action">Action</Label>
              <Select>
                <SelectTrigger id="bulk-action">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve Selected</SelectItem>
                  <SelectItem value="reject">Reject Selected</SelectItem>
                  <SelectItem value="feature">Feature Selected</SelectItem>
                  <SelectItem value="delete">Delete Selected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bulk-category">Category</Label>
              <Select>
                <SelectTrigger id="bulk-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Apply</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
