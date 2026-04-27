import { useState } from "react";
import { useFormContext } from "react-hook-form";
import * as Tabs from "@radix-ui/react-tabs";
import { TransactionBuilderMode } from "@/lib/transaction-builder/types";
import { ExplicitBuilder } from "./ExplicitBuilder";
import { SimpleBuilder } from "./SimpleBuilder";
import TextInput from "@/app/proposals/draft/components/form/TextInput";
import AddressInput from "@/app/proposals/draft/components/form/AddressInput";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

interface TransactionBuilderProps {
  index: number;
  name: "transactions" | `approvalProposal.options.${number}.transactions`; // specific enough?
}

export function TransactionBuilder({ index, name }: TransactionBuilderProps) {
  const { control, setValue } = useFormContext();
  const [mode, setMode] = useState<TransactionBuilderMode>("simple");
  const { namespace } = Tenant.current();

  const handleTransactionChange = (data: {
    target?: string;
    value?: string;
    calldata?: string;
    signature?: string;
  }) => {
    if (data.target) setValue(`${name}.${index}.target`, data.target);
    if (data.value) setValue(`${name}.${index}.value`, data.value);
    if (data.calldata) setValue(`${name}.${index}.calldata`, data.calldata);
    if (data.signature) setValue(`${name}.${index}.signature`, data.signature);
  };

  return (
    <div className="w-full p-4 border rounded-lg bg-neutral-50 border-neutral-200">
      <Tabs.Root
        value={mode}
        onValueChange={(val) => setMode(val as TransactionBuilderMode)}
      >
        <div className="flex items-center justify-between mb-4 border-b border-neutral-200">
          <Tabs.List className="flex gap-4">
            <Tabs.Trigger
              value="simple"
              className={`pb-2 text-sm font-medium transition-colors ${
                mode === "simple"
                  ? "text-black border-b-2 border-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Simple
            </Tabs.Trigger>
            <Tabs.Trigger
              value="explicit"
              className={`pb-2 text-sm font-medium transition-colors ${
                mode === "explicit"
                  ? "text-black border-b-2 border-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Explicit
            </Tabs.Trigger>
            <Tabs.Trigger
              value="raw"
              className={`pb-2 text-sm font-medium transition-colors ${
                mode === "raw"
                  ? "text-black border-b-2 border-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Raw Input
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <Tabs.Content value="simple" className="space-y-4">
          <SimpleBuilder
            onChange={handleTransactionChange}
            index={index}
            name={name}
          />
        </Tabs.Content>

        <Tabs.Content value="explicit" className="space-y-4">
          <ExplicitBuilder
            onChange={handleTransactionChange}
            index={index}
            name={name}
          />
        </Tabs.Content>

        <Tabs.Content value="raw" className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <AddressInput
                control={control}
                label="Target"
                name={`${name}.${index}.target`}
              />
            </div>

            <TextInput
              label="Value"
              name={`${name}.${index}.value`}
              control={control}
              placeholder="0"
            />
            {/* Uni requires function signature */}
            {namespace === TENANT_NAMESPACES.UNISWAP && (
              <div className="col-span-3">
                <TextInput
                  label="Signature"
                  name={`${name}.${index}.signature`}
                  control={control}
                  placeholder="Example: transfer(address,uint256)"
                />
              </div>
            )}
            <div className="col-span-3">
              <TextInput
                label="Calldata"
                name={`${name}.${index}.calldata`}
                control={control}
                placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
              />
            </div>
            <div className="col-span-3">
              <TextInput
                label="Description"
                name={`${name}.${index}.description`}
                control={control}
                placeholder="What is this transaction all about?"
              />
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
