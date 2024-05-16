"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import FormCard from "../form/FormCard";
import FormItem from "../form/FormItem";
import TextInput from "../form/TextInput";
import MarkdownTextareaInput from "../form/MarkdownTextareaInput";
import RadioGroupInput from "../form/RadioGroupInput";
import { UpdatedButton } from "@/components/Button";
import { schema as draftProposalSchema } from "../../schemas/DraftProposalSchema";
import { onSubmitAction as draftProposalAction } from "../../actions/createDraftProposal";
import { ProposalType, SocialProposalType } from "../../types";
import {
  ProposalDraft,
  ProposalSocialOption,
  ProposalDraftTransaction,
} from "@prisma/client";
import ExecutableProposalForm from "../ExecutableProposalForm";
import SocialProposalForm from "../SocialProposalForm";
import FileInput from "../form/FileInput";
import toast from "react-hot-toast";

const DraftForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const methods = useForm<z.output<typeof draftProposalSchema>>({
    resolver: zodResolver(draftProposalSchema),
    defaultValues: {
      type: (draftProposal.proposal_type ||
        ProposalType.EXECUTABLE) as ProposalType,
      title: draftProposal.title,
      description: draftProposal.description,
      abstract: draftProposal.abstract,
      transactions: draftProposal.transactions || [],
      socialProposal: {
        type: (draftProposal.proposal_social_type ||
          SocialProposalType.BASIC) as SocialProposalType,
        start_date: draftProposal.start_date_social || undefined,
        end_date: draftProposal.end_date_social || undefined,
        options: draftProposal.social_options,
      },
    },
  });

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = methods;

  const proposalType = watch("type");

  const onSubmit = async (data: z.output<typeof draftProposalSchema>) => {
    setIsPending(true);
    console.log("are we submitting this?");

    const res = await draftProposalAction({
      ...data,
      draftProposalId: draftProposal.id,
    });

    console.log("done with submitting this");

    setIsPending(false);
    if (!res.ok) {
      // TODO: make error toast + improve messaging
      toast("Something went wrong...");
    } else {
      window.location.href = `/proposals/draft/${draftProposal.id}?stage=2`;
    }
  };

  return (
    <FormProvider {...methods}>
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
                  placeholder="EP [1.1] [Executable] title"
                  options={{
                    required: "Title is required.",
                  }}
                  errorMessage={errors.title?.message}
                />
              </FormItem>
              <FormItem
                label="Description"
                required={true}
                htmlFor="description"
              >
                <TextInput
                  name="description"
                  register={register}
                  placeholder="Description"
                  options={{
                    required: "Description is required.",
                  }}
                  errorMessage={errors.description?.message}
                />
              </FormItem>
              <FormItem label="Abstract" required={true} htmlFor="abstract">
                <MarkdownTextareaInput name="abstract" />
              </FormItem>
            </div>
          </FormCard.Section>
          <FormCard.Section>
            {proposalType === ProposalType.EXECUTABLE ? (
              <ExecutableProposalForm />
            ) : (
              <SocialProposalForm />
            )}
          </FormCard.Section>
          <FormCard.Section>
            <h3 className="text-stone-900 font-semibold">
              Transaction payload audit
            </h3>
            <p className="mt-2 stone-700 mb-6">
              Use this field to upload an optional audit report for your
              transaction payload. This can help voters verify that your
              proposal does what it intends to.
            </p>
            <FileInput />
          </FormCard.Section>
          <FormCard.Section>
            <div className="flex flex-row justify-between space-x-4">
              <p className="text-agora-stone-700">
                This will post your draft to both the ENS forums and request an
                update to the ENS DAO docs.
              </p>
              <UpdatedButton
                type="primary"
                isSubmit={true}
                className="w-[200px] flex items-center justify-center"
                isLoading={isPending}
              >
                Create draft
              </UpdatedButton>
            </div>
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
                defaultChecked={true}
                className="rounded text-stone-900"
              />
            </div>
          </FormCard.Footer>
        </FormCard>
      </form>
    </FormProvider>
  );
};

export default DraftForm;
