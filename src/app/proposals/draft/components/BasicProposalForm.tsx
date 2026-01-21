"use client";
import { z } from "zod";
import Tenant from "@/lib/tenant/tenant";
import { useState, useEffect, useRef, useCallback } from "react";
import { TransactionType, EthereumAddress, ProposalScope } from "../types";
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
import { checkNewProposal } from "@/lib/seatbelt/checkProposal";
import { StructuredSimulationReport } from "@/lib/seatbelt/types";
import { StructuredReport } from "@/components/Simulation/StructuredReport";
import { TrashIcon } from "@heroicons/react/20/solid";

type FormType = z.output<typeof BasicProposalSchema>;

export const TENDERLY_VALID_CHAINS = [
  1, 11155111, 10, 11155420, 42161, 421614, 8453, 534352,
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
  return (
    <div className="p-4 border border-agora-stone-100 rounded-lg">
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-row items-center space-x-2">
          <h2 className="text-secondary font-semibold">
            Transaction #{index + 1}
          </h2>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors text-xs font-medium"
          onClick={() => {
            remove(index);
          }}
        >
          <TrashIcon className="w-4 h-4" />
          Remove
        </button>
      </div>
      {children}
    </div>
  );
};

const BasicProposalForm = () => {
  const { contracts } = Tenant.current();
  const [formDirty, setFormDirty] = useState(false);
  const [allTransactionFieldsValid, setAllTransactionFieldsValid] =
    useState(true);
  const [simulationPending, setSimulationPending] = useState(false);
  const [simulationReport, setSimulationReport] =
    useState<StructuredSimulationReport | null>(null);

  const { control, setValue, getValues, formState, trigger, watch } =
    useFormContext<FormType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
    rules: {
      validate: {
        validateOnlyOnSubmit: () => {
          return true;
        },
      },
    },
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
    (index: number, transactions: any) => {
      const currentStringified = transactions.map(stringifyTransactionDetails);
      const previousStringified = currentlyValidatedTransactions.current[index];

      if (
        JSON.stringify(currentStringified) !==
        JSON.stringify(previousStringified)
      ) {
        setValue(`simulation_state`, "UNCONFIRMED");
        setFormDirty(true);
      } else if (previousStringified) {
        setFormDirty(false);
        setValue(
          `simulation_state`,
          formState.defaultValues?.simulation_state!
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

        // skip if the transaction has not been simulated yet
        const simulationState = value.simulation_state;
        if (simulationState !== "CONFIRMED") {
          return;
        }

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
          if (updatedTransactions) {
            updateSimulationState(index, updatedTransactions);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, validateTransactionForms, updateSimulationState]);

  const simulateTransactions = async () => {
    const isValid = await trigger("transactions");
    if (!isValid) return;

    setSimulationPending(true);
    const transactions = getValues("transactions");

    try {
      const report = await checkNewProposal({
        targets: transactions.map((transaction) => transaction.target),
        values: transactions.map((transaction) => BigInt(transaction.value)),
        calldatas: transactions.map((transaction) => transaction.calldata),
        signatures: transactions.map(
          (transaction) => transaction.signature || ""
        ),
        draftId: "1", // todo use correct draft id => used for storing simulation results
        title: getValues("title"),
      });

      setSimulationReport(report?.structuredReport ?? null);
      setValue("simulation_state", report?.status ?? "UNCONFIRMED");
      setValue(
        "simulation_id",
        report?.structuredReport.simulation.simulation.id ?? ""
      );
      currentlyValidatedTransactions.current = transactions.map(
        stringifyTransactionDetails
      );
    } catch (e) {
      console.error(e);
      toast.error(
        <span className="break-all">{`Error simulating transactions: ${e}`}</span>
      );
    } finally {
      setFormDirty(false);
      setSimulationPending(false);
    }
  };

  const allFieldsValid = fields.every(
    (field) => field.simulation_state === "success"
  );

  const isSimulationButtonEnabled =
    allTransactionFieldsValid && (formDirty || !allFieldsValid);

  const proposal_scope = watch("proposal_scope");

  return (
    <div>
      <h3 className="text-primary font-semibold">Proposed transactions</h3>
      {proposal_scope !== ProposalScope.OFFCHAIN_ONLY ? (
        <p className="mt-2 text-tertiary">
          Proposed transactions will execute after a proposal passes and then
          gets executed.
        </p>
      ) : (
        <p className="mt-2 text-tertiary">
          This is an off-chain only proposal and will not execute on-chain
          transactions.
        </p>
      )}

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
        proposal_scope !== ProposalScope.OFFCHAIN_ONLY &&
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
      {proposal_scope !== ProposalScope.OFFCHAIN_ONLY && (
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
      )}
      <div className="mt-6">
        {simulationReport && <StructuredReport report={simulationReport} />}
      </div>
    </div>
  );
};

export default BasicProposalForm;
