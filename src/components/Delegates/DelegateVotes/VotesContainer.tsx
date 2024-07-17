"use client";

import React, { useState } from "react";

const VotesContainer = ({
  snapshotVotes,
  onchainVotes,
}: {
  snapshotVotes: React.ReactElement;
  onchainVotes: React.ReactElement;
}) => {
  const [activeTab, setActiveTab] = useState<"snapshot" | "onchain">("onchain");

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-4">
        <button
          className={`text-lg font-bold ${
            activeTab === "onchain"
              ? "text-stone-700"
              : "text-stone-400 hover:text-stone-700"
          }`}
          onClick={() => setActiveTab("onchain")}
        >
          On-chain votes
        </button>
        <button
          className={`text-lg font-bold ${
            activeTab === "snapshot"
              ? "text-stone-700"
              : "text-stone-400 hover:text-stone-700"
          }`}
          onClick={() => setActiveTab("snapshot")}
        >
          Snapshot votes
        </button>
      </div>
      <div className={activeTab === "onchain" ? "hidden" : "block"}>
        {snapshotVotes}
      </div>
      <div className={activeTab === "onchain" ? "block" : "hidden"}>
        {onchainVotes}
      </div>
    </div>
  );
};

export default VotesContainer;
