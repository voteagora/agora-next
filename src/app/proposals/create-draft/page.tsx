import DraftProposalChecklist from "@/components/ProposalLifecycle/DraftProposalChecklist/DraftProposalChecklist";
import React from "react";

const DraftProposalPage: React.FC = () => {
  return (
    <div className="flex flex-row w-full gap-x-6 pt-9">
      <div className="flex-grow">Create a temp check on discourse</div>
      <DraftProposalChecklist />
    </div>
  );
};

export default DraftProposalPage;
