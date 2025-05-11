"use client";

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Container({
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("w-full px-4 md:px-6 max-w-7xl mx-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
} 