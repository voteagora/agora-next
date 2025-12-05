"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { TreasuryWrappedModal } from "./TreasuryWrappedModal";
import { wrappedData } from "./wrappedData";

export function TreasuryWrappedCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-line shadow-sm bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        {/* Decorative sparkles */}
        <div className="absolute top-4 right-4">
          <Sparkles className="w-6 h-6 text-yellow-400/60" />
        </div>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs uppercase tracking-widest text-white/60">
              New
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-1">
            {wrappedData.title}
          </h3>
          <p className="text-sm text-white/70 mb-4">Treasury, Wrapped</p>

          {/* Key stat */}
          <div className="mb-6">
            <p className="text-3xl font-bold text-white">
              {wrappedData.summaryStats[0].value}
            </p>
            <p className="text-sm text-white/60">treasury</p>
          </div>

          {/* CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-auto w-full px-4 py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-white/90 transition-colors"
          >
            Experience it
          </button>
        </div>
      </div>

      <TreasuryWrappedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
