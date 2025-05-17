"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, User, Film, Tag, Eye, Edit, Trash, Ban } from "lucide-react"
import { globalSearch, deleteUser, updateUserStatus, updateVideoStatus } from "@/actions/admin"
import { toast } from "sonner"
import DataTable from "@/components/admin/data-table"

export default function AdminSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""
  
  const [isSearching, setIsSearching] = useState(false)
  const [search, setSearch] = useState(searchQuery)
  const [activeTab, setActiveTab] = useState("all")
  const [users, setUsers] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  
  const fetchSearchResults = async (query: string) => {
    if (!query) return
    
    try {
      setIsSearching(true)
      const results = await globalSearch(query, 50) // Get more results for the dedicated page
      setUsers(results.users)
      setVideos(results.videos)
      setCategories(results.categories)
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to fetch search results")
    } finally {
      setIsSearching(false)
    }
  }
  
  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery)
    }
  }, [searchQuery])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(search.trim())}`)
    }
  }
  
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const isSuspended = currentStatus === "active" ? true : false
      await updateUserStatus(userId, isSuspended)
      
      // Refresh the search results
      fetchSearchResults(searchQuery)
      
      toast.success(`User ${isSuspended ? "suspended" : "activated"} successfully`)
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast.error("Failed to update user status")
    }
  }
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }
    
    try {
      await deleteUser(userId)
      
      // Refresh the search results
      fetchSearchResults(searchQuery)
      
      toast.success("User deleted successfully")
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Failed to delete user")
    }
  }
  
  const handleUpdateVideoStatus = async (videoId: string, newStatus: string) => {
    try {
      await updateVideoStatus(videoId, newStatus)
      
      // Refresh the search results
      fetchSearchResults(searchQuery)
      
      toast.success(`Video status updated successfully`)
    } catch (error) {
      console.error("Failed to update video status:", error)
      toast.error("Failed to update video status")
    }
  }
  
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
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {item.channelHandle ? `@${item.channelHandle}` : 'No handle'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "channelName",
      title: "Channel",
      render: (value: string) => (
        <span className="truncate max-w-[150px] block">
          {value || 'No channel'}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: unknown, item: any) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            asChild
          >
            <a href={`/admin/users/${item.clerkId}`}>
              <Eye className="h-4 w-4" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            asChild
          >
            <a href={`/admin/users/${item.clerkId}/edit`}>
              <Edit className="h-4 w-4" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => handleToggleUserStatus(item.clerkId, "active")}
          >
            <Ban className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => handleDeleteUser(item.clerkId)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
  
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
    { key: "userName", title: "Channel" },
    {
      key: "actions",
      title: "Actions",
      render: (value: string, item: any) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <a href={`/admin/content/${item.id}`}>View</a>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <a href={`/admin/content/${item.id}/edit`}>Edit</a>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleUpdateVideoStatus(item.id, "PUBLISHED")}
          >
            Publish
          </Button>
        </div>
      ),
    },
  ]
  
  const categoryColumns = [
    { key: "name", title: "Name" },
    { 
      key: "description", 
      title: "Description",
      render: (value: string) => (
        <div className="truncate max-w-[300px]">
          {value || "No description"}
        </div>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: string, item: any) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <a href={`/admin/categories/${item.id}`}>View</a>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <a href={`/admin/categories/${item.id}/edit`}>Edit</a>
          </Button>
        </div>
      ),
    },
  ]
  
  const getTotalResults = () => {
    return users.length + videos.length + categories.length
  }
  
  if (isSearching && getTotalResults() === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground">
          {searchQuery ? (
            <>
              Showing results for <span className="font-medium">"{searchQuery}"</span>
              {" "}({getTotalResults()} results)
            </>
          ) : (
            "Search for users, videos, and categories"
          )}
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users, videos, or categories..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {searchQuery && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Results ({getTotalResults()})</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
            <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6 mt-6">
            {/* Users Section */}
            {users.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">Users</CardTitle>
                    <CardDescription>User accounts matching your search</CardDescription>
                  </div>
                  {users.length > 5 && (
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("users")}>
                      View All ({users.length})
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={userColumns}
                    data={users.slice(0, 5)}
                    pagination={false}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Videos Section */}
            {videos.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">Videos</CardTitle>
                    <CardDescription>Videos matching your search</CardDescription>
                  </div>
                  {videos.length > 5 && (
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("videos")}>
                      View All ({videos.length})
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={videoColumns}
                    data={videos.slice(0, 5)}
                    pagination={false}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Categories Section */}
            {categories.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">Categories</CardTitle>
                    <CardDescription>Categories matching your search</CardDescription>
                  </div>
                  {categories.length > 5 && (
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("categories")}>
                      View All ({categories.length})
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={categoryColumns}
                    data={categories.slice(0, 5)}
                    pagination={false}
                  />
                </CardContent>
              </Card>
            )}
            
            {getTotalResults() === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No results found</h3>
                <p className="text-muted-foreground mt-2">
                  We couldn't find anything matching "{searchQuery}". Try different keywords or filters.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>User accounts matching your search</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <DataTable
                    columns={userColumns}
                    data={users}
                    pagination={users.length > 10}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No users found matching "{searchQuery}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="videos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Videos</CardTitle>
                <CardDescription>Videos matching your search</CardDescription>
              </CardHeader>
              <CardContent>
                {videos.length > 0 ? (
                  <DataTable
                    columns={videoColumns}
                    data={videos}
                    pagination={videos.length > 10}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No videos found matching "{searchQuery}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Categories matching your search</CardDescription>
              </CardHeader>
              <CardContent>
                {categories.length > 0 ? (
                  <DataTable
                    columns={categoryColumns}
                    data={categories}
                    pagination={categories.length > 10}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No categories found matching "{searchQuery}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 