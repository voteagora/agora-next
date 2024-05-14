import { useEffect } from "react";
import { z } from "zod";
import { encodeFunctionData } from "viem";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import { useFormContext } from "react-hook-form";

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

type TransferFormType = {
  target: string;
  value: string;
  calldata: string;
  description: string;
  recipient: string;
  amount: string;
};
type FormType = {
  transactions: TransferFormType[];
};

const TransferTransactionForm = ({ index }: { index: number }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    getValues,
  } = useFormContext<FormType>();

  const recipient = watch(`transactions.${index}.recipient`);
  const amount = watch(`transactions.${index}.amount`);

  useEffect(() => {
    if (recipient && amount) {
      // calc the calldata for transfer
      const calldata = encodeFunctionData({
        abi: transferABI,
        functionName: "transfer",
        args: [recipient as `0x${string}`, BigInt(amount)],
      });

      setValue(`transactions.${index}.calldata`, calldata);
      // TODO: replace with tenant governor address
      // right now it's ENS test address
      setValue(
        `transactions.${index}.target`,
        "0xca83e6932cf4F03cDd6238be0fFcF2fe97854f67"
      );
    }
  }, [recipient, amount, setValue]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <FormItem
        label="Recipient"
        required={false}
        htmlFor={`transactions.${index}.recipient`}
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
        required={false}
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
      <div className="col-span-2">
        <FormItem
          label="Description"
          required={false}
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
      <input type="hidden" {...register(`transactions.${index}.target`)} />
      <input type="hidden" {...register(`transactions.${index}.calldata`)} />
    </div>
  );
};

export default TransferTransactionForm;
