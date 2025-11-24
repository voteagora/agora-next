import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearnMoreBannerProps {
  icon: LucideIcon;
  text: string;
  href: string;
  className?: string;
}

export function LearnMoreBanner({
  icon: Icon,
  text,
  href,
  className,
}: LearnMoreBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-3 bg-wash border-b border-line text-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 text-primary font-medium">
        <Icon className="h-4 w-4 text-secondary" aria-hidden />
        <span>{text}</span>
      </div>
      <Link
        href={href}
        className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
      >
        Learn more
      </Link>
    </div>
  );
}
