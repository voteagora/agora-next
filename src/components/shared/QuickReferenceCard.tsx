"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface QuickReferenceCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  learnMoreHref?: string;
  learnMoreText?: string;
  variant?: "default" | "neutral";
  className?: string;
}

export function QuickReferenceCard({
  icon: Icon,
  title,
  children,
  learnMoreHref,
  learnMoreText = "Learn more",
  variant = "default",
  className = "",
}: QuickReferenceCardProps) {
  const bgClass = variant === "neutral" ? "bg-neutral" : "bg-wash";

  return (
    <div
      className={`flex flex-col space-y-3 p-6 ${bgClass} border border-line shadow-newDefault rounded-xl ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col space-y-2">
          <h2 className="text-base font-semibold text-primary">{title}</h2>
          <div className="text-secondary text-sm leading-relaxed">
            {children}
          </div>
          {learnMoreHref && (
            <Link
              href={learnMoreHref}
              className="text-brandPrimary text-sm font-medium hover:underline inline-flex items-center gap-1 w-fit"
            >
              {learnMoreText}
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
