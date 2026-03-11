import { useState, useMemo, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContractABI, ParsedFunction } from "@/lib/transaction-builder/types";
import { parseABI, encodeTransaction } from "@/lib/transaction-builder/abi";
import AddressInput from "@/app/proposals/draft/components/form/AddressInput";
import TextInput from "@/app/proposals/draft/components/form/TextInput";

interface ExplicitBuilderProps {
  onChange: (data: {
    target?: string;
    value?: string;
    calldata?: string;
    signature?: string;
  }) => void;
  index: number;
  name: string;
}

export function ExplicitBuilder({
  onChange,
  index,
  name,
}: ExplicitBuilderProps) {
  const { watch } = useFormContext();
  const target = watch(`${name}.${index}.target`);

  const [abiText, setAbiText] = useState("");
  const [selectedFuncSignature, setSelectedFuncSignature] = useState("");
  const [args, setArgs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Parse ABI input
  const contractABI: ContractABI = useMemo(() => {
    return parseABI(target, abiText);
  }, [target, abiText]);

  // Find selected function definition
  const selectedFunc = useMemo(() => {
    return contractABI.functions.find(
      (f) => f.signature === selectedFuncSignature
    );
  }, [contractABI, selectedFuncSignature]);

  // Update transaction data when function or args change
  useEffect(() => {
    if (!selectedFunc) return;

    try {
      const orderedArgs = selectedFunc.inputs.map((input, idx) => {
        const key = input.name || idx.toString();
        const val = args[key];
        if (val === undefined || val === "") throw new Error("Missing arg");
        return val;
      });

      if (orderedArgs.length !== selectedFunc.inputs.length) return;

      const calldata = encodeTransaction(
        selectedFunc.name,
        orderedArgs,
        contractABI.abi
      );

      setError(null);
      onChange({
        calldata,
        signature: selectedFunc.signature,
      });
    } catch (e) {
      setError("Invalid arguments");
    }
  }, [selectedFunc, args, contractABI.abi, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <AddressInput
            control={useFormContext().control}
            name={`${name}.${index}.target`}
            label="Contract Address"
            placeholder="0x..."
          />
        </div>
        <div className="col-span-1">
          <TextInput
            control={useFormContext().control}
            name={`${name}.${index}.value`}
            label="Value (ETH)"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-secondary">
          Contract ABI (JSON)
        </label>
        <textarea
          className="w-full text-xs font-mono p-2 h-24 border bg-wash border-line placeholder:text-tertiary text-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
          placeholder='[{"inputs":[],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
          value={abiText}
          onChange={(e) => setAbiText(e.target.value)}
        />
        <p className="text-xs text-secondary">
          Paste the ABI array here to load functions.
        </p>
      </div>

      {contractABI.functions.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-secondary">
            Function
          </label>
          <div className="relative">
            <Listbox
              value={selectedFuncSignature}
              onChange={setSelectedFuncSignature}
            >
              <Listbox.Button className="relative w-full cursor-default py-2 pl-3 pr-10 text-left border bg-wash border-line text-primary rounded-lg focus:outline-none focus-visible:border-indigo-500 sm:text-sm">
                <span className="block truncate">
                  {selectedFuncSignature || "Select a function"}
                </span>
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
                  {contractABI.functions.map((func) => (
                    <Listbox.Option
                      key={func.signature}
                      value={func.signature}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-amber-100 text-amber-900"
                            : "text-gray-900"
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                          >
                            {func.name}{" "}
                            <span className="text-gray-400 text-xs">
                              ({func.inputs.map((i) => i.type).join(",")})
                            </span>
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
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
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedFunc && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 bg-white border border-neutral-200 rounded-lg space-y-3"
          >
            <p className="text-sm font-medium border-b pb-2 mb-2">Arguments</p>
            {selectedFunc.inputs.map((input, idx) => {
              const key = input.name || idx.toString();
              return (
                <div key={idx} className="space-y-1">
                  <label className="text-xs font-semibold text-secondary">
                    {input.name || `Arg #${idx + 1}`}{" "}
                    <span className="text-gray-400 font-normal">
                      ({input.type})
                    </span>
                  </label>
                  <input
                    type="text"
                    className="border bg-wash border-line placeholder:text-tertiary text-primary p-2 rounded-lg w-full text-sm"
                    placeholder={input.type}
                    value={args[key] || ""}
                    onChange={(e) => {
                      setArgs((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }));
                    }}
                  />
                </div>
              );
            })}
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
