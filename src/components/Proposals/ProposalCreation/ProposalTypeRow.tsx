"use client";

import { css } from "@emotion/css";
// import { Switch } from "../../components/Form/Switch";
import * as theme from "@/styles/theme";
import { Form } from "./CreateProposalForm";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./styles.module.scss";
import { Switch } from "@/components/shared/Switch";

function ProposalTypeRow({ form }: { form: Form }) {
  const { proposalType } = form.state;
  const infoText =
    proposalType === "Basic"
      ? "This default proposal type lets delegates vote either yes or no"
      : "This proposal type enables vote for multiple options";
  return (
    <VStack
      className={css`
        margin-top: ${theme.spacing["4"]};
      `}
    >
      <h4 className={styles.create_prop_form__heading}>Proposal type</h4>
      <HStack
        className={css`
          @media (max-width: ${theme.maxWidth["4xl"]}) {
            flex-direction: column;
          }
        `}
      >
        <div
          className={css`
            width: 50%;
            @media (max-width: ${theme.maxWidth["4xl"]}) {
              width: 100%;
            }
          `}
        >
          <Switch
            options={["Basic", "Approval"]}
            selection={proposalType}
            onSelectionChanged={form.onChange.proposalType}
          />
        </div>
        <p
          className={css`
            font-size: ${theme.fontSize.base};
            color: ${theme.colors.gray["4f"]};
            margin-left: ${theme.spacing["8"]};
            width: 50%;
            @media (max-width: ${theme.maxWidth["4xl"]}) {
              width: 100%;
              margin-top: ${theme.spacing["2"]};
              margin-left: 0;
            }
          `}
        >
          {infoText}
        </p>
      </HStack>
    </VStack>
  );
}

export default ProposalTypeRow;
