"use client";

import { cn } from "@/lib/utils";

type Props = {
  onSelectionChanged: (newSelection: any) => void;
  selection: string;
  options: string[];
  className?: string;
};

const optionStyle =
  "p-[5px] flex-1 text-center cursor-pointer rounded font-medium hover:bg-neutral hover:font-semibold text-primary/30 transition-colors transition-shadow";

const selectedStyle =
  "text-primary font-semibold border border-line shadow-switcher transition-colors transition-shadow bg-neutral";

export function Switch({
  onSelectionChanged,
  selection,
  options,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex text-sm flex-row gap-2 rounded-md border border-line overflow-hidden w-full p-1 bg-line/50",
        className
      )}
    >
      {options.map((option, index) => (
        <div
          key={index}
          onClick={(e) => {
            e.preventDefault();
            onSelectionChanged(option);
          }}
          className={cn(optionStyle, selection === option && selectedStyle)}
        >
          {option}
        </div>
      ))}
    </div>
  );
}
