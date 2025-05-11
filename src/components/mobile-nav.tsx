"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Compass, User, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  
  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/"
    },
    {
      label: "Explore",
      href: "/trending",
      icon: Compass,
      active: pathname === "/trending"
    },
    {
      label: "Watch",
      href: "/latest",
      icon: PlayCircle,
      active: pathname === "/latest"
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      active: pathname === "/notifications"
    },
    {
      label: "Profile",
      href: "/channel/me",
      icon: User,
      active: pathname === "/channel/me"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center py-2 px-3 mx-0.5 transition-colors", 
              item.active 
                ? "text-orange-500" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1",
              item.active && "text-orange-500"
            )} />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 