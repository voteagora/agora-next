import { useState, useEffect } from "react";
import { z } from "zod";
import FormItem from "./form/FormItem";
import { TransactionType } from "./../types";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";
import { UpdatedButton } from "@/components/Button";
import { Button as MovingButton } from "@/components/MovingButton";
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayRemove,
  useWatch,
} from "react-hook-form";
import TransferTransactionForm from "./TransferTransactionForm";
import CustomTransactionForm from "./CustomTransactionForm";
import toast from "react-hot-toast";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import Link from "next/link";

enum Status {
  Unconfirmed = "Unconfirmed",
  Valid = "Valid",
  Invalid = "Invalid",
}

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

  const isValid = watch(`transactions.${index}.is_valid`);
  const simulationId = watch(`transactions.${index}.simulationId`);
  const status =
    isValid === "unconfirmed"
      ? Status.Unconfirmed
      : Boolean(isValid) == true
        ? Status.Valid
        : Status.Invalid;

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
          <span
            className={`relative border rounded-lg p-2 ${status === Status.Valid ? "bg-green-100 border-green-500 text-green-500" : "bg-red-100 border-red-500 text-red-500"}`}
          >
            {status}
            {simulationId && (
              <div className="absolute right-2 top-3 cursor-pointer">
                <Link
                  href={`https://tdly.co/shared/simulation/${simulationId}`}
                >
                  <Image
                    src={icons.link}
                    height="16"
                    width="16"
                    alt="link icon"
                  />
                </Link>
              </div>
            )}
          </span>
        </FormItem>
      </div>
      <input type="hidden" {...register(`transactions.${index}.is_valid`)} />
      <input
        type="hidden"
        {...register(`transactions.${index}.simulationId`)}
      />
    </div>
  );
};

const ExecutableProposalForm = () => {
  const [allTransactionFieldsValid, setAllTransactionFieldsValid] =
    useState(false);
  const [allTransactionsSimulated, setAllTransactionsSimulated] =
    useState(false);
  const [simulationPending, setSimulationPending] = useState(false);
  type FormType = z.output<typeof draftProposalSchema>;
  const { control, setValue, getValues, formState, trigger } =
    useFormContext<FormType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });

  const validateTransactionForms = async () => {
    const result = await trigger(["transactions"]);
    setAllTransactionFieldsValid(result);
  };

  const transactions = useWatch({
    control,
    name: "transactions", // Watch the entire field array
  });

  useEffect(() => {
    console.log(transactions);
    const allSimulated = transactions.every(
      (transaction: any) => transaction.is_valid === true
    );
    setAllTransactionsSimulated(allSimulated);
    validateTransactionForms();
  }, [transactions]);

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
          // TODO: update these two to be dynamic from tenant (chainId + governor address)
          // right now network is sepolia (for testing ENS)
          networkId: "11155111",
          // Michael's dev address -- replace with governor address
          from: "0xca1d77cd31ab0e7c53f8158959455d074894d4dd",
        }),
      });
      const res = await response.json();
      res.response.simulation_results.forEach((result: any, index: number) => {
        if (result.transaction.status) {
          setValue(`transactions.${index}.is_valid`, "true");
          setValue(`transactions.${index}.simulationId`, result.simulation.id);
        } else {
          setValue(`transactions.${index}.is_valid`, "false");
        }
      });
      setSimulationPending(false);
    } catch (e) {
      console.error(e);
      // should we invalidate the transactions? This doesn't mean they are invalid, could have some other issue.
      toast.error("Error simulating transactions");
      setSimulationPending(false);
    }
  };

  return (
    <div>
      <h3 className="text-stone-900 font-semibold">Proposed transactions</h3>
      <p className="mt-2 stone-700">
        Proposed transactions will execute after a proposal passes and then gets
        executed. If you skip this step, a transfer of 0 ETH to you (the
        proposer) will be added.
      </p>
      <div className="mt-6 space-y-12">
        {fields.map((field, index) => {
          return (
            <>
              {field.type === TransactionType.TRANSFER ? (
                <TransactionForm index={index} remove={remove}>
                  <TransferTransactionForm
                    index={index}
                    key={`transfer-${index}`}
                  />
                </TransactionForm>
              ) : (
                <TransactionForm index={index} remove={remove}>
                  <CustomTransactionForm
                    index={index}
                    key={`custom-${index}`}
                  />
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
            // <MovingButton
            //   borderRadius="0.75rem"
            //   className="bg-white text-black border-neutral-200 w-full"
            //   type="button"
            //   onClick={() => {
            //     simulateTransactions();
            //   }}
            // >
            //   Simulate transactions
            // </MovingButton>
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
              is_valid: "unconfirmed",
              simulationId: "",
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
              is_valid: "unconfirmed",
              simulationId: "",
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
