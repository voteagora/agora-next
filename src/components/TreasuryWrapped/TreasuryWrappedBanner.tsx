"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { WRAPPED_BANNER_STORAGE_KEY } from "./wrappedData";
import { TreasuryWrappedModal } from "./TreasuryWrappedModal";

export function TreasuryWrappedBanner() {
  const [isDismissed, setIsDismissed] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(WRAPPED_BANNER_STORAGE_KEY);
    setIsDismissed(dismissed === "true");
    setIsLoaded(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(WRAPPED_BANNER_STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  const handleOpenWrapped = () => {
    setIsModalOpen(true);
  };

  // Don't render anything until localStorage is checked (prevents hydration flash)
  if (!isLoaded) {
    return null;
  }

  // When dismissed, don't render anything (modal is not needed from banner)
  if (isDismissed) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
              <span className="text-sm text-white">
                Q3 2025 Financials are in. See your treasury, wrapped.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenWrapped}
                className="px-4 py-1.5 bg-white text-gray-900 text-sm font-medium rounded-full hover:bg-white/90 transition-colors"
              >
                View now
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isModalOpen && (
        <TreasuryWrappedModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
