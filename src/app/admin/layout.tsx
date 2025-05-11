import type React from "react"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // In a real app, you would check for admin authentication here
  const isAuthenticated = true // This would be a real auth check

  if (!isAuthenticated) {
    redirect("/auth")
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
