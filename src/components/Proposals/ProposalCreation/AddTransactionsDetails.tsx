"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
import { Form, Transaction } from "./CreateProposalForm";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { ethers } from "ethers";
import { PlusIcon } from "@heroicons/react/20/solid";
import InputBox from "@/components/shared/InputBox";
import { MultiButtons } from "@/components/shared/MultiButtons";
import SimulateTransaction from "@/components/shared/SimulateTransaction";
import { formatEther, parseUnits } from "viem";

export default function AddTransactionsDetails({
  form,
  optionIndex,
}: {
  form: Form;
  optionIndex: number;
}) {
  const addTransaction = (type: "Transfer" | "Custom") => {
    form.onChange.options(
      form.state.options.map((option, i) => {
        if (i === optionIndex) {
          return {
            ...option,
            transactions: [
              ...option.transactions,
              {
                type,
                target: "",
                value: 0,
                calldata: "",
                transferAmount: 0n,
                transferTo: "",
              },
            ],
          };
        }
        return option;
      })
    );
  };

  const update = (index: number, next: Partial<Transaction>) => {
    const transactions = [...form.state.options[optionIndex].transactions];
    transactions[index] = {
      ...transactions[index],
      ...next,
    };
    return form.state.options.map((option, i) => {
      if (i === optionIndex) {
        return {
          ...option,
          transactions,
        };
      }
      return option;
    });
  };

  const remove = (index: number) => {
    const transactions = [...form.state.options[optionIndex].transactions];
    transactions.splice(index, 1);
    form.onChange.options(
      form.state.options.map((option, i) => {
        if (i === optionIndex) {
          return {
            ...option,
            transactions,
          };
        }
        return option;
      })
    );
  };

  return (
    <>
      {form.state.options[optionIndex].transactions.length === 0 && (
        <MultiButtons
          buttonsProps={[
            [
              "Transfer tokens from the treasury",
              () => addTransaction("Transfer"),
            ],
            ["Custom transaction", () => addTransaction("Custom")],
          ]}
        />
      )}
      {form.state.options[optionIndex].transactions.map(
        (transaction, index) => (
          <VStack key={index} className="mt-4 w-full relative">
            <p className="font-bold mt-2 mb-4">Transaction {index + 1}</p>
            {transaction.type === "Transfer" && (
              <>
                <HStack className="w-full mb-4" gap={4}>
                  <VStack className="w-full">
                    <label className="text-xs text-tertiary font-semibold">
                      Transfer to
                    </label>
                    <InputBox
                      placeholder={"address (no ENS)"}
                      value={transaction.transferTo}
                      onChange={(next) =>
                        form.onChange.options(
                          update(index, { transferTo: next })
                        )
                      }
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                    />
                  </VStack>
                  <VStack className="w-full">
                    <label className="text-xs text-tertiary font-semibold">
                      Transfer amount requested (OP)
                    </label>
                    <InputBox
                      placeholder={"3 000 000 OP"}
                      value={formatEther(transaction.transferAmount)}
                      type="number"
                      onChange={(next) =>
                        form.onChange.options(
                          update(index, {
                            transferAmount: parseUnits(next, 18),
                          })
                        )
                      }
                      required
                      min={0}
                    />
                  </VStack>
                </HStack>
              </>
            )}
            {transaction.type === "Custom" && (
              <>
                <HStack className="w-full mb-4" gap={4}>
                  <VStack className="w-full">
                    <label className="text-xs text-tertiary font-semibold">
                      Target
                    </label>
                    <InputBox
                      placeholder={"address"}
                      value={transaction.target}
                      onChange={(next) =>
                        form.onChange.options(update(index, { target: next }))
                      }
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                    />
                  </VStack>
                  <VStack className="w-full">
                    <label className="text-xs text-tertiary font-semibold">
                      Value
                    </label>
                    <InputBox
                      placeholder={"uint256"}
                      value={transaction.value}
                      onChange={(next) =>
                        form.onChange.options(update(index, { value: next }))
                      }
                      type="number"
                      min={0}
                    />
                  </VStack>
                </HStack>
                <HStack className="w-full mb-4" gap={4}>
                  <VStack className="w-full">
                    <label className="text-xs text-tertiary font-semibold">
                      Calldata
                    </label>
                    <InputBox
                      placeholder={"bytes"}
                      value={transaction.calldata}
                      onChange={(next) =>
                        form.onChange.options(update(index, { calldata: next }))
                      }
                    />
                  </VStack>
                  <VStack className="w-full">
                    <label className="text-xs text-tertiary font-semibold">
                      Transaction Validity
                    </label>
                    <SimulateTransaction
                      target={transaction.target}
                      value={ethers.parseEther(
                        transaction.value.toString() || "0"
                      )}
                      calldata={transaction.calldata}
                    />
                  </VStack>
                </HStack>
              </>
            )}
            <XCircleIcon
              className="w-5 h-5 absolute right-0 top-[2px] cursor-pointer text-primary/30 hover:text-secondary"
              onClick={() => remove(index)}
            />
          </VStack>
        )
      )}
      {form.state.options[optionIndex].transactions.length !== 0 && (
        <VStack className="p-4 border border-line rounded-md bg-wash mt-4 relative">
          <p className="font-semibold pb-1 mb-0">
            Add another transaction to this option
          </p>
          <MultiButtons
            buttonsProps={[
              [
                "Transfer tokens from the treasury",
                () => addTransaction("Transfer"),
              ],
              ["Custom transaction", () => addTransaction("Custom")],
            ]}
          />
          <PlusIcon className="w-5 h-5 absolute top-4 right-4 text-primary/30" />
        </VStack>
      )}
    </>
  );
}
