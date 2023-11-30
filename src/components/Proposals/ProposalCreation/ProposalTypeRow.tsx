"use client";

import { css } from "@emotion/css";
// import { Switch } from "../../components/Form/Switch";
import * as theme from "@/styles/theme";
import { Form } from "./CreateProposalForm";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./styles.module.scss";
import { Switch } from "@/components/shared/Switch";
import InputBox from "@/components/shared/InputBox";

function ProposalTypeRow({ form }: { form: Form }) {
  const { proposalType, proposalSettings } = form.state;
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
          <h4 className={styles.create_prop_form__heading}>Vote type</h4>
          <Switch
            options={["Basic", "Approval"]}
            selection={proposalType}
            onSelectionChanged={form.onChange.proposalType}
          />
          <p
            className={css`
              font-size: ${theme.fontSize.base};
              color: ${theme.colors.gray["4f"]};
              @media (max-width: ${theme.maxWidth["4xl"]}) {
                width: 100%;
                margin-top: ${theme.spacing["2"]};
                margin-left: 0;
              }
            `}
          >
            {infoText}
          </p>
        </div>
        <div
          className={css`
            width: 50%;
            @media (max-width: ${theme.maxWidth["4xl"]}) {
              width: 100%;
            }
          `}
        >
          <h4 className={styles.create_prop_form__heading}>Proposal type</h4>
          <InputBox
            label="Proposal settings"
            type="text"
            value={proposalSettings}
            onChange={form.onChange.proposalSettings}
            placeholder="Governance fund"
          />
        </div>
      </HStack>
    </VStack>
  );
}

export default ProposalTypeRow;
