import { useEffect, useRef } from "react";
import { z } from "zod";
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

  const { fields, replace, append } = useFieldArray({
    control,
    name: "socialProposal.options",
  });

  const localProposalType = watch("socialProposal.type");
  const savedProposalType = defaultValues?.socialProposal?.type;
  const savedOptions = defaultValues?.socialProposal?.options;
  const prevProposalTypeRef = useRef<SocialProposalType | null>(null);

  useEffect(() => {
    const updateOptions = () => {
      if (localProposalType === SocialProposalType.BASIC) {
        if (savedProposalType === SocialProposalType.BASIC && savedOptions) {
          replace(savedOptions as FormType["socialProposal"]["options"]);
        } else {
          replace([{ text: "FOR" }, { text: "AGAINST" }, { text: "ABSTAIN" }]);
        }
      } else if (localProposalType === SocialProposalType.APPROVAL) {
        if (savedProposalType === SocialProposalType.APPROVAL && savedOptions) {
          replace(savedOptions as FormType["socialProposal"]["options"]);
        } else {
          replace([{ text: "" }]);
        }
      }
    };

    if (localProposalType !== prevProposalTypeRef.current) {
      updateOptions();
    }

    prevProposalTypeRef.current = localProposalType;
  }, [localProposalType, replace, watch]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-primary font-semibold">
          Voting strategy and choices
        </h3>
        <p className="mt-2 text-secondary">
          Choose the voting strategy and options for your proposal.
        </p>
      </div>
      <RadioGroupInput
        label="Voting strategy"
        required={true}
        name="socialProposal.type"
        control={control}
        options={Object.values(SocialProposalType).map((value) => {
          return { label: value, value: value };
        })}
      />
      <div className="grid grid-cols-2 gap-4">
        <DateInput
          label="Start date"
          required={true}
          name="socialProposal.start_date"
          control={control}
        />
        <DateInput
          label="End date"
          required={true}
          name="socialProposal.end_date"
          control={control}
        />
      </div>
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div className="flex flex-row space-x-4" key={field.id}>
            <div className="flex-1">
              <TextInput
                label={`Option ${index + 1} text`}
                name={`socialProposal.options.${index}.text`}
                control={control}
                placeholder="For, against, abstain, etc."
                disabled={localProposalType === SocialProposalType.BASIC}
              />
            </div>
            {localProposalType === SocialProposalType.APPROVAL &&
              fields.length > 1 && (
                <UpdatedButton
                  className="self-end"
                  type="secondary"
                  onClick={() => {
                    const newFields = [...fields];
                    newFields.splice(index, 1);
                    replace(newFields);
                  }}
                >
                  Remove option
                </UpdatedButton>
              )}
          </div>
        ))}
      </div>
      {localProposalType === SocialProposalType.APPROVAL && (
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
