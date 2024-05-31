"use client";
import { z } from "zod";
import { useEffect } from "react";
import { encodeFunctionData, isAddress, parseUnits } from "viem";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import { useFormContext } from "react-hook-form";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";

const transferABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

type FormType = z.output<typeof draftProposalSchema>;

const TransferTransactionForm = ({ index }: { index: number }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormType>();

  const recipient = watch(`transactions.${index}.recipient`);
  const amount = watch(`transactions.${index}.amount`);

  useEffect(() => {
    if (recipient && amount && isAddress(recipient)) {
      // calc the calldata for transfer
      const calldata = encodeFunctionData({
        abi: transferABI,
        functionName: "transfer",
        args: [recipient as `0x${string}`, BigInt(parseUnits(amount, 18))],
      });

      setValue(`transactions.${index}.calldata`, calldata);
      // TODO: replace with tenant governor address
      // right now it's ENS test address
      setValue(
        `transactions.${index}.target`,
        "0xca83e6932cf4F03cDd6238be0fFcF2fe97854f67"
      );
      setValue(`transactions.${index}.value`, "0");
    }
  }, [recipient, amount, setValue]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <FormItem
        label="Recipient"
        required={true}
        htmlFor={`transactions.${index}.recipient`}
        className="col-span-2"
      >
        <TextInput
          name={`transactions.${index}.recipient`}
          register={register}
          placeholder="0xabc..."
          options={{
            required: "Recipient is required.",
          }}
          errorMessage={errors.transactions?.[index]?.recipient?.message}
        />
      </FormItem>
      <FormItem
        label="Amount"
        required={true}
        htmlFor={`transactions.${index}.amount`}
      >
        <TextInput
          name={`transactions.${index}.amount`}
          register={register}
          placeholder="100"
          options={{
            required: "Amount is required.",
          }}
          errorMessage={errors.transactions?.[index]?.amount?.message}
        />
      </FormItem>
      <div className="col-span-3">
        <FormItem
          label="Description"
          required={true}
          htmlFor={`transactions.${index}.description`}
        >
          <TextInput
            name={`transactions.${index}.description`}
            register={register}
            placeholder="What is this transaction all about?"
            options={{
              required: "Description is required.",
            }}
            errorMessage={errors.transactions?.[index]?.description?.message}
          />
        </FormItem>
      </div>
      {/* target and calldata are not included in UI of the form, but we need them for consistency */}
      <input type="hidden" {...register(`transactions.${index}.value`)} />
      <input type="hidden" {...register(`transactions.${index}.target`)} />
      <input type="hidden" {...register(`transactions.${index}.calldata`)} />
    </div>
  );
};

export default TransferTransactionForm;
