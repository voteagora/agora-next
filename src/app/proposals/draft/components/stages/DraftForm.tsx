"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import FormCard from "../form/FormCard";
import TextInput from "../form/TextInput";
import MarkdownTextareaInput from "../form/MarkdownTextareaInput";
import { UpdatedButton } from "@/components/Button";
import { DraftProposalSchema } from "../../schemas/DraftProposalSchema";
import { onSubmitAction as draftProposalAction } from "../../actions/createDraftProposal";
import {
  ProposalType,
  SocialProposalType,
  ProposalTypeMetadata,
  parseProposalToForm,
  DraftProposal,
  ApprovalProposal,
} from "../../types";
import BasicProposalForm from "../BasicProposalForm";
import SocialProposalForm from "../SocialProposalForm";
import ApprovalProposalForm from "../ApprovalProposalForm";
import OptimisticProposalForm from "../OptimisticProposalForm";
import SwitchInput from "../form/SwitchInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getStageIndexForTenant } from "@/app/proposals/draft/utils/stages";
import Tenant from "@/lib/tenant/tenant";

const DEFAULT_FORM = {
  type: ProposalType.BASIC,
  title: "",
  abstract: "",
  transactions: [],
  socialProposal: {
    type: SocialProposalType.BASIC,
    start_date: undefined,
    end_date: undefined,
    options: [],
  },
};

const DraftForm = ({ draftProposal }: { draftProposal: DraftProposal }) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const router = useRouter();
  const { address } = useAccount();
  const [isPending, setIsPending] = useState<boolean>(false);
  const methods = useForm<z.output<typeof DraftProposalSchema>>({
    resolver: zodResolver(DraftProposalSchema),
    defaultValues: parseProposalToForm(draftProposal) || DEFAULT_FORM,
  });

  const { watch, handleSubmit, control } = methods;

  const proposalType = watch("type");
  const stageIndex = getStageIndexForTenant("DRAFTING") as number;

  const onSubmit = async (data: z.output<typeof DraftProposalSchema>) => {
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
                <SwitchInput
                  control={control}
                  label="Proposal type"
                  required={true}
                  options={Object.values([
                    ...(plmToggle?.config?.proposalTypes || []),
                  ])}
                  name="type"
                />

                <p className="text-sm self-center text-agora-stone-700 mt-4">
                  {ProposalTypeMetadata[proposalType].description}
                </p>
              </div>

              <TextInput
                label="Title"
                name="title"
                required={true}
                control={methods.control}
                // TODO: maybe make this customizable per tenant? EP [1.1] feels ENS specific
                placeholder="EP [1.1] [Executable] title"
              />
              <MarkdownTextareaInput
                control={methods.control}
                label="Abstract"
                required={true}
                name="abstract"
              />
            </div>
          </FormCard.Section>
          <FormCard.Section>
            {(() => {
              switch (proposalType) {
                case ProposalType.BASIC:
                  return <BasicProposalForm />;
                case ProposalType.SOCIAL:
                  return <SocialProposalForm />;
                case ProposalType.APPROVAL:
                  return (
                    <ApprovalProposalForm
                      draftProposal={draftProposal as ApprovalProposal}
                    />
                  );
                case ProposalType.OPTIMISTIC:
                  return <OptimisticProposalForm />;
                default:
                  const exhaustiveCheck: never = proposalType;
                  return exhaustiveCheck;
              }
            })()}
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
