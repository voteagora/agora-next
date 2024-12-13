"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import FormCard from "../form/FormCard";
import { UpdatedButton } from "@/components/Button";
import { createGithubProposal } from "@/app/proposals/draft/utils/github";
import { onSubmitAction as createGithubChecklistItem } from "../../actions/createGithubChecklistItem";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DraftProposal } from "../../types";
import DeleteDraftButton from "../DeleteDraftButton";
import BackButton from "../BackButton";
import { GET_DRAFT_STAGES, getStageIndexForTenant } from "../../utils/stages";
import { AnimatePresence, motion } from "framer-motion";

/**
 * TODO:
 * It seems unlikely any other tenants are going to be using github PR as a step in their proposal process
 * So I don't feel like it's worth the effort to make this a generic component.
 * So, keep in mind that currently this component (and the github actions) are tightly coupled to the ENS tenant.
 */
const GithubPRForm = ({
  draftProposal,
  rightColumn,
}: {
  draftProposal: DraftProposal;
  rightColumn: React.ReactNode;
}) => {
  const router = useRouter();
  const openDialog = useOpenDialog();
  const { address } = useAccount();
  const [isCreatePRPending, setIsCreatePRPending] = useState(false);
  const [isSkipPending, setIsSkipPending] = useState(false);

  const github_pr_checklist_item = draftProposal.checklist_items.find(
    (item) => item.title === "Docs updated"
  );

  const stageIndex = getStageIndexForTenant("ADDING_GITHUB_PR") as number;

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

  const DRAFT_STAGES_FOR_TENANT = GET_DRAFT_STAGES()!;

  return (
    <main className="max-w-screen-xl mx-auto mt-12">
      <div className="flex flex-row items-center justify-between bg-neutral">
        <div className="flex flex-row items-center space-x-4">
          {stageIndex > 0 && (
            <BackButton draftProposalId={draftProposal.id} index={stageIndex} />
          )}
          <h1 className="font-bold text-primary text-2xl m-0">
            Create Github PR
          </h1>
          <span className="bg-tertiary/5 text-tertiary rounded-full px-2 py-1 text-sm">
            {/* stageObject.order + 1 is becuase order is zero indexed */}
            Step {stageIndex + 1}/{DRAFT_STAGES_FOR_TENANT.length}
          </span>
        </div>
        <div className="flex flex-row items-center space-x-4">
          <DeleteDraftButton proposalId={draftProposal.id} />
          {!!github_pr_checklist_item ? (
            <div className="space-x-2 self-start flex items-center">
              <UpdatedButton
                fullWidth={true}
                type="primary"
                className="whitespace-nowrap min-w-[184px]"
                onClick={() => {
                  handleSkip();
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
                className="whitespace-nowrap min-w-[184px]"
                isLoading={isSkipPending}
                onClick={() => {
                  // If we have already created a PR we don't even need to handleCLick, we can just redirect
                  handleSkip();
                }}
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
                className="whitespace-nowrap min-w-[184px]"
              >
                Update docs for me
              </UpdatedButton>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 gap-x-0 sm:gap-x-6 mt-6">
        <AnimatePresence mode="wait">
          <motion.section
            className="col-span-1 sm:col-span-2 order-last sm:order-first"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
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
                <p className="mt-4 text-secondary">
                  {!!github_pr_checklist_item ? (
                    <span>
                      You have already started creating docs for this draft
                      proposal. If you have since updated your proposal, please{" "}
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
            </FormCard>
          </motion.section>
        </AnimatePresence>
        <section className="col-span-1">
          <div className="bg-wash border border-line rounded-2xl p-4">
            {rightColumn}
          </div>
        </section>
      </div>
    </main>
  );
};

export default GithubPRForm;
