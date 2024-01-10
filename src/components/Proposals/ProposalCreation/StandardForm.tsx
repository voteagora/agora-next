"use client";

import { VStack } from "@/components/Layout/Stack";
import { Form } from "./CreateProposalForm";
import AddTransactionsDetails from "./AddTransactionsDetails";
import styles from "./styles.module.scss";

function StandardForm({ form }: { form: Form }) {
  return (
    <VStack>
      <h4 className={styles.create_prop_form__title}>Proposed transaction</h4>
      <p className={styles.standard__text}>
        Proposed transactions will execute if your proposal passes. If you skip
        this step, a transfer of 0 ETH to the 0 address will be added.
      </p>

      <AddTransactionsDetails optionIndex={0} form={form} />
    </VStack>
  );
}

export default StandardForm;
