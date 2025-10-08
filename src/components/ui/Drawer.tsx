"use client";

import React, { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  useHistoryBack?: boolean;
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
  useHistoryBack = true,
}: DrawerProps) {
  const pushedHistoryRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !useHistoryBack) return;
    try {
      window.history.pushState({ __drawer: true }, "");
      pushedHistoryRef.current = true;
    } catch (_) {}

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      pushedHistoryRef.current = false;
    };
  }, [isOpen, onClose, useHistoryBack]);
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
  const effectivePosition = position || side;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Move focus inside the drawer so FAB doesn't capture keyboard events
      const id = window.setTimeout(() => {
        containerRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-[4px]"
            onClick={onClose}
          />

          <motion.div
            initial={positionVariants[effectivePosition].initial}
            animate={positionVariants[effectivePosition].animate}
            exit={positionVariants[effectivePosition].exit}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed z-[1000] flex flex-col bg-wash border-line shadow-lg",
              effectivePosition === "left" &&
                "inset-y-0 left-0 w-5/6 max-w-sm border-r",
              effectivePosition === "right" &&
                "inset-y-0 right-0 w-5/6 max-w-sm border-l",
              effectivePosition === "bottom" &&
                "inset-x-0 bottom-0 rounded-t-xl border-t",
              className
            )}
            ref={containerRef}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else e.stopPropagation();
            }}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            {title && (
              <div className="p-4 border-b border-line flex items-center justify-between">
                <h2 className="text-primary font-semibold">{title}</h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-primary" />
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}
