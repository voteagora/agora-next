import React, { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { ApprovalProposalSchema } from "./../schemas/DraftProposalSchema";
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayRemove,
} from "react-hook-form";
import NumberInput from "./form/NumberInput";
import SwitchInput from "./form/SwitchInput";
import { ApprovalProposalType } from "@/app/proposals/draft/types";
import SimulationStatusPill from "./SimulateStatusPill";
import { TransactionType, EthereumAddress } from "../types";
import TransferTransactionForm from "./TransferTransactionForm";
import CustomTransactionForm from "./CustomTransactionForm";
import { UpdatedButton } from "@/components/Button";
import Tenant from "@/lib/tenant/tenant";
import toast from "react-hot-toast";

type FormType = z.output<typeof ApprovalProposalSchema>;

// just the parts of the transaction that actually matter on-chain
const stringifyTransactionDetails = (transaction: any) => {
  return JSON.stringify({
    target: transaction.target,
    calldata: transaction.calldata,
    value: transaction.value,
  });
};

const TransactionFormItem = ({
  index,
  remove,
  children,
}: {
  index: number;
  remove: UseFieldArrayRemove;
  children: React.ReactNode;
}) => {
  const { register, watch } = useFormContext<FormType>();

  const simulationState = watch(
    `approvalProposal.options.${index}.simulation_state`
  );
  const simulationId = watch(`approvalProposal.options.${index}.simulation_id`);

  return (
    <div className="p-4 border border-agora-stone-100 rounded-lg">
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-agora-stone-900 font-semibold">
          Option #{index + 1}
        </h2>
        <span
          className="text-red-500 text-sm hover:underline cursor-pointer"
          onClick={() => {
            remove(index);
          }}
        >
          Remove
        </span>
      </div>
      {children}
      {/* simulate transaction and flip to true -- form should fail if not simulated */}
      <div className="col-span-2 mt-4 flex flex-row items-center space-x-3">
        <div className="flex flex-col w-full space-y-1">
          <label className="text-xs font-semibold text-agora-stone-700">
            Validity
          </label>
          <SimulationStatusPill
            status={simulationState}
            simulationId={simulationId}
          />
        </div>
      </div>
      <input
        type="hidden"
        {...register(`approvalProposal.options.${index}.simulation_state`)}
      />
      <input
        type="hidden"
        {...register(`approvalProposal.options.${index}.simulation_id`)}
      />
    </div>
  );
};

