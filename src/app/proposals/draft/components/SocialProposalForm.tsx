import { useEffect } from "react";
import { z } from "zod";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import { SocialProposalType } from "./../types";
import { SocialProposalSchema } from "./../schemas/DraftProposalSchema";
import { UpdatedButton } from "@/components/Button";
import { useFormContext, useFieldArray } from "react-hook-form";
import RadioGroupInput from "./form/RadioGroupInput";
import DateInput from "./form/DateInput";

const SocialProposalForm = () => {
  type FormType = z.output<typeof SocialProposalSchema>;
  const {
    control,
    watch,
    formState: { defaultValues },
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
        <h3 className="text-primary font-semibold">
          Voting strategy and choices
        </h3>
        <p className="mt-2 stone-700">
          Choose the voting strategy and options for your proposal.
        </p>
      </div>
      <FormItem label="Voting strategy" required={true} htmlFor="type">
        <RadioGroupInput
          name="socialProposal.type"
          control={control}
          options={Object.values(SocialProposalType).map((value) => {
            return { label: value, value: value } as any;
          })}
        />
      </FormItem>

      <div className="grid grid-cols-2 gap-4">
        <FormItem label="Start date" required={true} htmlFor="start_date">
          <DateInput name="socialProposal.start_date" control={control} />
        </FormItem>
        <FormItem label="End date" required={true} htmlFor="end_date">
          <DateInput name="socialProposal.end_date" control={control} />
        </FormItem>
      </div>
      <div className="space-y-6">
        {fields.map((field, index) => {
          return (
            <div className="flex flex-row space-x-4" key={`option-${index}`}>
              <div className="flex-1">
                <TextInput
                  label={`Option ${index + 1} text`}
                  name={`socialProposal.options.${index}.text`}
                  control={control}
                  placeholder="For, against, abstain, etc."
                  disabled={proposalType === SocialProposalType.BASIC}
                />
              </div>
              {proposalType === SocialProposalType.APPROVAL && (
                <UpdatedButton
                  className="self-start"
                  type="secondary"
                  onClick={() => {
                    remove(index);
                  }}
                >
                  Remove option
                </UpdatedButton>
              )}
            </div>
          );
        })}
      </div>
      {proposalType === SocialProposalType.APPROVAL && (
        <UpdatedButton
          type="secondary"
          fullWidth
          isSubmit={false}
          onClick={() => {
            append({ text: "" });
          }}
        >
          Add option
        </UpdatedButton>
      )}
    </div>
  );
};

export default SocialProposalForm;
