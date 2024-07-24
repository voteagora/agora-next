import React from "react";
import { z } from "zod";
import { ApprovalProposalSchema } from "./../schemas/DraftProposalSchema";
import { useFormContext } from "react-hook-form";
import NumberInput from "./form/NumberInput";
import SwitchInput from "./form/SwitchInput";
import { ApprovalProposalType } from "@/app/proposals/draft/types";

const ApprovalProposalForm = () => {
  type FormType = z.output<typeof ApprovalProposalSchema>;
  const { control, watch } = useFormContext<FormType>();
  const criteria = watch("approvalProposal.criteria");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-stone-900 font-semibold">Approval parameters</h3>
        <p className="mt-2 stone-700">
          Use the following settings to set the parameters of this vote as well
          as the methodology for determining which options can be executed.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/*  info="This is the maximum number of tokens that can be transferred from all the options in this proposal." */}
        <NumberInput
          required={true}
          label="Budget"
          name="approvalProposal.budget"
          control={control}
        />
        {/*  info="Determines up to how many options each voter may select" */}
        <NumberInput
          required={true}
          label="Max options"
          name="approvalProposal.maxOptions"
          control={control}
        />
        {/* info="Threshold means all options with more than a set amount of votes win. Top choices means only a set number of the most popular options win." */}
        <SwitchInput
          control={control}
          label="Criteria"
          required={true}
          options={["Threshold", "Top choices"]}
          name="approvalProposal.criteria"
        />
        {criteria === ApprovalProposalType.TOP_CHOICES && (
          // info="Selects how many votes an option must have to be considered a winner"
          <NumberInput
            required={true}
            label="Top choices"
            name="approvalProposal.topChoices"
            control={control}
          />
        )}
        {criteria === ApprovalProposalType.THRESHOLD && (
          <NumberInput
            required={true}
            label="Threshold"
            name="approvalProposal.threshold"
            control={control}
          />
        )}
      </div>
      <div>
        <h3 className="text-stone-900 font-semibold">Proposed transactions</h3>
        <p className="mt-2 stone-700">
          Proposed transactions will execute if your proposal passes. If you
          skip this step no transactions will be added.
        </p>
      </div>
      {/* <ProposedTransactionsForm />; */}
    </div>
  );
};

export default ApprovalProposalForm;
