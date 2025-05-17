"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Edit, Ban, Search, X, Trash, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getAllUsers, updateUserStatus, deleteUser, updateUserRole } from "@/actions/admin"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  id: string;
  clerkId: string;
  name: string;
  email?: string;
  imageUrl?: string;
  channelHandle?: string;
  channelName?: string;
  status: string;
  role?: string;
  createdAt: string;
  videoCount: number;
  subscriberCount: number;
  hasCompletedOnboarding?: boolean;
  [key: string]: any; // Index signature to allow accessing properties dynamically
}

interface UserColumn {
  key: string;
  title: string;
  render?: (value: any, user: User) => React.ReactNode;
}

export default function UserManagement() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState<any>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // For edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editedRole, setEditedRole] = useState("")
  
  // For delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const fetchUsers = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true)
      const result = await getAllUsers(page, 10, searchQuery)
      
      // Ensure all user data conforms to the User interface
      const typedUsers = result.users.map(user => ({
        ...user,
        // Ensure createdAt is a string
        createdAt: user.createdAt instanceof Date 
          ? user.createdAt.toISOString() 
          : String(user.createdAt),
        // Ensure these are numbers
        videoCount: Number(user.videoCount || 0),
        subscriberCount: Number(user.subscriberCount || 0)
      })) as User[]
      
      setUsers(typedUsers)
      setMeta(result.meta)
      setCurrentPage(page)
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [])

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    // In a real app, we would filter by status on the server
    // For now, we'll just change the UI state
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(1, search)
  }

  const handleClearSearch = () => {
    setSearch("")
    fetchUsers(1, "")
  }

  const handlePageChange = (page: number) => {
    fetchUsers(page, search)
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const isSuspended = currentStatus === "active" ? true : false
      await updateUserStatus(userId, isSuspended)
      
      // Refresh the user list
      fetchUsers(currentPage, search)
      
      toast.success(`User ${isSuspended ? "suspended" : "activated"} successfully`)
    } catch (error) {
      console.error("Failed to update user status:", error)
      toast.error("Failed to update user status")
    }
  }
  
  const handleEditUser = (user: User) => {
    setCurrentUser(user)
    setEditedRole(user.role || "user")
    setIsEditModalOpen(true)
  }
  
  const handleSaveUserEdit = async () => {
    if (!currentUser) return
    
    try {
      await updateUserRole(currentUser.clerkId, editedRole)
      toast.success("User role updated successfully")
      setIsEditModalOpen(false)
      fetchUsers(currentPage, search)
    } catch (error) {
      console.error("Failed to update user role:", error)
      toast.error("Failed to update user role")
    }
  }
  
  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    try {
      await deleteUser(userToDelete.clerkId)
      toast.success("User deleted successfully")
      setIsDeleteDialogOpen(false)
      fetchUsers(currentPage, search)
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Failed to delete user")
    }
  }

  const userColumns: UserColumn[] = [
    {
      key: "name",
      title: "User",
      render: (value: string, item: User) => (
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
      key: "status",
      title: "Status",
      render: (value: string) => (
        <Badge
          className={
            value === "active"
              ? "bg-green-500"
              : value === "pending"
              ? "bg-yellow-500"
              : "bg-red-500"
          }
        >
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
    { 
      key: "videoCount", 
      title: "Videos",
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: "subscriberCount", 
      title: "Subscribers",
      render: (value: number) => value.toLocaleString()
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: unknown, item: User) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            asChild
          >
            <a href={`/channel/${item.clerkId}`} target="_blank">
              <Eye className="h-4 w-4" />
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handleEditUser(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={`h-8 w-8 ${item.status === "active" ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}`}
            onClick={() => handleToggleUserStatus(item.clerkId, item.status)}
          >
            <Ban className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={() => confirmDeleteUser(item)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Apply filters based on current tab
  let filteredUsers = users;
  if (filter === "active") {
    filteredUsers = users.filter(user => user.status === "active");
  } else if (filter === "pending") {
    filteredUsers = users.filter(user => user.status === "pending");
  } else if (filter === "suspended") {
    filteredUsers = users.filter(user => user.status === "suspended");
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all users on the platform</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            className={filter === "all" ? "bg-gradient-to-r from-orange-500 to-amber-500" : "variant-outline"}
            onClick={() => handleFilterChange("all")}
          >
            All Users ({meta.total})
          </Button>
          <Button 
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => handleFilterChange("active")}
          >
            Active ({users.filter(u => u.status === "active").length})
          </Button>
          <Button 
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => handleFilterChange("pending")}
          >
            Pending ({users.filter(u => u.status === "pending").length})
          </Button>
          <Button 
            variant={filter === "suspended" ? "default" : "outline"}
            onClick={() => handleFilterChange("suspended")}
          >
            Suspended ({users.filter(u => u.status === "suspended").length})
          </Button>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
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
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {userColumns.map((column) => (
                <th key={column.key} className="p-3 text-left font-medium">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                {userColumns.map((column) => (
                  <td key={`${user.id}-${column.key}`} className="p-3">
                    {column.render
                      ? column.render(user[column.key], user)
                      : user[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
      
      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          
          {currentUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  {currentUser.imageUrl ? (
                    <AvatarImage src={currentUser.imageUrl} alt={currentUser.name} />
                  ) : (
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium">{currentUser.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.channelHandle ? `@${currentUser.channelHandle}` : 'No handle'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select value={editedRole} onValueChange={setEditedRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUserEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and all associated data, including videos, comments, and other content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
