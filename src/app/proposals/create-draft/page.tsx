import DraftProposalChecklist from "@/components/ProposalLifecycle/DraftProposalChecklist";
import DraftProposalForm from "@/components/ProposalLifecycle/DraftProposalForm";
import React from "react";

const DraftProposalPage: React.FC = () => {
  return (
    <div className="flex flex-row w-full gap-x-6 pt-9">
      <DraftProposalForm />
      <DraftProposalChecklist />
    </div>
  );
};

export default DraftProposalPage;
