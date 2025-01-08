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
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-row gap-4">
        <button
          onClick={() => setSelectedView("votes")}
          className={`${selectedView === "votes" ? "bg-tertiary/5 text-primary" : "text-secondary"} py-1 px-2 rounded-md`}
        >
          Votes
        </button>
        <button
          onClick={() => setSelectedView("delegations")}
          className={`${selectedView === "delegations" ? "bg-tertiary/5 text-primary" : "text-secondary"} py-1 px-2 rounded-md`}
        >
          Delegations
        </button>
        <button
          onClick={() => setSelectedView("proposals")}
          className={`${selectedView === "proposals" ? "bg-tertiary/5 text-primary" : "text-secondary"} py-1 px-2 rounded-md`}
        >
          Proposals
        </button>
      </div>
      {selectedView === "votes" && votesComponent}
      {selectedView === "delegations" && delegatesComponent}
      {selectedView === "proposals" && proposalsComponent}
    </div>
  );
};

export default AnalyticsContainer;
