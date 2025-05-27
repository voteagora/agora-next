"use client";

import { VStack } from "@/components/Layout/Stack";
import { Form } from "./CreateProposalForm";
import AddTransactionsDetails from "./AddTransactionsDetails";
import { ProposalScope } from "@/app/proposals/draft/types";

function StandardForm({
  form,
  proposal_scope,
}: {
  form: Form;
  proposal_scope?: ProposalScope;
}) {
  return (
    <VStack>
      {proposal_scope !== ProposalScope.OFFCHAIN_ONLY && (
        <>
          <h4 className="font-semibold pb-1">Proposed transaction</h4>
          <p className="font-bold text-secondary">
            Proposed transactions will execute if your proposal passes. If you
            skip this step, a transfer of 0 ETH to the 0 address will be added.
          </p>
          <AddTransactionsDetails optionIndex={0} form={form} />
        </>
      )}
      {proposal_scope === ProposalScope.OFFCHAIN_ONLY && (
        <p className="text-sm text-secondary">
          This is an off-chain only proposal and will not execute on-chain
          transactions.
        </p>
      )}
    </VStack>
  );
}

export default StandardForm;
