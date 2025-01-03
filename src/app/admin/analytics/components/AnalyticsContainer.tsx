"use client";

import { useState } from "react";
import VotesDataView from "./votes/VotesDataView";
import DelegationsDataView from "./delegates/DelegationsDataView";
import ProposalsDataView from "./proposals/ProposalsDataView";

const AnalyticsContainer = ({
  votes,
  delegates,
}: {
  votes: any;
  delegates: any;
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
      {selectedView === "votes" && <VotesDataView votes={votes} />}
      {selectedView === "delegations" && (
        <DelegationsDataView delegates={delegates} />
      )}
      {selectedView === "proposals" && <ProposalsDataView />}
    </div>
  );
};

export default AnalyticsContainer;
