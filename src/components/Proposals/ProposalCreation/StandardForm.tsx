"use client";

import { VStack } from "@/components/Layout/Stack";
import { Form } from "./CreateProposalForm";
import AddTransactionsDetails from "./AddTransactionsDetails";

function StandardForm({ form }: { form: Form }) {
  return (
    <VStack>
      <h4 className="font-semibold pb-1">Proposed transaction</h4>
      <p className="font-bold text-secondary">
        Proposed transactions will execute if your proposal passes. If you skip
        this step, a transfer of 0 ETH to the 0 address will be added.
      </p>

      <AddTransactionsDetails optionIndex={0} form={form} />
    </VStack>
  );
}

export default StandardForm;
