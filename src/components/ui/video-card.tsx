import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  channel: {
    name: string;
    avatar?: string;
    handle?: string;
  };
  views: string | number;
  timestamp: string;
  duration?: string;
}

export default function VideoCard({
  id,
  title,
  thumbnail,
  channel,
  views,
  timestamp,
  duration,
}: VideoCardProps) {
  // Format date if it's a valid date string
  let formattedDate = timestamp;
  try {
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      formattedDate = formatDistanceToNow(date, { addSuffix: true });
    }
  } catch (e) {
    // Keep original timestamp if parsing fails
  }

  return (
    <Link href={`/watch/${id}`} className="group">
      <div 
        className="relative overflow-hidden rounded-lg aspect-video bg-muted"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <Image 
          src={thumbnail} 
          alt={title} 
          fill 
          className="object-cover transition-all rounded-lg group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {duration && (
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
            {duration}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-2">
        <Link href={`/channel/${channel.handle || id}`} className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={channel.avatar} alt={channel.name} />
            <AvatarFallback>
              {channel.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div>
          <h3 className="text-sm font-medium line-clamp-2 leading-tight group-hover:text-primary">
            {title}
          </h3>
          <Link 
            href={`/channel/${channel.handle || id}`} 
            className="text-xs text-muted-foreground hover:text-primary"
          >
            {channel.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {views} views • {formattedDate}
          </p>
        </div>
      </div>
    </Link>
  );
} 