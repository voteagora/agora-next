import { z } from "zod";
import { ApprovalProposalSchema } from "./../schemas/DraftProposalSchema";
import { useFormContext, useFieldArray } from "react-hook-form";
import NumberInput from "./form/NumberInput";
import SwitchInput from "./form/SwitchInput";
import {
  ApprovalProposalType,
  EthereumAddress,
} from "@/app/proposals/draft/types";
import { UpdatedButton } from "@/components/Button";
import TextInput from "./form/TextInput";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";

type FormType = z.output<typeof ApprovalProposalSchema>;

const OptionItem = ({ optionIndex }: { optionIndex: number }) => {
  const { control } = useFormContext<FormType>();

  return (
    <div className="space-y-4">
      <TextInput
        required={true}
        label="Description"
        name={`approvalProposal.options.${optionIndex}.description`}
        control={control}
      />
      <TextInput
        required={true}
        label="Contestant wallet address"
        name={`approvalProposal.options.${optionIndex}.contestant`}
        control={control}
      />
    </div>
  );
};

const ApprovalProposalForm = () => {
  const {
    control,
    watch,
    setValue,
    formState: { defaultValues },
  } = useFormContext<FormType>();

  const criteria = watch("approvalProposal.criteria");

  useEffect(() => {
    if (!defaultValues?.approvalProposal?.criteria) {
      setValue("approvalProposal.criteria", ApprovalProposalType.THRESHOLD);
    }
  }, [defaultValues?.approvalProposal?.criteria, setValue]);

  const {
    fields: options,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: "approvalProposal.options",
    rules: {
      validate: {
        validateOnlyOnSubmit: () => true,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-secondary font-semibold">Approval parameters</h3>
        <p className="mt-2 text-secondary">
          Use the following settings to set the parameters of this vote as well
          as the methodology for determining which options can be executed.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          required={true}
          label="Max options"
          name="approvalProposal.maxOptions"
          tooltip="Determines up to how many options each voter may select."
          control={control}
        />
        <SwitchInput
          control={control}
          label="Criteria"
          required={true}
          options={["Threshold", "Top choices"]}
          name="approvalProposal.criteria"
        />
        {criteria === ApprovalProposalType.TOP_CHOICES && (
          <NumberInput
            required={true}
            label="Top choices"
            name="approvalProposal.topChoices"
            tooltip="This is how many of the most voted for options win."
            control={control}
          />
        )}
        {criteria === ApprovalProposalType.THRESHOLD && (
          <NumberInput
            required={true}
            label="Threshold"
            name="approvalProposal.threshold"
            tooltip="This is the minimum number of votes an option must have to be considered a winner."
            control={control}
          />
        )}
      </div>
      <div>
        <h3 className="text-secondary font-semibold">Contestants</h3>
        <p className="mt-2 text-secondary">
          Add each contestant with their wallet address and a description.
        </p>
        <div className="mt-6 space-y-6">
          {options.map((field, index) => (
            <div
              className="p-4 border border-agora-stone-100 rounded-lg"
              key={field.id}
            >
              <div className="flex flex-row justify-between mb-4">
                <h2 className="text-secondary font-semibold">
                  Option #{index + 1}
                </h2>
                <span
                  onClick={() => removeOption(index)}
                  role="button"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <XCircleIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                </span>
              </div>
              <OptionItem optionIndex={index} />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <UpdatedButton
            isSubmit={false}
            type="secondary"
            className="flex-grow"
            onClick={() => {
              appendOption({
                description: "",
                contestant: "" as EthereumAddress,
              });
            }}
          >
            Add contestant
          </UpdatedButton>
        </div>
      </div>
    </div>
  );
};

export default ApprovalProposalForm;
