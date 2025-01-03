"use client";

import { useState } from "react";
import VotesBarChart from "./VotesBarChart";
import VotesTable from "./VotesTable";
import { Switch } from "@/components/shared/Switch";

const VotesDataView = ({ votes }: { votes: any }) => {
  const [view, setView] = useState<"table" | "chart">("table");

  return (
    <div>
      <div className="flex flex-row justify-between items-center pb-2 mt-4 mb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-primary flex-1">
          Voter participation
        </h2>
        <div className="w-[200px]">
          <Switch
            onSelectionChanged={() => {
              setView(view === "table" ? "chart" : "table");
            }}
            selection={view}
            options={["table", "chart"]}
          />
        </div>
      </div>
      {view === "table" ? (
        <VotesTable votes={votes} />
      ) : (
        <div className="mt-6 w-full h-[400px]">
          <VotesBarChart data={votes} />
        </div>
      )}
    </div>
  );
};

export default VotesDataView;
