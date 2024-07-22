import React from "react";
import { useEffect } from "react";
import { z } from "zod";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import { SocialProposalType } from "./../types";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";
import { UpdatedButton } from "../../../../components/Button";
import { useFormContext, useFieldArray } from "react-hook-form";
import NumberInput from "./form/NumberInput";
import SwitchInput from "./form/SwitchInput";
import ProposedTransactionsForm from "./ProposedTransactionsForm";

const ApprovalProposalForm = () => {
  type FormType = z.output<typeof draftProposalSchema>;
  const {
    register,
    // watch,
    // formState: { errors, defaultValues },
  } = useFormContext<FormType>();

  //   const { fields, append, remove } = useFieldArray({
  //     control,
  //     name: "socialProposal.options",
  //   });

  //   const proposalType = watch("socialProposal.type");

  //   useEffect(() => {
  //     // removes all array fields
  //     remove();
  //     if (proposalType === SocialProposalType.BASIC) {
  //       append({ text: "FOR" });
  //       append({ text: "AGAINST" });
  //       append({ text: "ABSTAIN" });
  //     } else {
  //       const defaultOptions = defaultValues?.socialProposal?.options;
  //       if (defaultOptions && defaultOptions.length > 0) {
  //         defaultOptions.forEach((option) => {
  //           append({ text: option?.text || "" });
  //         });
  //       } else {
  //         append({ text: "" });
  //       }
  //     }
  //   }, [proposalType]);

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
        <FormItem label="Budget" required={true} htmlFor="budget">
          <NumberInput name="approvalProposal.budget" register={register} />
        </FormItem>
        <FormItem label="Max options" required={true} htmlFor="maxOptions">
          <NumberInput name="approvalProposal.maxOptions" register={register} />
        </FormItem>
        <FormItem label="Criteria" required={true} htmlFor="criteria">
          <SwitchInput
            options={["Threshold", "Top choices"]}
            name="approvalProposal.criteria"
          />
        </FormItem>
        <FormItem label="Threshold" required={true} htmlFor="threshold">
          <NumberInput name="approvalProposal.threshold" register={register} />
        </FormItem>
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
