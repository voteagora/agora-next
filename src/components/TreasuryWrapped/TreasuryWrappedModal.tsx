"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { WrappedSlide } from "./WrappedSlide";
import { WrappedProgressDots } from "./WrappedProgressDots";
import { wrappedData, WRAPPED_STORAGE_KEY } from "./wrappedData";

interface TreasuryWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Total slides: 1 title + 4 highlights + 1 summary = 6
const TOTAL_SLIDES = 6;

export function TreasuryWrappedModal({
  isOpen,
  onClose,
}: TreasuryWrappedModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Mark as viewed when reaching final slide
  useEffect(() => {
    if (currentSlide === TOTAL_SLIDES - 1) {
      localStorage.setItem(WRAPPED_STORAGE_KEY, "true");
    }
  }, [currentSlide]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setHasStarted(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Focus trap - focus modal on open and trap focus within
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Focus trap - prevent focus from leaving modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleFocusTrap = (e: FocusEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener("focusin", handleFocusTrap);
    return () => document.removeEventListener("focusin", handleFocusTrap);
  }, [isOpen]);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentSlide(1);
  };

  // Handle dot click - reset hasStarted if going back to title slide
  const handleDotClick = useCallback((slideIndex: number) => {
    if (slideIndex === 0) {
      setHasStarted(false);
    }
    setCurrentSlide(slideIndex);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault(); // Prevent scroll on spacebar
        if (!hasStarted && currentSlide === 0) {
          handleStart();
        } else {
          goToNextSlide();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasStarted, currentSlide, goToNextSlide, goToPrevSlide, onClose]);

  const renderSlide = () => {
    // Title slide
    if (currentSlide === 0) {
      return (
        <WrappedSlide
          type="title"
          title={wrappedData.title}
          subtitle="Let's unwrap your treasury"
          onStart={handleStart}
        />
      );
    }

    // Highlight slides (1-4)
    if (currentSlide >= 1 && currentSlide <= 4) {
      const highlightIndex = currentSlide - 1;
      return (
        <WrappedSlide
          type="highlight"
          highlight={wrappedData.highlights[highlightIndex]}
        />
      );
    }

    // Summary slide (5)
    return (
      <WrappedSlide
        type="summary"
        stats={wrappedData.summaryStats}
        pdfUrl={wrappedData.pdfUrl}
        forumUrl={wrappedData.forumUrl}
        period={wrappedData.period}
        onClose={onClose}
      />
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${wrappedData.title} - Treasury Wrapped Experience`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/60 hover:text-white transition-colors z-10"
              aria-label="Close Treasury Wrapped modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation arrows (only show after started and not on summary) */}
            {hasStarted && currentSlide > 0 && (
              <button
                onClick={goToPrevSlide}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {hasStarted && currentSlide < TOTAL_SLIDES - 1 && (
              <button
                onClick={goToNextSlide}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Slide content */}
            <div className="flex-1 w-full max-w-3xl flex items-center justify-center px-4">
              {renderSlide()}
            </div>

            {/* Progress dots */}
            {hasStarted && (
              <div className="pb-8">
                <WrappedProgressDots
                  totalSlides={TOTAL_SLIDES}
                  currentSlide={currentSlide}
                  onDotClick={handleDotClick}
                />
              </div>
            )}

            {/* Next button for highlight slides */}
            {hasStarted &&
              currentSlide >= 1 &&
              currentSlide < TOTAL_SLIDES - 1 && (
                <button
                  onClick={goToNextSlide}
                  className="absolute bottom-20 sm:bottom-24 px-8 py-3 bg-white/20 text-white font-semibold rounded-full hover:bg-white/30 transition-colors border border-white/30"
                >
                  Next
                </button>
              )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
