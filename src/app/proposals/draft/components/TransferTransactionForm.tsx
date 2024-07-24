"use client";
import { z } from "zod";
import { useEffect } from "react";
import { encodeFunctionData, isAddress, parseUnits } from "viem";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import NumberInput from "./form/NumberInput";
import AddressInput from "./form/AddressInput";
import { useFormContext } from "react-hook-form";
import { BasicProposalSchema } from "./../schemas/DraftProposalSchema";
import Tenant from "@/lib/tenant/tenant";
import { EthereumAddress } from "../types";

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

type FormType = z.output<typeof BasicProposalSchema>;

const TransferTransactionForm = ({ index }: { index: number }) => {
  const tenant = Tenant.current();
  const { register, control, watch, setValue } = useFormContext<FormType>();

  const recipient = watch(`transactions.${index}.recipient`);
  const amount = watch(`transactions.${index}.amount`);
  const decimals = tenant.token.decimals;

  useEffect(() => {
    if (recipient && amount && isAddress(recipient)) {
      // calc the calldata for transfer
      const calldata = encodeFunctionData({
        abi: transferABI,
        functionName: "transfer",
        args: [
          recipient as `0x${string}`,
          BigInt(parseUnits(amount, Number(decimals))),
        ],
      });

      setValue(`transactions.${index}.calldata`, calldata);
      setValue(
        `transactions.${index}.target`,
        tenant.contracts.governor.address as EthereumAddress
      );
      setValue(`transactions.${index}.value`, "0");
    }
  }, [recipient, amount, setValue]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2">
        <AddressInput
          control={control}
          label="Recipient"
          name={`transactions.${index}.recipient`}
        />
      </div>
      <NumberInput
        control={control}
        required={true}
        // TODO -- replace "ENS"
        label="Amount (in ENS tokens)"
        name={`transactions.${index}.amount`}
        placeholder="100"
      />
      <div className="col-span-3">
        <TextInput
          label="Description"
          name={`transactions.${index}.description`}
          control={control}
          placeholder="What is this transaction all about?"
        />
      </div>
      {/* target and calldata are not included in UI of the form, but we need them for consistency */}
      <input type="hidden" {...register(`transactions.${index}.value`)} />
      <input type="hidden" {...register(`transactions.${index}.target`)} />
      <input type="hidden" {...register(`transactions.${index}.calldata`)} />
    </div>
  );
};

export default TransferTransactionForm;
