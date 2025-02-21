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
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import Tenant from "@/lib/tenant/tenant";
import { TENDERLY_VALID_CHAINS } from "./BasicProposalForm";

type FormType = z.output<typeof ApprovalProposalSchema>;

const OptionItem = ({ optionIndex }: { optionIndex: number }) => {
  const { control } = useFormContext<FormType>();

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
  const { contracts } = Tenant.current();
  const { register, watch } = useFormContext<FormType>();

  const simulationState = watch(
    `approvalProposal.options.${optionIndex}.transactions.${transactionIndex}.simulation_state`
  );
  const simulationId = watch(
    `approvalProposal.options.${optionIndex}.transactions.${transactionIndex}.simulation_id`
  );

  return (
    <div className="">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-row items-center space-x-2">
          <h2 className="text-secondary font-semibold">
            Transaction #{transactionIndex + 1}
          </h2>
          {TENDERLY_VALID_CHAINS.includes(contracts.governor.chain.id) &&
            (simulationState === "INVALID" ? (
              <a
                href={`https://dashboard.tenderly.co/shared/simulation/${simulationId}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="bg-red-100 text-negative rounded-lg px-2 py-1 text-xs font-semibold">
                  Invalid
                </span>
              </a>
            ) : simulationState === "UNCONFIRMED" ? (
              <span className="bg-gray-100 text-tertiary px-2 py-1 rounded-lg text-xs font-semibold">
                No simulation
              </span>
            ) : (
              <a
                href={`https://dashboard.tenderly.co/shared/simulation/${simulationId}`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-100 text-positive px-2 py-1 rounded-lg text-xs font-semibold"
              >
                Valid
              </a>
            ))}
        </div>
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
    getValues,
    formState: { defaultValues },
  } = useFormContext<FormType>();
  const [simulationPending, setSimulationPending] = useState(false);
  const criteria = watch("approvalProposal.criteria");
  const topChoices = watch("approvalProposal.topChoices");
  const optionsWatched = watch("approvalProposal.options");

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
        validateOnlyOnSubmit: (value) => {
          return true;
        },
      },
    },
  });

  // Helper to generate all possible winning combinations
  const generateWinningCombinations = useCallback(() => {
    if (!optionsWatched?.length) return [];

    const combinations: number[][] = [];

    if (criteria === ApprovalProposalType.THRESHOLD) {
      // For threshold, we need to test:
      // 1. All options passing threshold
      // 2. Each possible subset of options passing threshold
      const indices = optionsWatched.map((_, i) => i);

      for (let k = 1; k <= indices.length; k++) {
        const getCombinations = (arr: number[], k: number): number[][] => {
          if (k === 0) return [[]];
          if (arr.length === 0) return [];

          const first = arr[0];
          const rest = arr.slice(1);

          const combsWithFirst = getCombinations(rest, k - 1).map((comb) => [
            first,
            ...comb,
          ]);
          const combsWithoutFirst = getCombinations(rest, k);

          return [...combsWithFirst, ...combsWithoutFirst];
        };

        combinations.push(...getCombinations(indices, k));
      }
    } else if (criteria === ApprovalProposalType.TOP_CHOICES) {
      // For top choices, we only need to test the exact number of winning options
      if (!topChoices) return [];

      const indices = optionsWatched.map((_, i) => i);
      const numTopChoices = parseInt(topChoices as string, 10);

      if (isNaN(numTopChoices)) return [];

      const getCombinations = (arr: number[], k: number): number[][] => {
        if (k === 0) return [[]];
        if (arr.length === 0) return [];

        const first = arr[0];
        const rest = arr.slice(1);

        const combsWithFirst = getCombinations(rest, k - 1).map((comb) => [
          first,
          ...comb,
        ]);
        const combsWithoutFirst = getCombinations(rest, k);

        return [...combsWithFirst, ...combsWithoutFirst];
      };

      combinations.push(...getCombinations(indices, numTopChoices));
    }

    return combinations;
  }, [criteria, optionsWatched, topChoices]);

  const simulateAllPossibleCombinations = async () => {
    setSimulationPending(true);
    const combinations = generateWinningCombinations();

    try {
      // Reset all simulation states
      optionsWatched.forEach((option, optionIndex) => {
        option.transactions.forEach((_, transactionIndex) => {
          setValue(
            `approvalProposal.options.${optionIndex}.transactions.${transactionIndex}.simulation_state`,
            "UNCONFIRMED"
          );
        });
      });

      // Simulate each combination and collect results
      const simulationResults = await Promise.all(
        combinations.map(async (combination) => {
          const transactionsToSimulate = combination.flatMap((optionIndex) =>
            optionsWatched[optionIndex].transactions.map(
              (tx, transactionIndex) => ({
                ...tx,
                optionIndex,
                transactionIndex,
              })
            )
          );

          const response = await fetch("/api/simulate-bundle", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transactions: transactionsToSimulate,
              networkId: Tenant.current().contracts.governor.chain.id,
              from: Tenant.current().contracts.timelock!.address,
            }),
          });

          const res = await response.json();
          return { combination, results: res.response.simulation_results };
        })
      );

      // Process all results and update states
      optionsWatched.forEach((option, optionIndex) => {
        option.transactions.forEach((_, transactionIndex) => {
          let isValid = true;
          const lastSimulationResult =
            simulationResults[simulationResults.length - 1];
          const simulationId =
            lastSimulationResult.results[
              lastSimulationResult.results.length - 1
            ]?.simulation.id;

          // Check if this transaction is invalid in any winning combination
          for (const { combination, results } of simulationResults) {
            if (combination.includes(optionIndex)) {
              const hasFailure = results.findIndex(
                (result: any) => !result.transaction.status
              );

              if (hasFailure !== -1) {
                isValid = false;
              }
            }
          }

          setValue(
            `approvalProposal.options.${optionIndex}.transactions.${transactionIndex}.simulation_state`,
            isValid ? "VALID" : "INVALID"
          );
          setValue(
            `approvalProposal.options.${optionIndex}.transactions.${transactionIndex}.simulation_id`,
            simulationId
          );
        });
      });
    } catch (e) {
      console.error(e);
      toast.error("Error simulating transactions");
    } finally {
      setSimulationPending(false);
    }
  };

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
        <h3 className="text-secondary font-semibold">Proposed transactions</h3>
        <p className="mt-2 text-secondary">
          Proposed transactions will execute if your proposal passes. If you
          skip this step no transactions will be added.
        </p>
        <div className="mt-6 space-y-12">
          {options.map((field, index) => {
            return (
              <div
                className="p-4 border border-agora-stone-100 rounded-lg"
                key={field.id}
              >
                <div className="flex flex-col mb-6">
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
      {options?.length > 0 &&
        TENDERLY_VALID_CHAINS.includes(
          Tenant.current().contracts.governor.chain.id
        ) && (
          <div className="mt-6">
            <UpdatedButton
              isLoading={simulationPending}
              isSubmit={false}
              type="secondary"
              fullWidth={true}
              onClick={simulateAllPossibleCombinations}
            >
              Simulate all possible winning combinations
            </UpdatedButton>
            <p className="mt-2 text-sm text-tertiary">
              This will simulate all possible combinations of winning options
              based on your selected criteria.
              {criteria === ApprovalProposalType.THRESHOLD
                ? " All options that meet the threshold could potentially win together."
                : " The top choices will be executed together."}
            </p>
          </div>
        )}
    </div>
  );
};

export default ApprovalProposalForm;
