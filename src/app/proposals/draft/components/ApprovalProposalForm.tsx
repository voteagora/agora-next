import { z } from "zod";
import { ApprovalProposalSchema } from "./../schemas/DraftProposalSchema";
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayRemove,
} from "react-hook-form";
import NumberInput from "./form/NumberInput";
import SwitchInput from "./form/SwitchInput";
import {
  ApprovalProposalType,
  TransactionType,
  EthereumAddress,
} from "@/app/proposals/draft/types";
import TransferTransactionForm from "./TransferTransactionForm";
import CustomTransactionForm from "./CustomTransactionForm";
import { UpdatedButton } from "@/components/Button";
import TextInput from "./form/TextInput";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react";

type FormType = z.output<typeof ApprovalProposalSchema>;

const OptionItem = ({ optionIndex }: { optionIndex: number }) => {
  const { control, watch } = useFormContext<FormType>();

  const {
    fields: transactions,
    append: appendTransaction,
    remove: removeTransaction,
  } = useFieldArray({
    control,
    name: `approvalProposal.options.${optionIndex}.transactions`,
  });

  return (
    <div>
      <TextInput
        required={true}
        label="Title"
        name={`approvalProposal.options.${optionIndex}.title`}
        control={control}
      />
      <div className="mt-6 space-y-12">
        {transactions.map((field, transactionIndex) => {
          return (
            <>
              {field.type === TransactionType.TRANSFER ? (
                <TransactionFormItem
                  remove={removeTransaction}
                  optionIndex={optionIndex}
                  transactionIndex={transactionIndex}
                  key={`transfer-${transactionIndex}`}
                >
                  <TransferTransactionForm
                    index={transactionIndex}
                    name={`approvalProposal.options.${optionIndex}.transactions`}
                  />
                </TransactionFormItem>
              ) : (
                <TransactionFormItem
                  remove={removeTransaction}
                  optionIndex={optionIndex}
                  transactionIndex={transactionIndex}
                  key={`custom-${transactionIndex}`}
                >
                  <CustomTransactionForm
                    index={transactionIndex}
                    name={`approvalProposal.options.${optionIndex}.transactions`}
                  />
                </TransactionFormItem>
              )}
            </>
          );
        })}
      </div>
      <div className="flex flex-row space-x-2 w-full mt-6">
        <UpdatedButton
          isSubmit={false}
          type="secondary"
          className="flex-grow"
          onClick={() => {
            appendTransaction({
              type: TransactionType.TRANSFER,
              target: "" as EthereumAddress,
              value: "",
              calldata: "",
              description: "",
              simulation_state: "UNCONFIRMED",
              simulation_id: "",
            });
          }}
        >
          Add a transfer transaction
        </UpdatedButton>
        <UpdatedButton
          isSubmit={false}
          type="secondary"
          className="flex-grow"
          onClick={() => {
            appendTransaction({
              type: TransactionType.CUSTOM,
              target: "" as EthereumAddress,
              value: "",
              calldata: "",
              description: "",
              simulation_state: "UNCONFIRMED",
              simulation_id: "",
            });
          }}
        >
          Add a custom transaction
        </UpdatedButton>
      </div>
    </div>
  );
};

/**
 * Dev note:
 * I am deciding to take out simulation for approval type transactions.
 * To be honest, it feels too complex to warrent time effort right now.
 * In order to properly simulate transactions we would need to look at
 * threshold, top choices, etc and simulate every possible permutation of
 * choices to make sure no permuation is invalid. Simulating ALL of the
 * transactions sequentially doesn't make sense because that is not
 * guaranteed to happen. If we are going to simulate, we might as well
 * do it right, but doing it right at this time is too much work to justify.
 */
const TransactionFormItem = ({
  optionIndex,
  transactionIndex,
  remove,
  children,
}: {
  optionIndex: number;
  transactionIndex: number;
  remove: UseFieldArrayRemove;
  children: React.ReactNode;
}) => {
  const { register } = useFormContext<FormType>();

  return (
    <div className="">
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-agora-stone-900 font-semibold">
          Transaction #{transactionIndex + 1}
        </h2>
        <span
          className="text-red-500 text-sm hover:underline cursor-pointer"
          onClick={() => {
            remove(transactionIndex);
          }}
        >
          Remove
        </span>
      </div>
      {children}
      <input
        type="hidden"
        {...register(
          `approvalProposal.options.${optionIndex}.transactions.${transactionIndex}.simulation_state`
        )}
      />
      <input
        type="hidden"
        {...register(
          `approvalProposal.options.${optionIndex}.transactions.${transactionIndex}.simulation_id`
        )}
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
  });

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
        <NumberInput
          required={true}
          label="Budget"
          name="approvalProposal.budget"
          control={control}
          tooltip="This is the maximum number of tokens that can be transferred from all the options in this proposal."
        />

        <NumberInput
          required={true}
          label="Max options"
          name="approvalProposal.maxOptions"
          tooltip=" Determines up to how many options each voter may select."
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
            tooltip="This is the minimum number of votes an option must have to be considered a winner"
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
        <div className="mt-6 space-y-12">
          {options.map((_field, index) => {
            return (
              <div
                className="p-4 border border-agora-stone-100 rounded-lg"
                key={index}
              >
                <div className="flex flex-col mb-6">
                  <div className="flex flex-row justify-between mb-4">
                    <h2 className="text-agora-stone-900 font-semibold">
                      Option #{index + 1}
                    </h2>
                    <span
                      onClick={() => {
                        removeOption(index);
                      }}
                    >
                      <XCircleIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                    </span>
                  </div>
                  <OptionItem optionIndex={index} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-row space-x-2 w-full mt-6">
          <UpdatedButton
            isSubmit={false}
            type="secondary"
            className="flex-grow"
            onClick={() => {
              appendOption({
                title: "",
                transactions: [],
              });
            }}
          >
            Add option
          </UpdatedButton>
        </div>
      </div>
    </div>
  );
};

export default ApprovalProposalForm;
