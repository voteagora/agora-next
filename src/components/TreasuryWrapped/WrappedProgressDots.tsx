"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WrappedProgressDotsProps {
  totalSlides: number;
  currentSlide: number;
  onDotClick?: (slideIndex: number) => void;
}

export function WrappedProgressDots({
  totalSlides,
  currentSlide,
  onDotClick,
}: WrappedProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick?.(index)}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            index === currentSlide
              ? "bg-white w-6"
              : "bg-white/40 hover:bg-white/60"
          )}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === currentSlide ? "step" : undefined}
        />
      ))}
    </div>
  );
}
