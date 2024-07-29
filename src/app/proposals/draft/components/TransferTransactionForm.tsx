"use client";

import { z } from "zod";
import { useEffect } from "react";
import { encodeFunctionData, isAddress, parseUnits } from "viem";
import TextInput from "./form/TextInput";
import NumberInput from "./form/NumberInput";
import AddressInput from "./form/AddressInput";
import { useFormContext } from "react-hook-form";
import {
  BasicProposalSchema,
  ApprovalProposalSchema,
} from "./../schemas/DraftProposalSchema";
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

type FormType =
  | z.output<typeof BasicProposalSchema>
  | z.output<typeof ApprovalProposalSchema>;

const TransferTransactionForm = ({
  index,
  name,
}: {
  index: number;
  name: "transactions" | `approvalProposal.options.${number}.transactions`;
}) => {
  const tenant = Tenant.current();
  const { register, control, watch, setValue } = useFormContext<FormType>();

  const recipient = watch(`${name}.${index}.recipient`);
  const amount = watch(`${name}.${index}.amount`);
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

      setValue(`${name}.${index}.calldata`, calldata);
      setValue(
        `${name}.${index}.target`,
        tenant.contracts.governor.address as EthereumAddress
      );
      setValue(`${name}.${index}.value`, "0");
    }
  }, [recipient, amount, setValue]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2">
        <AddressInput
          control={control}
          required={true}
          label="Recipient"
          name={`${name}.${index}.recipient`}
        />
      </div>
      <NumberInput
        control={control}
        required={true}
        label={`Amount (in ${tenant.token.symbol} tokens)`}
        name={`${name}.${index}.amount`}
        placeholder="100"
      />
      <div className="col-span-3">
        <TextInput
          label="Description"
          required={true}
          name={`${name}.${index}.description`}
          control={control}
          placeholder="What is this transaction all about?"
        />
      </div>
      {/* target and calldata are not included in UI of the form, but we need them for consistency */}
      <input type="hidden" {...register(`${name}.${index}.value`)} />
      <input type="hidden" {...register(`${name}.${index}.target`)} />
      <input type="hidden" {...register(`${name}.${index}.calldata`)} />
    </div>
  );
};

export default TransferTransactionForm;
