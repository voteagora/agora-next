"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left";
  position?: "left" | "right" | "bottom";
  showCloseButton?: boolean;
  className?: string;
  title?: string;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  side = "left",
  position = "left",
  showCloseButton = true,
  className,
  title,
}: DrawerProps) {
  const positionVariants = {
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
    },
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
    },
    bottom: {
      initial: { y: "100%" },
      animate: { y: 0 },
      exit: { y: "100%" },
    },
  };

  // For backward compatibility
  const effectivePosition = position || side;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[4px]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={positionVariants[effectivePosition].initial}
            animate={positionVariants[effectivePosition].animate}
            exit={positionVariants[effectivePosition].exit}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed z-50 flex flex-col bg-wash border-line shadow-lg",
              effectivePosition === "left" &&
                "inset-y-0 left-0 w-5/6 max-w-sm border-r",
              effectivePosition === "right" &&
                "inset-y-0 right-0 w-5/6 max-w-sm border-l",
              effectivePosition === "bottom" &&
                "inset-x-0 bottom-0 rounded-t-xl border-t",
              className
            )}
          >
            {title && (
              <div className="p-4 border-b border-line">
                <h2 className="text-primary font-semibold">{title}</h2>
              </div>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full hover:bg-neutral-100"
              >
                <X className="h-5 w-5 text-primary" />
                <span className="sr-only">Close</span>
              </button>
            )}
            <div className="flex-1 overflow-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
