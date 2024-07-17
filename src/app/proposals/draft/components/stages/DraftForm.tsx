"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import FormCard from "../form/FormCard";
import FormItem from "../form/FormItem";
import TextInput from "../form/TextInput";
import MarkdownTextareaInput from "../form/MarkdownTextareaInput";
import { UpdatedButton } from "@/components/Button";
import { schema as draftProposalSchema } from "../../schemas/DraftProposalSchema";
import { onSubmitAction as draftProposalAction } from "../../actions/createDraftProposal";
import {
  ProposalType,
  SocialProposalType,
  ProposalTypeMetadata,
} from "../../types";
import {
  ProposalDraft,
  ProposalSocialOption,
  ProposalDraftTransaction,
} from "@prisma/client";
import ExecutableProposalForm from "../ExecutableProposalForm";
import SocialProposalForm from "../SocialProposalForm";
import SwitchInput from "../form/SwitchInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const DraftForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const router = useRouter();
  const { address } = useAccount();
  const [isPending, setIsPending] = useState<boolean>(false);
  const methods = useForm<z.output<typeof draftProposalSchema>>({
    resolver: zodResolver(draftProposalSchema),
    defaultValues: {
      type: (draftProposal.proposal_type ||
        ProposalType.EXECUTABLE) as ProposalType,
      title: draftProposal.title,
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
    watch,
    handleSubmit,
    formState: { errors },
  } = methods;

  console.log(errors);

  const proposalType = watch("type");

  const onSubmit = async (data: z.output<typeof draftProposalSchema>) => {
    setIsPending(true);

    try {
      if (!address) {
        throw new Error("No address found");
      }
      const res = await draftProposalAction({
        ...data,
        draftProposalId: draftProposal.id,
        creatorAddress: address,
      });
      if (!res.ok) {
        console.log(res.message);
        // TODO: make error toast + improve messaging
        setIsPending(false);
        toast("Something went wrong...");
      } else {
        router.push(`/proposals/draft/${draftProposal.id}?stage=2`);
      }
    } catch (error) {
      setIsPending(false);
      toast("Something went wrong...");
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
              <div className="grid grid-cols-2 gap-4">
                <FormItem label="Proposal type" required={true} htmlFor="type">
                  <SwitchInput
                    options={Object.values(
                      draftProposalSchema.shape.type._def.values
                    )}
                    name="type"
                  />
                </FormItem>
                <p className="text-sm self-center text-agora-stone-700 mt-4">
                  {ProposalTypeMetadata[proposalType].description}
                </p>
              </div>
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
            <div className="flex flex-row justify-between space-x-4">
              <UpdatedButton
                fullWidth={true}
                type="primary"
                isSubmit={true}
                className="w-[200px] flex items-center justify-center"
                isLoading={isPending}
              >
                Create draft
              </UpdatedButton>
            </div>
          </FormCard.Section>
        </FormCard>
      </form>
    </FormProvider>
  );
};

export default DraftForm;
