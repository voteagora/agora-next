import { useState } from "react";
import VotingTimelineChart from "../VotingTimelineChart/VotingTimelineChart";
import TreeMapChart from "../TreeMapChart/TreeMapChart";
import { icons } from "@/icons/icons";
import Image from "next/image";

export default function ProposalChart({ proposal, proposalVotes }) {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };
  const [showChart, setShowChart] = useState(proposal.status === "ACTIVE");

  const handleExpandChart = () => {
    setShowChart((prevState) => !prevState);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 pb-2 w-full font-inter">
      <div className="flex justify-between w-full items-center text-xs font-semibold mb-2 cursor-pointer">
        <div onClick={handleExpandChart} className="flex gap-1">
          Proposal Visualization{" "}
          <Image src={icons.chevronSelectorVertical} alt="chevronIcon" />
        </div>
        <div className="flex gap-x-2 items-center">
          <button
            className={`tab ${tabIndex === 0 ? "active" : "text-stone-500"}`}
            onClick={() => handleTabsChange(0)}
          >
            Voting Timeline
          </button>
          <button
            className={`tab ${tabIndex === 1 ? "active" : "text-stone-500"}`}
            onClick={() => handleTabsChange(1)}
          >
            Vote Composition
          </button>
        </div>
      </div>
      {showChart && (
        <div className="tab-panels">
          {tabIndex === 0 && (
            <div className="tab-panel">
              <VotingTimelineChart
                proposal={proposal}
                proposalVotes={proposalVotes}
              />
            </div>
          )}
          {tabIndex === 1 && (
            <div className="tab-panel">
              <TreeMapChart proposal={proposal} proposalVotes={proposalVotes} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
