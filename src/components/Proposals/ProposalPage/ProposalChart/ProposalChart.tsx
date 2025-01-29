"use client";

import { useState } from "react";
import VotingTimelineChart from "../VotingTimelineChart/VotingTimelineChart";
import TreeMapChart from "../TreeMapChart/TreeMapChart";
import BubbleChart from "../BubbleChart/BubbleChart";
import { icons } from "@/icons/icons";
import Image from "next/image";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useProposalVotes } from "@/hooks/useProposalVotes";

export default function ProposalChart({ proposal }: { proposal: Proposal }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [showChart, setShowChart] = useState(proposal.status === "ACTIVE");

  const { data: fetchedVotes, isFetched } = useProposalVotes({
    enabled: showChart,
    limit: 250,
    offset: 0,
    proposalId: proposal.id,
  });

  const tabs = [
    { name: "Timeline", index: 0 },
    { name: "Map", index: 1 },
    { name: "Bubble", index: 2 },
  ];

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  const handleExpandChart = () => {
    setShowChart((prevState) => !prevState);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (showChart) {
      e.stopPropagation();
    }
  };

  return (
    <div className="border border-line rounded-lg p-4 pb-2 w-full bg-neutral">
      <div
        onClick={handleExpandChart}
        className="flex justify-between w-full items-center text-xs font-semibold mb-2 cursor-pointer select-none"
      >
        <div className="flex gap-1 py-1 text-secondary">
          Proposal Visualization{" "}
          <Image src={icons.chevronSelectorVertical} alt="chevronIcon" />
        </div>
        <div className="flex gap-x-2 items-center">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`tab ${tabIndex === tab.index ? "active text-primary bg-wash px-2 py-1 rounded-full" : "text-secondary px-2 py-1"}`}
              onClick={(e) => {
                handleButtonClick(e);
                handleTabsChange(tab.index);
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>
      {showChart && (
        <>
          {isFetched && fetchedVotes ? (
            <div className="tab-panels">
              {tabIndex === 0 && (
                <div className="tab-panel">
                  <VotingTimelineChart
                    proposal={proposal}
                    proposalVotes={fetchedVotes}
                  />
                </div>
              )}
              {tabIndex === 1 && (
                <div className="tab-panel">
                  <TreeMapChart
                    proposal={proposal}
                    proposalVotes={fetchedVotes}
                  />
                </div>
              )}
              {tabIndex === 2 && (
                <div className="tab-panel">
                  <BubbleChart
                    proposal={proposal}
                    proposalVotes={fetchedVotes}
                  />
                </div>
              )}
            </div>
          ) : (
            <ChartSkeleton />
          )}
        </>
      )}
    </div>
  );
}

const ChartSkeleton = () => {
  return (
    <div className="flex anumate-pulse">
      <div className="flex h-[230px] w-full bg-tertiary/10 rounded-md items-center justify-center text-xs text-secondary">
        {"Loading chart data..."}
      </div>
    </div>
  );
};
