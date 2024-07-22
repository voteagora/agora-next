"use client";

import { Form } from "./CreateProposalForm";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { VStack } from "@/components/Layout/Stack";
import InputBox from "@/components/shared/InputBox";
import AddTransactionsDetails from "./AddTransactionsDetails";

export default function ApprovalOptionsRow({ form }: { form: Form }) {
  function addOption() {
    form.onChange.options([
      ...form.state.options,
      {
        title: "",
        transactions: [],
      },
    ]);
  }

  function update(index: number, next: Partial<Form["state"]["options"][0]>) {
    form.onChange.options(
      form.state.options.map((option, i) => {
        if (i === index) {
          return {
            ...option,
            ...next,
          };
        }
        return option;
      })
    );
  }

  function remove(index: number) {
    form.onChange.options(form.state.options.filter((_, i) => i !== index));
  }

  return (
    <>
      <h4 className="font-semibold pb-1">Proposed Options</h4>
      <p className="text-base text-secondary mb-4">
        Proposed transactions will execute if your proposal passes. If you skip
        this step no transactions will be added.
      </p>
      {form.state.options.map((_option, index) => (
        <VStack
          gap={4}
          key={index}
          className="border-box w-full p-4 mb-8 border border-line rounded-lg"
        >
          <div className="border-b border-dashed border-line font-semibold pb-1 flex flex-row justify-between">
            <span>Option {index + 1}</span>
            {form.state.options.length > 1 && (
              <XCircleIcon
                className="h-5 w-5 pointer text-line hover:text-secondary"
                onClick={() => remove(index)}
              />
            )}
          </div>
          <VStack>
            <label className="text-secondary font-semibold mb-1 text-xs">
              Title (no markdown)
            </label>
            <InputBox
              placeholder={"My option title"}
              value={form.state.options[index].title}
              onChange={(next) => update(index, { title: next })}
              required
            />
            <AddTransactionsDetails optionIndex={index} form={form} />
          </VStack>
        </VStack>
      ))}
      <div
        onClick={addOption}
        className="flex items-center w-full gap-2 p-4 border border-line cursor-pointer font-semibold shadow-newDefault"
      >
        <div className="h-8 w-8 flex items-center justify-center rounded-full shadow-newDefault bg-neutral border border-line">
          +
        </div>
        <div>Add option</div>
      </div>
    </>
  );
}
