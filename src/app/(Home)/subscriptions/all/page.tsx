"use client"

import { useState, useEffect } from "react"
import ChannelCard from "@/components/channel-card"
import ChannelCardSkeleton from "@/components/channel-card-skeleton"
import PageTransition from "@/components/page-transition"

export default function AllSubscriptionsPage() {
  const [loading, setLoading] = useState(true)
  const [channels, setChannels] = useState<any[]>([])

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setChannels([
        {
          id: "react-masters",
          name: "React Masters",
          subscribers: "1.2M",
          isSubscribed: true,
        },
        {
          id: "design-hub",
          name: "Design Hub",
          subscribers: "850K",
          isSubscribed: true,
        },
        {
          id: "nextjs-ninjas",
          name: "Next.js Ninjas",
          subscribers: "620K",
          isSubscribed: true,
        },
        {
          id: "typescript-pro",
          name: "TypeScript Pro",
          subscribers: "450K",
          isSubscribed: true,
        },
        {
          id: "css-masters",
          name: "CSS Masters",
          subscribers: "780K",
          isSubscribed: true,
        },
        {
          id: "web-wizards",
          name: "Web Wizards",
          subscribers: "1.5M",
          isSubscribed: true,
        },
        {
          id: "code-evolution",
          name: "Code Evolution",
          subscribers: "2.1M",
          isSubscribed: true,
        },
        {
          id: "tech-insider",
          name: "Tech Insider",
          subscribers: "3.5M",
          isSubscribed: true,
        },
      ])
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <PageTransition>
      <div className="container py-6 md:py-8">
        <h1 className="text-2xl font-bold mb-6">All Subscriptions</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array(8)
                .fill(0)
                .map((_, i) => <ChannelCardSkeleton key={i} />)
            : channels.map((channel) => <ChannelCard key={channel.id} {...channel} />)}
        </div>
      </div>
    </PageTransition>
  )
}
