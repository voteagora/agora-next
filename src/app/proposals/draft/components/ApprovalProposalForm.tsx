import React from "react";
import { z } from "zod";
import FormItem from "./form/FormItem";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";
import { useFormContext } from "react-hook-form";
import NumberInput from "./form/NumberInput";
import SwitchInput from "./form/SwitchInput";
import ProposedTransactionsForm from "./ProposedTransactionsForm";
import { ApprovalProposalType } from "@/app/proposals/draft/types";

const ApprovalProposalForm = () => {
  type FormType = z.output<typeof draftProposalSchema>;
  const { register, watch } = useFormContext<FormType>();
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
        <FormItem
          label="Budget"
          required={true}
          info="This is the maximum number of tokens that can be transferred from all the options in this proposal."
          htmlFor="budget"
        >
          <NumberInput name="approvalProposal.budget" register={register} />
        </FormItem>
        <FormItem
          label="Max options"
          required={true}
          info="Determines up to how many options each voter may select"
          htmlFor="maxOptions"
        >
          <NumberInput name="approvalProposal.maxOptions" register={register} />
        </FormItem>
        <FormItem
          label="Criteria"
          required={true}
          info="Threshold means all options with more than a set amount of votes win. Top choices means only a set number of the most popular options win."
          htmlFor="criteria"
        >
          <SwitchInput
            options={["Threshold", "Top choices"]}
            name="approvalProposal.criteria"
          />
        </FormItem>
        {criteria === ApprovalProposalType.TOP_CHOICES && (
          <FormItem
            label="Top choices"
            info="Selects how many votes an option must have to be considered a winner"
            required={true}
            htmlFor="topChoices"
          >
            <NumberInput
              name="approvalProposal.topChoices"
              register={register}
            />
          </FormItem>
        )}
        {criteria === ApprovalProposalType.THRESHOLD && (
          <FormItem label="Threshold" required={true} htmlFor="threshold">
            <NumberInput
              name="approvalProposal.threshold"
              register={register}
            />
          </FormItem>
        )}
      </div>
      <div>
        <h3 className="text-stone-900 font-semibold">Proposed transactions</h3>
        <p className="mt-2 stone-700">
          Proposed transactions will execute if your proposal passes. If you
          skip this step no transactions will be added.
        </p>
      </div>
      <ProposedTransactionsForm />;
    </div>
  );
};

export default ApprovalProposalForm;
