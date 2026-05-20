import { useState, useEffect, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import TextInput from "@/app/proposals/draft/components/form/TextInput";
import AddressInput from "@/app/proposals/draft/components/form/AddressInput";
import { parseABI, encodeTransaction } from "@/lib/transaction-builder/abi";

import { TransactionMacro } from "@/lib/transaction-builder/types";

// Pre-defined transaction macros
const MACROS: TransactionMacro[] = [
  {
    id: "transfer_eth",
    name: "Transfer ETH",
    description: "Send ETH to an address",
    args: [
      { name: "to", type: "address", label: "Recipient" },
      { name: "amount", type: "uint256", isValue: true, label: "Amount (ETH)" },
    ],
    generate: () => ({ target: "", value: "", calldata: "", signature: "" }),
  },
  {
    id: "transfer_erc20",
    name: "Transfer ERC20",
    description: "Send ERC20 tokens",

    abi: JSON.parse(
      '[{"inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]'
    ),
    funcName: "transfer",
    args: [
      {
        name: "token",
        type: "address",
        isTarget: true,
        label: "Token Address",
      },
      { name: "to", type: "address", label: "Recipient" },
      { name: "amount", type: "uint256", label: "Amount" },
    ],
    generate: () => ({ target: "", value: "", calldata: "", signature: "" }),
  },
];

interface SimpleBuilderProps {
  onChange: (data: {
    target?: string;
    value?: string;
    calldata?: string;
    signature?: string;
  }) => void;
  index: number;
  name: string;
}

export function SimpleBuilder({ onChange, index, name }: SimpleBuilderProps) {
  const [selectedMacroId, setSelectedMacroId] = useState(MACROS[0].id);
  const [args, setArgs] = useState<Record<string, string>>({});

  const selectedMacro = MACROS.find((m) => m.id === selectedMacroId)!;

  useEffect(() => {
    // Reset args when macro changes
    setArgs({});
  }, [selectedMacroId]);

  useEffect(() => {
    try {
      if (selectedMacro.id === "transfer_eth") {
        onChange({
          target: args["to"],
          value: args["amount"],
          calldata: "0x",
          signature: "",
        });
      } else if (selectedMacro.id === "transfer_erc20") {
        if (!args["token"] || !args["to"] || !args["amount"]) return;

        // ABI is already an object in our definition, no need to parse if it's already structured in types
        // However, in the MACRO definition above I permitted it to be string or array.
        // Actually, I typed it as `any[]` in types.ts.
        const abi = selectedMacro.abi;
        if (!abi) return;

        const calldata = encodeTransaction(
          selectedMacro.funcName!,
          [args["to"], args["amount"]],
          abi
        );

        onChange({
          target: args["token"],
          value: "0",
          calldata,
          signature: "transfer(address,uint256)",
        });
      }
    } catch (e) {
      // ignore invalid states
    }
  }, [selectedMacro, args, onChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-secondary">Action</label>
        <div className="relative">
          <Listbox value={selectedMacroId} onChange={setSelectedMacroId}>
            <Listbox.Button className="relative w-full cursor-default py-2 pl-3 pr-10 text-left border bg-wash border-line text-primary rounded-lg focus:outline-none focus-visible:border-indigo-500 sm:text-sm">
              <span className="block truncate">{selectedMacro.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {MACROS.map((macro) => (
                  <Listbox.Option
                    key={macro.id}
                    value={macro.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {macro.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </Listbox>
        </div>
        <p className="text-xs text-secondary">{selectedMacro.description}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMacroId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-4 bg-white border border-neutral-200 rounded-lg space-y-3"
        >
          {selectedMacro.args.map((arg, idx) => (
            <div key={idx} className="space-y-1">
              {/* Local inputs synced via onChange */}
              <label className="text-xs font-semibold text-secondary">
                {arg.label || arg.name}
              </label>
              <input
                type="text"
                className="border bg-wash border-line placeholder:text-tertiary text-primary p-2 rounded-lg w-full text-sm"
                placeholder={arg.type}
                value={args[arg.name] || ""}
                onChange={(e) =>
                  setArgs((prev) => ({ ...prev, [arg.name]: e.target.value }))
                }
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
