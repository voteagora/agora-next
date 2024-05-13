import { z } from "zod";
import FormItem from "./form/FormItem";
import TextInput from "./form/TextInput";
import { TransactionType } from "./../types";
import { schema as draftProposalSchema } from "./../schemas/DraftProposalSchema";
import { UpdatedButton } from "@/components/Button";
import { useFormContext, useFieldArray } from "react-hook-form";

const ExecutableProposalForm = () => {
  type FormType = z.output<typeof draftProposalSchema>;
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<FormType>();

  const { fields, append } = useFieldArray({
    control,
    name: "transactions",
  });

  return (
    <div>
      <h3 className="text-stone-900 font-semibold">Proposed transactions</h3>
      <p className="mt-2 stone-700">
        Proposed transactions will execute after a proposal passes and then gets
        executed. If you skip this step, a transfer of 0 ETH to you (the
        proposer) will be added.
      </p>
      <div className="mt-6 space-y-12">
        {fields.map((field, index) => {
          return (
            <>
              {field.type === "TRANSFER" ? (
                <div
                  className="grid grid-cols-2 gap-3"
                  key={`transfer-${index}`}
                >
                  <FormItem
                    label="Recipient"
                    required={false}
                    htmlFor={`transactions.${index}.target`}
                  >
                    <TextInput
                      name={`transactions.${index}.target`}
                      register={register}
                      placeholder="0xabc..."
                      options={{
                        required: "Recipient is required.",
                      }}
                      errorMessage={
                        errors.transactions?.[index]?.target?.message
                      }
                    />
                  </FormItem>
                  <FormItem
                    label="Amount"
                    required={false}
                    htmlFor={`transactions.${index}.value`}
                  >
                    <TextInput
                      name={`transactions.${index}.value`}
                      register={register}
                      placeholder="100"
                      options={{
                        required: "Amount is required.",
                      }}
                      errorMessage={
                        errors.transactions?.[index]?.value?.message
                      }
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
                        errorMessage={
                          errors.transactions?.[index]?.description?.message
                        }
                      />
                    </FormItem>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3" key={`custom-${index}`}>
                  <FormItem
                    label="Target"
                    required={false}
                    htmlFor={`transactions.${index}.target`}
                  >
                    <TextInput
                      name={`transactions.${index}.target`}
                      register={register}
                      placeholder="0xabc"
                      options={{
                        required: "Amount is required.",
                      }}
                      errorMessage={
                        errors.transactions?.[index]?.target?.message
                      }
                    />
                  </FormItem>
                  <FormItem
                    label="Value"
                    required={false}
                    htmlFor={`transactions.${index}.value`}
                  >
                    <TextInput
                      name={`transactions.${index}.value`}
                      register={register}
                      placeholder="10"
                      options={{
                        required: "Value is required.",
                      }}
                      errorMessage={
                        errors.transactions?.[index]?.value?.message
                      }
                    />
                  </FormItem>
                  <FormItem
                    label="Signature"
                    required={false}
                    htmlFor={`transactions.${index}.signature`}
                  >
                    <TextInput
                      name={`transactions.${index}.signature`}
                      register={register}
                      placeholder=""
                      options={{
                        required: "Signature is required.",
                      }}
                      errorMessage={
                        errors.transactions?.[index]?.signature?.message
                      }
                    />
                  </FormItem>
                  <FormItem
                    label="Calldata"
                    required={false}
                    htmlFor={`transactions.${index}.calldata`}
                  >
                    <TextInput
                      name={`transactions.${index}.calldata`}
                      register={register}
                      placeholder=""
                      options={{
                        required: "Calldata is required.",
                      }}
                      errorMessage={
                        errors.transactions?.[index]?.calldata?.message
                      }
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
                        errorMessage={
                          errors.transactions?.[index]?.description?.message
                        }
                      />
                    </FormItem>
                  </div>
                </div>
              )}
            </>
          );
        })}
      </div>
      <div className="flex flex-row space-x-2 w-full mt-6">
        <UpdatedButton
          isSubmit={false}
          type="secondary"
          className="flex-grow"
          onClick={() => {
            append({
              type: TransactionType.TRANSFER,
              target: "0x",
              value: "0",
              calldata: "0x",
              signature: "",
              description: "",
            });
          }}
        >
          Transfer from the treasury
        </UpdatedButton>
        <UpdatedButton
          isSubmit={false}
          type="secondary"
          className="flex-grow"
          onClick={() => {
            append({
              type: TransactionType.CUSTOM,
              target: "0x",
              value: "0",
              calldata: "0x",
              signature: "",
              description: "",
            });
          }}
        >
          Create a custom transaction
        </UpdatedButton>
      </div>
    </div>
  );
};

export default ExecutableProposalForm;
