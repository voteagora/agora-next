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
import BasicProposalForm from "../BasicProposalForm";
import SocialProposalForm from "../SocialProposalForm";
import ApprovalProposalForm from "../ApprovalProposalForm";
import OptimisticProposalForm from "../OptimisticProposalForm";
import SwitchInput from "../form/SwitchInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getStageIndexForTenant } from "@/app/proposals/draft/utils/stages";
import Tenant from "@/lib/tenant/tenant";

const DraftForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const router = useRouter();
  const { address } = useAccount();
  const [isPending, setIsPending] = useState<boolean>(false);
  const methods = useForm<z.output<typeof draftProposalSchema>>({
    resolver: zodResolver(draftProposalSchema),
    defaultValues: {
      type: (draftProposal.proposal_type || ProposalType.BASIC) as ProposalType,
      title: draftProposal.title,
      abstract: draftProposal.abstract,
      // @ts-ignore (prisma is saying target is string, needs to be `0x${string}` though, don't feel like fighting this)
      transactions: draftProposal.transactions || [],
      // TODO: make sure that if a tenant does not have social proposal enabled
      // it won't be an issue to have this default polluting their data
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

  const proposalType = watch("type");
  const stageIndex = getStageIndexForTenant("DRAFTING") as number;

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
        setIsPending(false);
        toast("Something went wrong...");
      } else {
        router.push(
          `/proposals/draft/${draftProposal.id}?stage=${stageIndex + 1}`
        );
      }
    } catch (error) {
      setIsPending(false);
      toast("Something went wrong...");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormCard>
          <FormCard.Section>
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormItem label="Proposal type" required={true} htmlFor="type">
                  <SwitchInput
                    options={Object.values([
                      ...(plmToggle?.config?.proposalTypes || []),
                    ])}
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
                  // TODO: maybe make this customizable per tenant? EP [1.1] feels ENS specific
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
            {proposalType === ProposalType.BASIC && <BasicProposalForm />}
            {proposalType === ProposalType.SOCIAL && <SocialProposalForm />}
            {proposalType === ProposalType.APPROVAL && <ApprovalProposalForm />}
            {proposalType === ProposalType.OPTIMISIC && (
              <OptimisticProposalForm />
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
