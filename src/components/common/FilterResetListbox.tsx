"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/shared/CloseIcon";
import {
  CountBadge,
  MobileCountIndicator,
} from "@/components/common/CountBadge";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent } from "../ui/dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";

// Animation variants for the bottom sheet
const variants = {
  hidden: { y: "100%" },
  show: { y: "0%" },
  exit: { y: "100%" },
};

export type FilterResetListboxProps = {
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  activeCount?: number;
  onReset: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  borderBelowLabel?: boolean;
  animateFromBottom?: boolean;
  headerLabel?: string | null;
};

const FilterResetListbox = ({
  triggerLabel,
  triggerIcon,
  activeCount = 0,
  onReset,
  children,
  isOpen,
  onOpenChange,
  borderBelowLabel = true,
  animateFromBottom = false,
  headerLabel,
}: FilterResetListboxProps) => {
  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setOpen(newOpen);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReset(e);
  };

  const hasActiveFilters = activeCount > 0;

  if (animateFromBottom) {
    return (
      <div className="relative">
        <button
          className={cn(
            "px-[12px] md:p-[10px] rounded-sm md:rounded-lg border border-line inline-flex gap-[6px] items-center leading-none h-[42px] relative",
            hasActiveFilters
              ? "bg-wash md:bg-brandPrimary"
              : "bg-wash text-primary"
          )}
          aria-label="Open filter options"
          onClick={() => handleOpenChange(!open)}
        >
          {triggerIcon}
          <span
            className={cn(
              "hidden px-2 md:inline-block",
              hasActiveFilters ? "text-neutral" : "text-primary leading-none"
            )}
          >
            {triggerLabel}
          </span>
          {hasActiveFilters && (
            <>
              <MobileCountIndicator
                count={activeCount}
                className="inline-block md:hidden"
              />
            </>
          )}
        </button>

        {(isOpen !== undefined ? isOpen : open) && (
          <AnimatePresence>
            <div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                className="z-[1000] bg-black fixed top-0 left-0 right-0 bottom-0"
                onClick={() => handleOpenChange(false)}
              />
              <motion.div
                className="bg-wash w-full fixed bottom-0 left-0 max-h-[100%] overflow-y-auto z-[1001]"
                initial="hidden"
                animate="show"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.2 }}
              >
                <div className="grid w-full relative">
                  <div className="h-16 px-4 py-2 flex items-center justify-end sticky top-0">
                    <button onClick={() => handleOpenChange(false)}>
                      <CloseIcon className="h-6 w-6 text-primary" />
                    </button>
                  </div>

                  <div
                    className={cn(
                      "self-stretch h-16 px-4 py-2 inline-flex justify-between items-center",
                      borderBelowLabel && "border-b border-line"
                    )}
                  >
                    <div className="text-secondary text-base font-semibold leading-normal">
                      {headerLabel === undefined ? triggerLabel : headerLabel}
                    </div>
                    <button
                      onClick={handleReset}
                      className="justify-center text-primary text-xs font-medium leading-none cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                  {/* Content */}
                  {children}
                </div>
              </motion.div>
            </div>
          </AnimatePresence>
        )}
      </div>
    );
  }

  // Original implementation for non-bottom sheet
  return (
    <DropdownMenu.Root
      open={isOpen !== undefined ? isOpen : open}
      onOpenChange={handleOpenChange}
      modal={false}
    >
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "px-[12px] md:p-[10px] rounded-sm md:rounded-lg border border-line inline-flex gap-[6px] items-center leading-none h-[42px] relative",
            hasActiveFilters
              ? "bg-wash md:bg-brandPrimary"
              : "bg-wash text-primary"
          )}
          aria-label="Open filter options"
        >
          {triggerIcon}
          <span
            className={cn(
              "hidden px-2 md:inline-block",
              hasActiveFilters ? "text-neutral" : "text-primary leading-none"
            )}
          >
            {triggerLabel}
          </span>
        </button>
      </DropdownMenu.Trigger>
      {hasActiveFilters && (
        <div className="h-10 bg-brandPrimary rounded-lg flex -ml-2.5 relative left-[-10px] mr-[-10px]">
          <MobileCountIndicator
            count={activeCount}
            className="inline-block md:hidden"
          />
          <div className="hidden md:flex items-center gap-[6px]">
            <CountBadge count={activeCount} border={false} />
            <div className="h-[18px] w-[1px] bg-neutral" />
            <div onClick={handleReset} className="cursor-pointer pr-[10px]">
              <CloseIcon className="text-neutral w-3 h-3" />
            </div>
          </div>
        </div>
      )}

      <DropdownMenu.Portal>
        <DropdownMenuContent
          side="bottom"
          align="end"
          alignOffset={hasActiveFilters ? -47 : 0}
        >
          <div className="grid w-full bg-wash">
            <div
              className={cn(
                "self-stretch h-16 px-4 py-2 inline-flex justify-between items-center",
                borderBelowLabel && "border-b border-line"
              )}
            >
              <div className="text-secondary text-base font-semibold leading-normal">
                {headerLabel === undefined ? triggerLabel : headerLabel}
              </div>
              <button
                onClick={handleReset}
                className="justify-center text-primary text-xs font-medium leading-none cursor-pointer"
              >
                Reset
              </button>
            </div>
            {/* Content */}
            {children}
          </div>
        </DropdownMenuContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default FilterResetListbox;
