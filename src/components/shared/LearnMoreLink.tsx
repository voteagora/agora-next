"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface LearnMoreLinkProps {
  href: string;
  text: string;
  description?: string;
}

export function LearnMoreLink({ href, text, description }: LearnMoreLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-4"
    >
      <span className="font-medium">{text}</span>
      {description && (
        <span className="text-tertiary hidden sm:inline">— {description}</span>
      )}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}
