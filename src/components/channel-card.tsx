"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface ChannelCardProps {
  id: string
  name: string
  handle?: string
  avatar?: string
  subscribers: string
  description?: string
}

export default function ChannelCard({ id, name, handle, avatar, subscribers, description }: ChannelCardProps) {
  return (
    <div className="group flex flex-col bg-card border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Channel header - use a gradient background if no avatar */}
      <div className="h-24 bg-gradient-to-r from-orange-500 to-amber-500"></div>
      
      {/* Channel info */}
      <div className="p-4 flex flex-col items-center text-center -mt-10">
        <div className="mb-3">
          <Link href={`/channel/${handle || name.toLowerCase().replace(/\s+/g, '-')}`}>
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={avatar || ""} alt={name} />
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
        
        <Link href={`/channel/${handle || name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">
          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mt-1">{subscribers} subscribers</p>
        
        {description && (
          <p className="text-sm line-clamp-2 mt-2 text-muted-foreground">{description}</p>
        )}
        
        <Button variant="outline" className="mt-3 w-full" asChild>
          <Link href={`/channel/${handle || name.toLowerCase().replace(/\s+/g, '-')}`}>
            Visit Channel
          </Link>
        </Button>
      </div>
    </div>
  )
}
