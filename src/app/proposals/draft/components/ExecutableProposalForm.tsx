import { useState } from "react";
import { z } from "zod";
import FormItem from "./form/FormItem";
import { TransactionType } from "./../types";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";
import { UpdatedButton } from "@/components/Button";
import {
  useFormContext,
  useFieldArray,
  UseFieldArrayRemove,
} from "react-hook-form";
import TransferTransactionForm from "./TransferTransactionForm";
import CustomTransactionForm from "./CustomTransactionForm";

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
  const [status, setStatus] = useState<Status>(Status.Unconfirmed);
  const {
    register,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext();

  const simulateTransaction = async () => {
    const transactions = getValues("transactions");
    const transaction = transactions[index];

    // todo: validate target is address and all other fields etc

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: transaction.target,
          value: transaction.value,
          calldata: transaction.calldata,
          // todo: update these two to be dynamic from tenant (chainId + governor address)
          // right now network is sepolia (for testing ENS)
          networkId: 11155111,
          // Michael's dev address
          from: "0xca1d77cd31ab0e7c53f8158959455d074894d4dd",
        }),
      });
      const res = await response.json();
      if (res.response.transaction.status) {
        setStatus(Status.Valid);
        setValue(`transactions.${index}.isValid`, "true");
      } else {
        setStatus(Status.Invalid);
      }
    } catch (e) {
      setStatus(Status.Invalid);
    }
  };

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
            className={`border rounded-lg p-2 ${status === Status.Valid ? "bg-green-100 border-green-500 text-green-500" : "bg-red-100 border-red-500 text-red-500"}`}
          >
            {status}
          </span>
        </FormItem>
        <UpdatedButton
          type="secondary"
          onClick={() => simulateTransaction()}
          className="self-end"
          isSubmit={false}
        >
          Simulate
        </UpdatedButton>
      </div>
      <input type="hidden" {...register(`transactions.${index}.isValid`)} />
    </div>
  );
};

const ExecutableProposalForm = () => {
  type FormType = z.output<typeof draftProposalSchema>;
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });

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
              isValid: "false",
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
              isValid: "false",
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
