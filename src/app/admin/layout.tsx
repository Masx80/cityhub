import type React from "react"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check if the user is authenticated
  const { userId } = await auth();
  
  // Redirect if not authenticated
  if (!userId) {
    redirect("/auth");
  }
  
  // Check if the user has admin role in the database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  
  // Redirect non-admin users
  if (!user || !user.isAdmin) {
    redirect("/admin-access");
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
