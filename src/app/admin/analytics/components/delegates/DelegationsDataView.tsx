import { useState } from "react";
import DelegatesPieChart from "./DelegatesPieChart";
import { Switch } from "@/components/shared/Switch";

const DelegationsDataView = ({ delegates }: { delegates: any }) => {
  const [view, setView] = useState<"table" | "chart">("table");

  console.log("delegates", delegates);

  return (
    <div>
      <div className="flex flex-row justify-between items-center pb-2 mt-4 mb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-primary flex-1">
          Delegation participation
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
        <p>Table coming soon...</p>
      ) : (
        <div className="mt-6 w-full h-[400px]">
          <DelegatesPieChart delegates={delegates} />
        </div>
      )}
    </div>
  );
};

export default DelegationsDataView;
