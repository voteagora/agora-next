"use client";

import { css } from "@emotion/css";
import { VStack } from "@/components/Layout/Stack";
import * as theme from "@/styles/theme";
import { Form } from "./CreateProposalForm";
import AddTransactionsDetails from "./AddTransactionsDetails";
import styles from "./styles.module.scss";

function StandardForm({ form }: { form: Form }) {
  return (
    <VStack>
      <h4 className={styles.create_prop_form__heading}>Proposed transaction</h4>
      <p
        className={css`
          font-size: ${theme.fontSize.base};
          color: ${theme.colors.gray["4f"]};
        `}
      >
        Proposed transactions will execute if your proposal passes. If you skip
        this step, a transfer of 0 ETH to the 0 address will be added.
      </p>

      <AddTransactionsDetails optionIndex={0} form={form} />
    </VStack>
  );
}

export default StandardForm;
