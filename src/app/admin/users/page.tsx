"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Edit, Ban } from "lucide-react"

export default function UserManagement() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setUsers([
        {
          id: "u1",
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          status: "active",
          joinDate: "2023-10-15",
          videos: 12,
          subscribers: "5.2K",
          role: "creator",
          lastActive: "2024-04-12",
        },
        {
          id: "u2",
          name: "Michael Chen",
          email: "michael.c@example.com",
          status: "active",
          joinDate: "2023-11-02",
          videos: 8,
          subscribers: "3.7K",
          role: "creator",
          lastActive: "2024-04-11",
        },
        {
          id: "u3",
          name: "Alex Rodriguez",
          email: "alex.r@example.com",
          status: "suspended",
          joinDate: "2023-09-20",
          videos: 5,
          subscribers: "1.2K",
          role: "creator",
          lastActive: "2024-03-25",
        },
        {
          id: "u4",
          name: "Emily Wilson",
          email: "emily.w@example.com",
          status: "active",
          joinDate: "2023-12-05",
          videos: 3,
          subscribers: "950",
          role: "creator",
          lastActive: "2024-04-10",
        },
        {
          id: "u5",
          name: "David Kim",
          email: "david.k@example.com",
          status: "pending",
          joinDate: "2024-01-10",
          videos: 0,
          subscribers: "0",
          role: "user",
          lastActive: "2024-04-12",
        },
        {
          id: "u6",
          name: "Jessica Martinez",
          email: "jessica.m@example.com",
          status: "active",
          joinDate: "2023-08-15",
          videos: 18,
          subscribers: "12.5K",
          role: "creator",
          lastActive: "2024-04-12",
        },
        {
          id: "u7",
          name: "Ryan Thompson",
          email: "ryan.t@example.com",
          status: "active",
          joinDate: "2023-07-22",
          videos: 25,
          subscribers: "8.3K",
          role: "creator",
          lastActive: "2024-04-11",
        },
        {
          id: "u8",
          name: "Sophia Lee",
          email: "sophia.l@example.com",
          status: "suspended",
          joinDate: "2023-11-30",
          videos: 7,
          subscribers: "2.1K",
          role: "creator",
          lastActive: "2024-03-15",
        },
        {
          id: "u9",
          name: "Daniel Brown",
          email: "daniel.b@example.com",
          status: "active",
          joinDate: "2024-02-05",
          videos: 2,
          subscribers: "450",
          role: "user",
          lastActive: "2024-04-09",
        },
        {
          id: "u10",
          name: "Olivia Garcia",
          email: "olivia.g@example.com",
          status: "pending",
          joinDate: "2024-04-01",
          videos: 0,
          subscribers: "0",
          role: "user",
          lastActive: "2024-04-01",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

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
      key: "role",
      title: "Role",
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
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
    { key: "joinDate", title: "Join Date" },
    { key: "lastActive", title: "Last Active" },
    { key: "videos", title: "Videos" },
    { key: "subscribers", title: "Subscribers" },
    {
      key: "actions",
      title: "Actions",
      render: (value: unknown, item: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
            <Ban className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const activeUsers = users.filter((user) => user.status === "active")
  const pendingUsers = users.filter((user) => user.status === "pending")
  const suspendedUsers = users.filter((user) => user.status === "suspended")

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
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all users on the platform</p>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
            All Users ({users.length})
          </Button>
          <Button variant="outline">
            Active ({activeUsers.length})
          </Button>
          <Button variant="outline">
            Pending ({pendingUsers.length})
          </Button>
          <Button variant="outline">
            Suspended ({suspendedUsers.length})
          </Button>
        </div>
        
        <Button>Add New User</Button>
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
            {users.map((user) => (
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
    </div>
  )
}
