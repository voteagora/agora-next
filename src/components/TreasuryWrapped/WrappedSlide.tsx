"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WrappedHighlight, WrappedSummaryStat } from "./wrappedData";

interface TitleSlideProps {
  type: "title";
  title: string;
  subtitle: string;
  onStart: () => void;
}

interface HighlightSlideProps {
  type: "highlight";
  highlight: WrappedHighlight;
}

interface SummarySlideProps {
  type: "summary";
  stats: WrappedSummaryStat[];
  pdfUrl: string;
  forumUrl: string;
  period: string;
  onClose: () => void;
}

type WrappedSlideProps =
  | TitleSlideProps
  | HighlightSlideProps
  | SummarySlideProps;

const slideVariants = {
  enter: {
    opacity: 0,
    y: 20,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

function TitleSlide({
  title,
  subtitle,
  onStart,
}: Omit<TitleSlideProps, "type">) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
        {title}
      </h1>
      <p className="text-lg sm:text-xl text-white/80 mb-8">{subtitle}</p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-white/90 transition-colors"
      >
        Start
      </button>
    </div>
  );
}

function HighlightSlide({ highlight }: Omit<HighlightSlideProps, "type">) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-6">
      <p className="text-sm sm:text-base uppercase tracking-widest text-white/60 mb-4">
        {highlight.headline}
      </p>
      <h2 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-2">
        {highlight.stat}
      </h2>
      <p className="text-lg sm:text-xl text-white/80 mb-6">
        {highlight.statLabel}
      </p>
      <p className="text-base sm:text-lg text-white/70 max-w-lg">
        {highlight.insight}
      </p>
    </div>
  );
}

function SummarySlide({
  stats,
  pdfUrl,
  forumUrl,
  period,
  onClose,
}: Omit<SummarySlideProps, "type">) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
        Your {period} Summary
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8 w-full max-w-md">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/10 rounded-xl p-3 sm:p-6 backdrop-blur-sm"
          >
            <p className="text-xl sm:text-3xl font-bold text-white">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-white/70 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-900 text-sm sm:text-base font-semibold rounded-full hover:bg-white/90 transition-colors text-center"
        >
          Read full report
        </a>
        <a
          href={forumUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 text-white text-sm sm:text-base font-semibold rounded-full hover:bg-white/30 transition-colors border border-white/30 text-center"
          onClick={(e) => {
            e.preventDefault();
            onClose();
            window.open(forumUrl, "_blank");
          }}
        >
          Discuss on forums
        </a>
      </div>
    </div>
  );
}

export function WrappedSlide(props: WrappedSlideProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={
          props.type === "highlight" ? props.highlight.slideNumber : props.type
        }
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full h-full"
      >
        {props.type === "title" && (
          <TitleSlide
            title={props.title}
            subtitle={props.subtitle}
            onStart={props.onStart}
          />
        )}
        {props.type === "highlight" && (
          <HighlightSlide highlight={props.highlight} />
        )}
        {props.type === "summary" && (
          <SummarySlide
            stats={props.stats}
            pdfUrl={props.pdfUrl}
            forumUrl={props.forumUrl}
            period={props.period}
            onClose={props.onClose}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
