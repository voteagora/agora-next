"use client";
import { useState } from "react";

const AnalyticsContainer = ({
  votesComponent,
  delegatesComponent,
  proposalsComponent,
}: {
  votesComponent: React.ReactNode;
  delegatesComponent: React.ReactNode;
  proposalsComponent: React.ReactNode;
}) => {
  const [selectedView, setSelectedView] = useState("votes");

  return (
    <div className="flex flex-col gap-4 mt-4 border border-line rounded-md">
      <div className="flex flex-row border-b border-line divide-x divide-line">
        <button
          onClick={() => setSelectedView("votes")}
          className={`${selectedView === "votes" ? "bg-tertiary/5 text-primary" : "text-secondary hover:bg-tertiary/5 hover:text-primary"} flex-1 font-bold py-8 transition-all`}
        >
          Votes
        </button>
        <button
          onClick={() => setSelectedView("delegations")}
          className={`${selectedView === "delegations" ? "bg-tertiary/5 text-primary" : "text-secondary hover:bg-tertiary/5 hover:text-primary"} flex-1 font-bold py-8 transition-all`}
        >
          Delegations
        </button>
        <button
          onClick={() => setSelectedView("proposals")}
          className={`${selectedView === "proposals" ? "bg-tertiary/5 text-primary" : "text-secondary hover:bg-tertiary/5 hover:text-primary"} flex-1 font-bold py-8 transition-all`}
        >
          Proposals
        </button>
      </div>
      <div className="py-8 px-4 h-[500px] relative">
        {selectedView === "votes" && votesComponent}
        {selectedView === "delegations" && delegatesComponent}
        {selectedView === "proposals" && proposalsComponent}
      </div>
    </div>
  );
};

export default AnalyticsContainer;
