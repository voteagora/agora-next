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
  ProposalChecklist,
} from "@prisma/client";
import { createGithubProposal } from "@/app/proposals/draft/utils/github";
import { onSubmitAction as createGithubChecklistItem } from "../../actions/createGithubChecklistItem";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";

const GithubPRForm = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
    checklist_items: ProposalChecklist[];
  };
}) => {
  const router = useRouter();
  const openDialog = useOpenDialog();
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);

  const github_pr_checklist_item = draftProposal.checklist_items.find(
    (item) => item.title === "Docs updated"
  );

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
      setIsPending(false);
      openDialog({
        type: "OPEN_GITHUB_PR",
        params: {
          // read stage from URL and redirect to next stage
          // get stage metadata to make sure it's not the last stage (it really shouldn't be though)
          redirectUrl: `/proposals/draft/${draftProposal.id}?stage=3`,
          githubUrl: link,
        },
      });
    } catch (e) {
      console.error(e);
      setIsPending(false);
    }
  };

  return (
    <FormCard>
      <FormCard.Section>
        <div className="w-full rounded-md h-[350px] block relative">
          <Image
            src="/images/temp_check.png"
            alt="Temp Check"
            fill={true}
            className="object-cover rounded-md"
          />
        </div>
        <p className="mt-4 text-stone-700">
          {!!github_pr_checklist_item ? (
            <span>
              You've already opened a PR for this draft proposal. If you've
              since updated your proposal, please{" "}
              <a
                href={github_pr_checklist_item.link || ""}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                edit the github PR
              </a>{" "}
              to account for new details.
            </span>
          ) : (
            "You must create a PR with your proposal in the ENS docs repo. Click below to allow Agora to create the PR for you."
          )}
        </p>
      </FormCard.Section>
      <FormCard.Section>
        {!!github_pr_checklist_item ? (
          <div className="space-x-2 self-start flex items-center">
            <UpdatedButton
              fullWidth={true}
              type="primary"
              onClick={() => {
                router.push(`/proposals/draft/${draftProposal.id}?stage=3`);
              }}
            >
              Continue
            </UpdatedButton>
          </div>
        ) : (
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
        )}
      </FormCard.Section>
    </FormCard>
  );
};

export default GithubPRForm;
