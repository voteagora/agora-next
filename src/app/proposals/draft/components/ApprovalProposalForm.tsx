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
  ProposalScope,
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
import { encodeAbiParameters, parseEther } from "viem";
import { StructuredSimulationReport } from "@/lib/seatbelt/types";
import { checkNewApprovalProposal } from "@/lib/seatbelt/checkProposal";
import { StructuredReport } from "@/components/Simulation/StructuredReport";
type FormType = z.output<typeof ApprovalProposalSchema>;

const OptionItem = ({
  optionIndex,
  isOffchain,
}: {
  optionIndex: number;
  isOffchain: boolean;
}) => {
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
      {!isOffchain && (
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
      )}
    </div>
  );
};

const { contracts } = Tenant.current();

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
  const { register, watch } = useFormContext<FormType>();

  return (
    <div className="">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-row items-center space-x-2">
          <h2 className="text-secondary font-semibold">
            Transaction #{transactionIndex + 1}
          </h2>
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
  const proposal_scope = watch("proposal_scope");
  const [simulationReports, setSimulationReports] = useState<
    StructuredSimulationReport[]
  >([]);

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
      const totalNumOfOptions = optionsWatched.length;

      // Format all options for simulation
      const allOptions = optionsWatched.map((option) => {
        const targets: `0x${string}`[] = [];
        const values: bigint[] = [];
        const calldatas: `0x${string}`[] = [];
        let budgetTokensSpent = 0n;

        option.transactions.forEach((tx) => {
          if (tx.type === TransactionType.TRANSFER) {
            const amount = tx.amount || "0";
            budgetTokensSpent += BigInt(amount);
            targets.push(contracts.token.address as `0x${string}`);
            values.push(0n);
            calldatas.push(tx.calldata as `0x${string}`);
          } else {
            targets.push(tx.target as `0x${string}`);
            values.push(parseEther(tx.value || "0"));
            calldatas.push(tx.calldata as `0x${string}`);
          }
        });

        return {
          budgetTokensSpent,
          targets,
          values,
          calldatas,
          description: option.title,
        };
      });

      const maxOptions = getValues("approvalProposal.maxOptions");
      const criteria = getValues("approvalProposal.criteria");
      const budget = getValues("approvalProposal.budget");
      const threshold = getValues("approvalProposal.threshold");
      const topChoices = getValues("approvalProposal.topChoices");

      const settings = {
        maxApprovals: parseInt(maxOptions || "0"),
        criteria: criteria === "Threshold" ? 0 : 1,
        budgetToken:
          parseInt(budget || "0") > 0
            ? (contracts.token.address as `0x${string}`)
            : ("0x0000000000000000000000000000000000000000" as `0x${string}`),
        criteriaValue:
          criteria === "Threshold"
            ? BigInt(threshold?.toString() || "0")
            : BigInt(topChoices || "0"),
        budgetAmount: BigInt(budget?.toString() || "0"),
      };

      const unformattedProposalData = encodeAbiParameters(
        [
          {
            name: "proposalOptions",
            type: "tuple[]",
            components: [
              { name: "budgetTokensSpent", type: "uint256" },
              { name: "targets", type: "address[]" },
              { name: "values", type: "uint256[]" },
              { name: "calldatas", type: "bytes[]" },
              { name: "description", type: "string" },
            ],
          },
          {
            name: "proposalSettings",
            type: "tuple",
            components: [
              { name: "maxApprovals", type: "uint8" },
              { name: "criteria", type: "uint8" },
              { name: "budgetToken", type: "address" },
              { name: "criteriaValue", type: "uint128" },
              { name: "budgetAmount", type: "uint128" },
            ],
          },
        ],
        [allOptions, settings]
      );

      // Simulate each combination and collect results
      const simulationResults = await Promise.all(
        combinations.map(async (combination) => {
          const report = await checkNewApprovalProposal({
            unformattedProposalData,
            description: "Approval Proposal",
            draftId: "1",
            options: allOptions,
            settings,
            combination,
            totalNumOfOptions,
            title:
              "Simulation of options with index: " + combination?.join(", "),
          });

          return report?.structuredReport;
        })
      );

      setSimulationReports(
        simulationResults.filter(Boolean) as StructuredSimulationReport[]
      );

      const anyInvalid = simulationResults.some(
        (report: any) => report?.status === "error"
      );

      if (anyInvalid) {
        toast.error("Some simulations failed. Please check the results below.");
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      toast.error(
        <span className="break-all">{`Error simulating transactions: ${errorMessage}`}</span>
      );
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
        {proposal_scope !== ProposalScope.OFFCHAIN_ONLY && (
          <NumberInput
            required={false}
            label="Budget"
            name="approvalProposal.budget"
            control={control}
            tooltip="This is the maximum number of tokens that can be transferred from all the options in this proposal."
          />
        )}
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
        {criteria === ApprovalProposalType.THRESHOLD &&
          (proposal_scope === ProposalScope.ONCHAIN_ONLY ? (
            <NumberInput
              required={true}
              label="Threshold"
              name="approvalProposal.threshold"
              tooltip="This is the minimum number of votes an option must have to be considered a winner"
              control={control}
            />
          ) : (
            <NumberInput
              required={true}
              label="Threshold"
              name="approvalProposal.threshold"
              tooltip="This is the percentage an option must have to be considered a winner"
              control={control}
              customInput={
                <div className="flex-1 relative">
                  <input
                    value={
                      Number(watch("approvalProposal.threshold") || 0) / 100
                    }
                    placeholder="0"
                    onChange={(e) => {
                      const percentage = parseFloat(e.target.value);
                      if (
                        !isNaN(percentage) &&
                        percentage >= 0 &&
                        percentage <= 100
                      ) {
                        const internalValue = Math.round(percentage * 100);
                        setValue(
                          "approvalProposal.threshold",
                          internalValue.toString()
                        );
                      }
                    }}
                    className={`border bg-wash border-line placeholder:text-tertiary p-2 rounded-lg w-full text-primary pr-8 text-right`}
                    type="number"
                    min={0}
                    max={100}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
                    %
                  </span>
                </div>
              }
            />
          ))}
      </div>
      <div>
        <h3 className="text-secondary font-semibold">Proposed transactions</h3>
        {proposal_scope !== ProposalScope.OFFCHAIN_ONLY ? (
          <p className="mt-2 text-secondary">
            Proposed transactions will execute if your proposal passes. If you
            skip this step no transactions will be added.
          </p>
        ) : (
          <p className="mt-2 text-secondary">
            Options for an off-chain only proposal define choices for voters and
            will not execute on-chain transactions.
          </p>
        )}
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
                  <OptionItem
                    optionIndex={index}
                    isOffchain={proposal_scope === ProposalScope.OFFCHAIN_ONLY}
                  />
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
        proposal_scope !== ProposalScope.OFFCHAIN_ONLY &&
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
            {simulationPending && (
              <p className="mt-2 text-sm text-blue-600">
                Simulation in progress... This may take a few minutes.
              </p>
            )}
          </div>
        )}
      {simulationReports.length > 0 && (
        <div className="mt-6">
          <h3 className="text-secondary font-semibold">Simulation results</h3>
          <p className="mt-2 text-secondary">
            These are the results of the simulation for all possible winning
            combinations.
          </p>
          {simulationReports.map((report, index) => {
            return (
              <div className="my-4" key={index}>
                <h4 className="text-secondary font-semibold">{report.title}</h4>
                <StructuredReport report={report} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApprovalProposalForm;
