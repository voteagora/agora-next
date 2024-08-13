import React from "react";
// import { OptimisticProposalSchema } from "./../schemas/DraftProposalSchema";

const OptimisticProposalForm = () => {
  //   type FormType = z.output<typeof OptimisticProposalSchema>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-stone-900 font-semibold">
          Voting strategy and choices
        </h3>
        <p className="mt-2 stone-700">
          Choose the voting strategy and options for your proposal.
        </p>
      </div>
    </div>
  );
};

export default OptimisticProposalForm;