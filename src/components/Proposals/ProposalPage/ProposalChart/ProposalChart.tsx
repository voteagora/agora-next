"use client";

import { useState } from "react";
import { TimelineChart } from "@/components/Proposals/ProposalPage/Charts/TimelineChart";
import TreeMapChart from "../TreeMapChart/TreeMapChart";
import BubbleChart from "../BubbleChart/BubbleChart";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useProposalVotesChart } from "@/hooks/useProposalVotesChart";
import { ExpandCollapseIcon } from "@/icons/ExpandCollapseIcon";
import Tenant from "@/lib/tenant/tenant";

const { ui } = Tenant.current();

const easv2Enabled = ui.toggle("easv2-govlessvoting")?.enabled;

export default function ProposalChart({ proposal }: { proposal: Proposal }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [showChart, setShowChart] = useState(proposal.status === "ACTIVE");

  const { data: votes } = useProposalVotesChart({
    enabled: showChart,
    proposalId: proposal.id,
    proposalType: proposal.proposalType ?? undefined,
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

  if (votes && votes.length === 0 && easv2Enabled) {
    return null;
  }

  return (
    <div className="border border-line rounded-lg p-4 pb-2 w-full bg-neutral">
      <div
        onClick={handleExpandChart}
        className="flex justify-between w-full items-center text-xs font-semibold mb-2 cursor-pointer select-none"
      >
        <div className="flex gap-1 py-1 text-secondary">
          Proposal Visualization{" "}
          <ExpandCollapseIcon className="stroke-tertiary h-3 w-3 self-center" />
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
          {votes ? (
            <div className="tab-panels">
              {tabIndex === 0 && (
                <div className="tab-panel">
                  <TimelineChart proposal={proposal} votes={votes} />
                </div>
              )}
              {tabIndex === 1 && (
                <div className="tab-panel">
                  <TreeMapChart proposal={proposal} votes={votes} />
                </div>
              )}
              {tabIndex === 2 && (
                <div className="tab-panel">
                  <BubbleChart proposal={proposal} votes={votes} />
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

export const ChartSkeleton = () => {
  return (
    <div className="flex anumate-pulse">
      <div className="flex h-[230px] w-full bg-tertiary/10 rounded-md items-center justify-center text-xs text-secondary">
        {"Loading chart data..."}
      </div>
    </div>
  );
};
