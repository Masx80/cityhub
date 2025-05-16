"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DataTable from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getAllVideos, updateVideoStatus } from "@/actions/admin"
import { toast } from "sonner"

export default function ContentManagement() {
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<any[]>([])
  const [meta, setMeta] = useState<any>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchVideos = async (page = 1, searchQuery = search, status = "") => {
    try {
      setLoading(true)
      const result = await getAllVideos(page, 10, searchQuery, status)
      setVideos(result.videos)
      setMeta(result.meta)
      setCurrentPage(page)
    } catch (error) {
      console.error("Failed to fetch videos:", error)
      toast.error("Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos(1)
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    let statusFilter = "";
    if (value === "pending") statusFilter = "PROCESSING";
    else if (value === "flagged") statusFilter = "FAILED";
    else if (value === "published") statusFilter = "PUBLISHED";
    
    fetchVideos(1, search, statusFilter)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVideos(1, search)
  }

  const handleClearSearch = () => {
    setSearch("")
    fetchVideos(1, "")
  }

  const handlePageChange = (page: number) => {
    fetchVideos(page, search)
  }

  const handleUpdateVideoStatus = async (videoId: string, newStatus: string) => {
    try {
      await updateVideoStatus(videoId, newStatus)
      
      // Refresh the video list
      const statusFilter = activeTab === "all" ? "" : 
                          activeTab === "pending" ? "PROCESSING" : 
                          activeTab === "flagged" ? "FAILED" : "PUBLISHED";
      
      fetchVideos(currentPage, search, statusFilter)
      
      toast.success(`Video status updated successfully`)
    } catch (error) {
      console.error("Failed to update video status:", error)
      toast.error("Failed to update video status")
    }
  }

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
            "bg-red-500"
          }
        >
          {value.toLowerCase()}
        </Badge>
      ),
    },
    { 
      key: "views", 
      title: "Views",
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: "likes", 
      title: "Likes",
      render: (value: number) => value.toLocaleString()
    },
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
      render: (_: any, item: any) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            asChild
          >
            <a href={`/watch/${item.videoId}`} target="_blank">
              <Eye className="h-4 w-4" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            asChild
          >
            <a href={`/edit-video/${item.videoId}`} target="_blank">
              <Edit className="h-4 w-4" />
            </a>
          </Button>
          {item.status === "PROCESSING" && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-green-500 hover:text-green-600"
              onClick={() => handleUpdateVideoStatus(item.id, "PUBLISHED")}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {item.status === "FAILED" && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-green-500 hover:text-green-600"
              onClick={() => handleUpdateVideoStatus(item.id, "PUBLISHED")}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {item.status === "PUBLISHED" && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => handleUpdateVideoStatus(item.id, "FAILED")}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const pendingVideos = videos.filter((video) => video.status === "PROCESSING")
  const flaggedVideos = videos.filter((video) => video.status === "FAILED")
  const publishedVideos = videos.filter((video) => video.status === "PUBLISHED")

  if (loading && videos.length === 0) {
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

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos..."
              className="w-full pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button type="submit">Search</Button>
        </form>
        
        <div className="flex flex-wrap gap-2">
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

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
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

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center mx-2">
              Page {currentPage} of {meta.totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === meta.totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(meta.totalPages)}
              disabled={currentPage === meta.totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
