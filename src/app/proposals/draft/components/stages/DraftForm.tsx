"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import FormCard from "../form/FormCard";
import FormItem from "../form/FormItem";
import TextInput from "../form/TextInput";
import MarkdownTextareaInput from "../form/MarkdownTextareaInput";
import RadioGroupInput from "../form/RadioGroupInput";
import { UpdatedButton } from "@/components/Button";
import { schema as draftProposalSchema } from "../../schemas/DraftProposalSchema";
import { onSubmitAction as draftProposalAction } from "../../actions/createDraftProposal";
import { ProposalType, TransactionType } from "../../types";
import { ProposalDraft } from "@prisma/client";

const DraftForm = ({ draftProposal }: { draftProposal: ProposalDraft }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.output<typeof draftProposalSchema>>({
    resolver: zodResolver(draftProposalSchema),
  });

  const { fields, append } = useFieldArray({
    control,
    name: "transactions",
  });

  const onSubmit = async (data: Record<string, any>) => {
    await draftProposalAction(data);
  };

  return (
    <form
      action={async (formData: FormData) => {
        /**
         * @TODO
         * Need to figure out how to get react-hook-form to actually create form elements
         * so it can be used without javascript... the problem is that checkbox + editor
         * do not work since they rely on react-hook-form "controller" so its not sending
         * The full form data to the server.
         */
        // const data = Object.fromEntries(formData);
        // await formAction(formData);
      }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormCard>
        <FormCard.Section>
          <div className="flex flex-col space-y-6">
            <FormItem label="Type" required={true} htmlFor="type">
              <RadioGroupInput
                name="type"
                control={control}
                options={Object.values(
                  draftProposalSchema.shape.type._def.values
                ).map((value) => {
                  return { label: value, value: value } as any;
                })}
              />
            </FormItem>
            <FormItem label="Title" required={true} htmlFor="title">
              <TextInput
                name="title"
                register={register}
                placeholder="[1.1]"
                options={{
                  required: "Title is required.",
                  // pattern: {
                  //   value: VALID_URL_REGEX,
                  //   message: "Invalid URL.",
                  // },
                }}
                errorMessage={errors.title?.message}
              />
            </FormItem>
            <FormItem label="Description" required={true} htmlFor="description">
              <TextInput
                name="description"
                register={register}
                placeholder="Description"
                options={{
                  required: "Description is required.",
                  // pattern: {
                  //   value: VALID_URL_REGEX,
                  //   message: "Invalid URL.",
                  // },
                }}
                errorMessage={errors.description?.message}
              />
            </FormItem>
            <FormItem label="Abstract" required={true} htmlFor="abstract">
              <MarkdownTextareaInput name="abstract" control={control} />
            </FormItem>
          </div>
        </FormCard.Section>
        <FormCard.Section>
          <h3 className="text-stone-900 font-semibold">
            Proposed transactions
          </h3>
          <p className="mt-2 stone-700">
            Proposed transactions will execute after a proposal passes and then
            gets executed. If you skip this step, a transfer of 0 ETH to you
            (the proposer) will be added.
          </p>
          <div className="space-y-6">
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
                    </div>
                  ) : (
                    <div
                      className="grid grid-cols-2 gap-3"
                      key={`custom-${index}`}
                    >
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
                });
              }}
            >
              Create a custom transaction
            </UpdatedButton>
          </div>
        </FormCard.Section>
        <FormCard.Section>
          <h3 className="text-stone-900 font-semibold">
            Transaction payload audit
          </h3>
          <p className="mt-2 stone-700">
            Use this field to upload an optional audit report for your
            transaction payload. This can help voters verify that your proposal
            does what it intends to.
          </p>
        </FormCard.Section>
        <FormCard.Section>
          <UpdatedButton type="secondary" isSubmit={true}>
            Submit
          </UpdatedButton>
        </FormCard.Section>
        <FormCard.Footer>
          <span className="text-xs font-semibold text-stone-500 mb-1">
            Both of these are required. Please uncheck only if you've already
            completed these manually.
          </span>
          <div className="flex flex-row space-x-2 items-center mt-2">
            <span>Update ENS docs</span>
            <span className="flex-grow border-b h-1 border-dotted"></span>
            <input
              {...register("docs_updated")}
              type="checkbox"
              className="rounded text-stone-900"
            />
          </div>
        </FormCard.Footer>
      </FormCard>
    </form>
  );
};

export default DraftForm;
