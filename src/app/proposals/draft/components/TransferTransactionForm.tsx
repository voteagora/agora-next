"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
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
import { TIMELOCK_TYPE } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/shared/Switch";
import { TenantToken } from "@/lib/types";

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
  const {
    ui: { tokens },
    token,
    contracts,
  } = Tenant.current();
  const tokenToUse = tokens?.[0] || token;
  const { register, control, watch, setValue } = useFormContext<FormType>();
  const [useCustomToken, setUseCustomToken] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TenantToken>(tokenToUse);

  const recipient = watch(`${name}.${index}.recipient` as const);
  const amount = watch(`${name}.${index}.amount` as const);
  const customTokenAddress = watch(
    `${name}.${index}.customTokenAddress` as const
  );
  const decimals = useCustomToken ? 18 : selectedToken.decimals; // Default to 18 for custom tokens

  useEffect(() => {
    if (recipient && amount && isAddress(recipient)) {
      const targetAddress = useCustomToken
        ? customTokenAddress
        : selectedToken.address;

      if (!targetAddress || !isAddress(targetAddress)) return;

      const calldata = encodeFunctionData({
        abi: transferABI,
        functionName: "transfer",
        args: [
          recipient as `0x${string}`,
          BigInt(parseUnits(amount, Number(decimals))),
        ],
      });

      setValue(`${name}.${index}.calldata` as const, calldata);
      setValue(
        `${name}.${index}.target` as const,
        targetAddress as EthereumAddress
      );
      setValue(`${name}.${index}.value` as const, "0");
      setValue(
        `${name}.${index}.signature` as const,
        contracts.timelockType !== TIMELOCK_TYPE.TIMELOCK_NO_ACCESS_CONTROL
          ? "transfer(address,uint256)"
          : ""
      );
    }
  }, [
    recipient,
    amount,
    customTokenAddress,
    selectedToken,
    useCustomToken,
    setValue,
  ]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-3">
        <Switch
          onSelectionChanged={(value) =>
            setUseCustomToken(value === "Custom Token")
          }
          selection={useCustomToken ? "Custom Token" : "Predefined Token"}
          options={["Predefined Token", "Custom Token"]}
        />
      </div>
      {!useCustomToken && (
        <div className="col-span-3">
          {tokens && tokens.length > 1 ? (
            <Select
              value={selectedToken.address}
              onValueChange={(value) => {
                const token = tokens.find((t) => t.address === value);
                if (token) setSelectedToken(token);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    <div className="flex flex-col">
                      <span>{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {token.address}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex flex-col">
              <span>{token.symbol}</span>
              <span className="text-xs text-muted-foreground">
                {token.address}
              </span>
            </div>
          )}
        </div>
      )}

      {useCustomToken && (
        <div className="col-span-3">
          <AddressInput
            control={control}
            required={true}
            label="Custom Token Address"
            name={`${name}.${index}.customTokenAddress` as const}
          />
        </div>
      )}

      <div className="col-span-2">
        <AddressInput
          control={control}
          required={true}
          label="Recipient"
          name={`${name}.${index}.recipient` as const}
        />
      </div>

      <NumberInput
        control={control}
        required={true}
        label={`Amount (in ${useCustomToken ? "tokens" : selectedToken.symbol})`}
        name={`${name}.${index}.amount` as const}
        placeholder="100"
      />

      <div className="col-span-3">
        <TextInput
          label="Description"
          required={true}
          name={`${name}.${index}.description` as const}
          control={control}
          placeholder="What is this transaction all about?"
        />
      </div>

      {/* target and calldata are not included in UI of the form, but we need them for consistency */}
      <input type="hidden" {...register(`${name}.${index}.value` as const)} />
      <input type="hidden" {...register(`${name}.${index}.target` as const)} />
      <input
        type="hidden"
        {...register(`${name}.${index}.calldata` as const)}
      />
      <input
        type="hidden"
        {...register(`${name}.${index}.signature` as const)}
      />
    </div>
  );
};

export default TransferTransactionForm;
