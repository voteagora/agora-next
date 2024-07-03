"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
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
  const [isCreatePRPending, setIsCreatePRPending] = useState(false);
  const [isSkipPending, setIsSkipPending] = useState(false);

  const github_pr_checklist_item = draftProposal.checklist_items.find(
    (item) => item.title === "Docs updated"
  );

  const handleSkip = async () => {
    setIsSkipPending(true);
    try {
      if (!address) {
        throw new Error("No address found");
      }

      await createGithubChecklistItem({
        draftProposalId: draftProposal.id,
        creatorAddress: address,
        link: "",
      });

      setIsSkipPending(false);
      router.push(`/proposals/draft/${draftProposal.id}?stage=3`);
    } catch (e) {
      setIsSkipPending(false);
    }
  };

  const handleCreatePR = async () => {
    setIsCreatePRPending(true);
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

      setIsCreatePRPending(false);

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
      setIsCreatePRPending(false);
    }
  };

  return (
    <FormCard>
      <FormCard.Section>
        <div className="w-full rounded-md h-[350px] block relative">
          <Image
            src="/images/ens_temp_check.png"
            alt="Temp Check"
            fill={true}
            className="object-cover rounded-md"
          />
        </div>
        <p className="mt-4 text-stone-700">
          {!!github_pr_checklist_item ? (
            <span>
              You have already started creating docs for this draft proposal. If
              you have since updated your proposal, please{" "}
              <a
                href={github_pr_checklist_item.link || ""}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                edit the docs on Github
              </a>{" "}
              to account for new details.
            </span>
          ) : (
            "You must submit your proposal to the ENS docs by creating a pull request. Click below to allow Agora to update the docs for you."
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
          <div className="space-x-2 self-start flex flex-row items-center">
            <UpdatedButton
              isSubmit={false}
              type="secondary"
              isLoading={isSkipPending}
              onClick={() => {
                // If we have already created a PR we don't even need to handleCLick, we can just redirect
                handleSkip();
              }}
              className="shrink"
            >
              Skip
            </UpdatedButton>
            <UpdatedButton
              isSubmit={false}
              type="primary"
              fullWidth={true}
              isLoading={isCreatePRPending}
              onClick={() => {
                handleCreatePR();
              }}
              className="grow"
            >
              Update docs for me
            </UpdatedButton>
          </div>
        )}
      </FormCard.Section>
    </FormCard>
  );
};

export default GithubPRForm;
