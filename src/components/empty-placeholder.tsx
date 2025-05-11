import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyPlaceholderProps {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function EmptyPlaceholder({
  icon,
  title,
  description,
  className,
}: EmptyPlaceholderProps) {
  return (
    <div className={cn(
      "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
      className
    )}>
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {icon && <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">{icon}</div>}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
} 