import React from "react";
import { useEffect } from "react";
import { z } from "zod";
import { SocialProposalType } from "./../types";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";
import { useFormContext, useFieldArray } from "react-hook-form";

const OptimisticProposalForm = () => {
  type FormType = z.output<typeof draftProposalSchema>;
  const {
    register,
    control,
    watch,
    formState: { errors, defaultValues },
  } = useFormContext<FormType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialProposal.options",
  });

  const proposalType = watch("socialProposal.type");

  useEffect(() => {
    // removes all array fields
    remove();
    if (proposalType === SocialProposalType.BASIC) {
      append({ text: "FOR" });
      append({ text: "AGAINST" });
      append({ text: "ABSTAIN" });
    } else {
      const defaultOptions = defaultValues?.socialProposal?.options;
      if (defaultOptions && defaultOptions.length > 0) {
        defaultOptions.forEach((option) => {
          append({ text: option?.text || "" });
        });
      } else {
        append({ text: "" });
      }
    }
  }, [proposalType]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-stone-900 font-semibold">
          Voting strategy and choices
        </h3>
        <p className="mt-2 stone-700">
          Choose the voting strategy and options for your proposal.
        </p>
      </div>
    </div>
  );
};

export default OptimisticProposalForm;
