"use client";

import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export default function InfoPop({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <QuestionMarkCircleIcon className="text-tertiary cursor-pointer w-4 ml-1" />
      {isOpen && (
        <div className="absolute top-0 left-full w-[300px] p-4 bg-black text-neutral rounded-lg shadow-md z-[1]">
          {children}
        </div>
      )}
    </div>
  );
}
