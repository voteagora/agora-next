"use client";
import { z } from "zod";
import Tenant from "@/lib/tenant/tenant";
import { useState, useEffect, useRef, useCallback } from "react";
import { TransactionType, EthereumAddress } from "../types";
import { BasicProposalSchema } from "../schemas/DraftProposalSchema";
import { UpdatedButton } from "@/components/Button";
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayRemove,
} from "react-hook-form";
import TransferTransactionForm from "./TransferTransactionForm";
import CustomTransactionForm from "./CustomTransactionForm";
import toast from "react-hot-toast";

type FormType = z.output<typeof BasicProposalSchema>;

const TENDERLY_VALID_CHAINS = [
  1, 10, 11155111, 8453, 84532, 11155420, 59144, 59141,
];

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
  const { contracts } = Tenant.current();
  const { register, watch } = useFormContext<FormType>();

  const simulationState = watch(`transactions.${index}.simulation_state`);
  const simulationId = watch(`transactions.${index}.simulation_id`);

  return (
    <div className="p-4 border border-agora-stone-100 rounded-lg">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-row items-center space-x-2">
          <h2 className="text-agora-stone-900 font-semibold">
            Transaction #{index + 1}
          </h2>
          {TENDERLY_VALID_CHAINS.includes(contracts.governor.chain.id) &&
            (simulationState === "INVALID" ? (
              <a
                href={`https://tdly.co/shared/simulation/${simulationId}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="bg-red-100 text-red-500 rounded-lg px-2 py-1 text-xs font-semibold flex flex-row items-center space-x-1">
                  <span>Invalid</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-[1px]"
                  >
                    <path
                      d="M9 6.5V9.5C9 9.76522 8.89464 10.0196 8.70711 10.2071C8.51957 10.3946 8.26522 10.5 8 10.5H2.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5V4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H5.5M7.5 1.5H10.5M10.5 1.5V4.5M10.5 1.5L5 7"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            ) : simulationState === "UNCONFIRMED" ? (
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-xs font-semibold">
                <span>No simulation</span>
              </span>
            ) : (
              <span className="bg-green-100 text-green-500 px-2 py-1 rounded-lg text-xs font-semibold">
                Valid
              </span>
            ))}
        </div>
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
      <input
        type="hidden"
        {...register(`transactions.${index}.simulation_state`)}
      />
      <input
        type="hidden"
        {...register(`transactions.${index}.simulation_id`)}
      />
    </div>
  );
};

const BasicProposalForm = () => {
  const { contracts } = Tenant.current();
  const [formDirty, setFormDirty] = useState(false);
  const [allTransactionFieldsValid, setAllTransactionFieldsValid] =
    useState(true);
  const [simulationPending, setSimulationPending] = useState(false);

  const { control, setValue, getValues, formState, trigger, watch } =
    useFormContext<FormType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });

  /**
   * Keeping track of the current validated transaction block so we can compare
   * changes and encourage re-simulation if the user simulates then changes the
   * details of the transaction.
   */
  const currentlyValidatedTransactions = useRef<any[]>(
    formState.defaultValues?.transactions?.map((transaction) => {
      return stringifyTransactionDetails(transaction);
    }) || []
  );

  const validateTransactionForms = useCallback(async () => {
    const result = await trigger(["transactions"]);
    setAllTransactionFieldsValid(result);
  }, [trigger]);

  const updateSimulationState = useCallback(
    (index: number, transaction: any) => {
      const currentStringified = stringifyTransactionDetails(transaction);
      const previousStringified = currentlyValidatedTransactions.current[index];

      if (currentStringified !== previousStringified) {
        setValue(`transactions.${index}.simulation_state`, "UNCONFIRMED");
        setFormDirty(true);
      } else if (previousStringified) {
        setFormDirty(false);
        setValue(
          `transactions.${index}.simulation_state`,
          formState.defaultValues?.transactions?.[index]?.simulation_state!
        );
      }
    },
    [setValue]
  );

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name) return;

      const parts = name.split(".");
      if (parts.length === 3 && parts[0] === "transactions") {
        const index = parseInt(parts[1]);
        const field = parts[2];

        if (
          [
            "recipient",
            "amount",
            "value",
            "target",
            "description",
            "calldata",
          ].includes(field)
        ) {
          validateTransactionForms();
          const updatedTransactions = value.transactions;
          if (updatedTransactions && updatedTransactions[index]) {
            updateSimulationState(index, updatedTransactions[index]);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, validateTransactionForms, updateSimulationState]);

  const simulateTransactions = async () => {
    setSimulationPending(true);
    const transactions = getValues("transactions");

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
          setValue(`transactions.${index}.simulation_state`, "VALID");
          setValue(`transactions.${index}.simulation_id`, result.simulation.id);
          currentlyValidatedTransactions.current[index] =
            stringifyTransactionDetails(transactions[index]);
        } else {
          setValue(`transactions.${index}.simulation_state`, "INVALID");
          setValue(`transactions.${index}.simulation_id`, result.simulation.id);
        }
      });
    } catch (e) {
      toast.error("Error simulating transactions");
    } finally {
      setFormDirty(false);
      setSimulationPending(false);
    }
  };

  const allFieldsValid = fields.every(
    (field) => field.simulation_state === "VALID"
  );

  const isSimulationButtonEnabled =
    allTransactionFieldsValid && (formDirty || !allFieldsValid);

  return (
    <div>
      <h3 className="text-primary font-semibold">Proposed transactions</h3>
      <p className="mt-2 text-tertiary">
        Proposed transactions will execute after a proposal passes and then gets
        executed.
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
                  <TransferTransactionForm index={index} name="transactions" />
                </TransactionFormItem>
              ) : (
                <TransactionFormItem
                  index={index}
                  remove={remove}
                  key={`custom-${index}`}
                >
                  <CustomTransactionForm index={index} name="transactions" />
                </TransactionFormItem>
              )}
            </>
          );
        })}
      </div>
      {fields.length > 0 &&
        TENDERLY_VALID_CHAINS.includes(contracts.governor.chain.id) && (
          <div className="mt-6">
            <UpdatedButton
              isLoading={simulationPending}
              isSubmit={false}
              type={isSimulationButtonEnabled ? "secondary" : "disabled"}
              fullWidth={true}
              onClick={() => {
                if (isSimulationButtonEnabled) {
                  simulateTransactions();
                }
              }}
            >
              Simulate transactions
            </UpdatedButton>
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
  );
};

export default BasicProposalForm;
