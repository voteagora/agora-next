"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { z } from "zod";
// import Tenant from "@/lib/tenant/tenant";
// import { redirect } from "next/navigation";
import FormCard from "../form/FormCard";
import { UpdatedButton } from "@/components/Button";
import {
  ProposalDraft,
  ProposalSocialOption,
  ProposalDraftTransaction,
} from "@prisma/client";
import { createGithubProposal } from "@/app/proposals/draft/utils/github";
import { onSubmitAction as createGithubChecklistItem } from "../../actions/createGithubChecklistItem";

const GithubPRForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
}) => {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    setIsPending(true);
    try {
      if (!address) {
        throw new Error("No address found");
      }
      const link = await createGithubProposal(draftProposal);
      await createGithubChecklistItem({
        draftProposalId: draftProposal.id,
        creatorAddress: address,
        link: link,
      });
      window.location.href = `/proposals/draft/${draftProposal.id}?stage=3`;
    } catch (e) {
      console.error(e);
      setIsPending(false);
    }
  };

  return (
    <FormCard>
      <FormCard.Section>
        <span className="w-full rounded-md h-[300px] bg-agora-stone-50 border border-agora-stone-100 block"></span>
        <p className="mt-4 text-stone-700">
          You must create a PR with your proposal in the ENS docs repo. Click
          below to allow Agora to create the PR for you.
        </p>
      </FormCard.Section>
      <FormCard.Section>
        <div className="space-x-2 self-start">
          <UpdatedButton
            isSubmit={false}
            type="primary"
            fullWidth={true}
            isLoading={isPending}
            onClick={() => {
              handleClick();
            }}
          >
            Create PR
          </UpdatedButton>
        </div>
      </FormCard.Section>
    </FormCard>
  );
};

export default GithubPRForm;
