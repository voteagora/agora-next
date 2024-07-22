"use client";

import { z } from "zod";
import Tenant from "@/lib/tenant/tenant";
import { useState, useEffect, useRef } from "react";
import FormItem from "./form/FormItem";
import { TransactionType } from "./../types";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";
import { UpdatedButton } from "@/components/Button";
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayRemove,
  useWatch,
} from "react-hook-form";
import TransferTransactionForm from "./TransferTransactionForm";
import CustomTransactionForm from "./CustomTransactionForm";
import toast from "react-hot-toast";
import SimulationStatusPill from "./SimulateStatusPill";

type FormType = z.output<typeof draftProposalSchema>;

// just the parts of the transaction that actually matter on-chain
const stringifyTransactionDetails = (transaction: any) => {
  return JSON.stringify({
    target: transaction.target,
    calldata: transaction.calldata,
    value: transaction.value,
  });
};

const TransactionForm = ({
  index,
  remove,
  children,
}: {
  index: number;
  remove: UseFieldArrayRemove;
  children: React.ReactNode;
}) => {
  const { register, watch } =
    useFormContext<z.output<typeof draftProposalSchema>>();

  const simulationState = watch(`transactions.${index}.simulation_state`);
  const simulationId = watch(`transactions.${index}.simulation_id`);

  return (
    <div className="p-4 border border-agora-stone-100 rounded-lg">
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-agora-stone-900 font-semibold">
          Transaction #{index + 1}
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
        <FormItem
          label="Validity"
          required={false}
          htmlFor={`transactions.${index}.description`}
        >
          <SimulationStatusPill
            status={simulationState}
            simulationId={simulationId}
          />
        </FormItem>
      </div>
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

const ExecutableProposalForm = () => {
  const { contracts } = Tenant.current();
  const [allTransactionFieldsValid, setAllTransactionFieldsValid] =
    useState(false);
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

  const validateTransactionForms = async () => {
    const result = await trigger(["transactions"]);
    setAllTransactionFieldsValid(result);
  };

  const transactions = useWatch({
    control,
    name: "transactions", // Watch the entire field array
  });

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      const parts = name?.split(".");
      if (parts?.length === 3) {
        const field = parts[2];
        const updatedTransactions = value.transactions;
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
              setValue(`transactions.${index}.simulation_state`, "UNCONFIRMED");
              // should we invalidate ID?
            } else {
              setValue(`transactions.${index}.simulation_state`, "VALID");
            }
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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
        } else {
          setValue(`transactions.${index}.simulation_state`, "INVALID");
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
    <div>
      <h3 className="text-primary font-semibold">Proposed transactions</h3>
      <p className="mt-2 stone-700">
        Proposed transactions will execute after a proposal passes and then gets
        executed.
      </p>
      <div className="mt-6 space-y-12">
        {fields.map((field, index) => {
          return (
            <>
              {field.type === TransactionType.TRANSFER ? (
                <TransactionForm
                  index={index}
                  remove={remove}
                  key={`transfer-${index}`}
                >
                  <TransferTransactionForm index={index} />
                </TransactionForm>
              ) : (
                <TransactionForm
                  index={index}
                  remove={remove}
                  key={`custom-${index}`}
                >
                  <CustomTransactionForm index={index} />
                </TransactionForm>
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
              target: "",
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
              target: "",
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

export default ExecutableProposalForm;
