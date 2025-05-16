"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Film,
  Users,
  BarChart3,
  DollarSign,
  Flag,
  MessageSquare,
  Bell,
  KeyRound,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
      implemented: true,
    },
    {
      label: "Content",
      icon: Film,
      href: "/admin/content",
      active: pathname === "/admin/content",
      implemented: true,
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname === "/admin/users",
      implemented: true,
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      active: pathname === "/admin/analytics",
      implemented: false,
    },
    {
      label: "Monetization",
      icon: DollarSign,
      href: "/admin/monetization",
      active: pathname === "/admin/monetization",
      implemented: false,
    },
    {
      label: "Comments",
      icon: MessageSquare,
      href: "/admin/comments",
      active: pathname === "/admin/comments",
      implemented: false,
    },
    {
      label: "Reports",
      icon: Flag,
      href: "/admin/reports",
      active: pathname === "/admin/reports",
      implemented: false,
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/admin/notifications",
      active: pathname === "/admin/notifications",
      implemented: false,
    },
    {
      label: "API Keys",
      icon: KeyRound,
      href: "/admin/api-keys",
      active: pathname === "/admin/api-keys",
      implemented: false,
    },
  ];

  // Filter only implemented routes or active ones (in case user is on a page being worked on)
  const availableRoutes = routes.filter(route => route.implemented || route.active);

  return (
    <div className="hidden md:flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 w-8 h-8 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">V</span>
          </div>
          <span className="text-xl font-bold">Admin Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="px-2 space-y-1">
          {availableRoutes.map((route, index) => (
            <motion.div
              key={route.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  route.active
                    ? "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                <route.icon
                  className={cn("h-4 w-4", route.active && "text-primary")}
                />
                {route.label}
                {route.active && (
                  <motion.div
                    className="absolute left-0 w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full"
                    layoutId="admin-sidebar-active-indicator"
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <span>← Return to SexCity Hub</span>
        </Link>
      </div>
    </div>
  );
}
