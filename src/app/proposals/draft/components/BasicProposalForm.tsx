"use client";

import ProposedTransactionsForm from "./ProposedTransactionsForm";

const BasicProposalForm = () => {
  return (
    <div>
      <h3 className="text-primary font-semibold">Proposed transactions</h3>
      <p className="mt-2 stone-700">
        Proposed transactions will execute after a proposal passes and then gets
        executed.
      </p>
      <ProposedTransactionsForm />
    </div>
  );
};

export default BasicProposalForm;