const ApprovalProposalForm = () => {
  const { contracts } = Tenant.current();
  const [allTransactionFieldsValid, setAllTransactionFieldsValid] =
    useState(false);
  const [simulationPending, setSimulationPending] = useState(false);
  const {
    control,
    watch,
    setValue,
    getValues,
    unregister,
    trigger,
    formState,
  } = useFormContext<FormType>();
  const criteria = watch("approvalProposal.criteria");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "approvalProposal.options",
  });

  const setApprovalProposalDefaults = () => {
    setValue("approvalProposal.criteria", ApprovalProposalType.THRESHOLD);
    setValue("approvalProposal.budget", "0");
    setValue("approvalProposal.maxOptions", "1");
    setValue("approvalProposal.threshold", "0");
    setValue("approvalProposal.topChoices", "0");
  };

  const removeApprovalProposalDefaults = () => {
    unregister("approvalProposal.budget");
    unregister("approvalProposal.maxOptions");
    unregister("approvalProposal.criteria");
    unregister("approvalProposal.threshold");
    unregister("approvalProposal.topChoices");
  };

  /**
   * Keeping track of the current validated transaction block so we can compare
   * changes and encourage re-simulation if the user simulates then changes the
   * details of the transaction.
   */
  const currentlyValidatedTransactions = useRef<any[]>(
    formState.defaultValues?.approvalProposal?.options?.map((transaction) => {
      return stringifyTransactionDetails(transaction);
    }) || []
  );

  const validateTransactionForms = async () => {
    const result = await trigger(["approvalProposal.options"]);
    setAllTransactionFieldsValid(result);
  };

  useEffect(() => {
    // only want to run these if we are in a fresh build -- if we are in edit mode we don't want to reset the values
    setApprovalProposalDefaults();
    return () => {
      removeApprovalProposalDefaults();
    };
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      const parts = name?.split(".");
      if (parts?.length === 4) {
        const field = parts[3];
        const updatedTransactions = value.approvalProposal?.options;
        if (
          field === "recipient" ||
          field === "amount" ||
          field === "value" ||
          field === "target" ||
          field === "description" ||
          field === "calldata"
        ) {
          validateTransactionForms();
          updatedTransactions?.forEach((transaction, index) => {
            if (
              currentlyValidatedTransactions.current[index] !==
              stringifyTransactionDetails(transaction)
            ) {
              setValue(
                `approvalProposal.options.${index}.simulation_state`,
                "UNCONFIRMED"
              );
              // should we invalidate ID?
            } else {
              setValue(
                `approvalProposal.options.${index}.simulation_state`,
                "VALID"
              );
            }
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const simulateTransactions = async () => {
    setSimulationPending(true);
    const transactions = getValues("approvalProposal.options");

    try {
      const response = await fetch("/api/simulate-bundle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions,
          networkId: contracts.governor.chain.id,
          from: contracts.governor.address,
        }),
      });
      const res = await response.json();
      res.response.simulation_results.forEach((result: any, index: number) => {
        if (result.transaction.status) {
          setValue(
            `approvalProposal.options.${index}.simulation_state`,
            "VALID"
          );
          setValue(
            `approvalProposal.options.${index}.simulation_id`,
            result.simulation.id
          );
        } else {
          setValue(
            `approvalProposal.options.${index}.simulation_state`,
            "INVALID"
          );
        }
      });
      setSimulationPending(false);
    } catch (e) {
      console.error(e);
      toast.error("Error simulating transactions");
      setSimulationPending(false);
    }
  };

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
        <div className="mt-6 space-y-12">
          {fields.map((field, index) => {
            return (
              <>
                {field.type === TransactionType.TRANSFER ? (
                  <TransactionFormItem
                    index={index}
                    remove={remove}
                    key={`transfer-${index}`}
                  >
                    <TransferTransactionForm
                      index={index}
                      name="approvalProposal.options"
                    />
                  </TransactionFormItem>
                ) : (
                  <TransactionFormItem
                    index={index}
                    remove={remove}
                    key={`custom-${index}`}
                  >
                    <CustomTransactionForm
                      index={index}
                      name="approvalProposal.options"
                    />
                  </TransactionFormItem>
                )}
              </>
            );
          })}
        </div>
        {fields.length > 0 && (
          <div className="mt-6">
            {!allTransactionFieldsValid ? (
              <UpdatedButton
                isLoading={simulationPending}
                isSubmit={false}
                type={"disabled"}
                fullWidth={true}
              >
                Simulate transactions
              </UpdatedButton>
            ) : (
              <UpdatedButton
                isLoading={simulationPending}
                isSubmit={false}
                type={"secondary"}
                fullWidth={true}
                onClick={() => {
                  simulateTransactions();
                }}
              >
                Simulate transactions
              </UpdatedButton>
            )}
          </div>
        )}
        <div className="flex flex-row space-x-2 w-full mt-6">
          <UpdatedButton
            isSubmit={false}
            type="secondary"
            className="flex-grow"
            onClick={() => {
              append({
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
            Transfer from the treasury
          </UpdatedButton>
          <UpdatedButton
            isSubmit={false}
            type="secondary"
            className="flex-grow"
            onClick={() => {
              append({
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
            Create a custom transaction
          </UpdatedButton>
        </div>
      </div>
    </div>
  );
};

export default ApprovalProposalForm;
