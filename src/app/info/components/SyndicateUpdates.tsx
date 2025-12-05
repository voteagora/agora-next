"use client";

import React from "react";
import { TreasuryWrappedCard } from "@/components/TreasuryWrapped/TreasuryWrappedCard";

export function SyndicateUpdates() {
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-black text-primary">
        Syndicate Collective Updates
      </h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TreasuryWrappedCard />
      </div>
    </div>
  );
}
