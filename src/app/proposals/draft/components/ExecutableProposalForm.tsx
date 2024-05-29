import Tenant from "@/lib/tenant/tenant";
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
import { cn } from "@/lib/utils";

const SimulationStatusPill = ({
  status,
  simulationId,
}: {
  status: string;
  simulationId: string | null;
}) => {
  return (
    <span
      className={cn(
        "relative border rounded-lg p-2",
        status === "UNCONFIRMED" &&
          "bg-yellow-100 border-yellow-500 text-yellow-500",
        status === "VALID" && "bg-green-100 border-green-500 text-green-500",
        status === "INVALID" && "bg-red-100 border-red-500 text-red-500"
      )}
    >
      {status}
      {simulationId && (
        <div className="absolute right-2 top-3 cursor-pointer">
          <Link href={`https://tdly.co/shared/simulation/${simulationId}`}>
            <Image src={icons.link} height="16" width="16" alt="link icon" />
          </Link>
        </div>
      )}
    </span>
  );
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
        executed.
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
