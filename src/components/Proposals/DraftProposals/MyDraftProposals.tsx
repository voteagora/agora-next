"use client";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { ProposalDraft } from "@prisma/client";
import { ProposalLifecycleStageMetadata } from "@/app/proposals/draft/types";
import {
  DRAFT_STAGES_FOR_TENANT,
  POST_DRAFT_STAGES_FOR_TENANT,
  getStageIndexForTenant,
  getStageMetadata,
} from "@/app/proposals/draft/utils/stages";

const DraftProposalCard = ({ proposal }: { proposal: ProposalDraft }) => {
  const ALL_STAGES_FOR_TENANT = [
    ...DRAFT_STAGES_FOR_TENANT,
    ...POST_DRAFT_STAGES_FOR_TENANT,
  ];

  const currentStageObject = ALL_STAGES_FOR_TENANT.find(
    (stage) => stage.stage === proposal.stage
  )!;

  const currentStageMetadata = getStageMetadata(proposal.stage);

  return (
    <div className="bg-stone-100 border border-stone-200 rounded-2xl p-2 shadow-sm">
      <div className="flex flex-row justify-between bg-white border border-stone-200 rounded-2xl px-6 py-5 shadow-sm">
        <div>
          <p className="font-semibold text-stone-500 text-xs">{`By ${proposal.author_address}`}</p>
          <p className="font-medium">{proposal.title || "[Title pending]"}</p>
        </div>
        <div className="flex flex-row gap-x-16">
          <div className="w-[140px]">
            <p className="font-semibold text-stone-500 text-xs">{`Status`}</p>
            <p className="font-medium">{currentStageMetadata.shortTitle}</p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-stone-500 text-xs">{`Type`}</p>
            <p className="font-medium">{proposal.proposal_type}</p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-stone-500 text-xs">{`Waiting for`}</p>
            <p className="font-medium">
              {/* {proposal.proposal_status_id <= 3
                ? "Submitting proposal"
                : proposal.proposal_status_id == 4
                  ? "Sponsor approval"
                  : "Onchain vote"} */}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between px-6 pt-2">
        {ALL_STAGES_FOR_TENANT.map((stageObject, idx) => {
          const stageMetadata =
            ProposalLifecycleStageMetadata[
              stageObject.stage as keyof typeof ProposalLifecycleStageMetadata
            ];

          return (
            <div key={`stage-${idx}`} className="w-full">
              <div className="flex flex-row items-center my-2">
                <div
                  className={`h-1 w-1 rounded-full bg-stone-300 ${
                    currentStageObject.order >= stageObject.order
                      ? "bg-stone-700"
                      : "bg-stone-300"
                  }`}
                ></div>
                <div
                  className={`w-full h-px bg-stone-300 ${
                    currentStageObject.order >= stageObject.order
                      ? "bg-stone-700"
                      : "bg-stone-300"
                  }`}
                ></div>
              </div>
              <p className="text-xs font-medium text-gray-800">
                {stageMetadata.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MyDraftProposals = ({
  fetchDraftProposals,
}: {
  fetchDraftProposals: (address: `0x${string}`) => Promise<ProposalDraft[]>;
}) => {
  const { address } = useAccount();
  const [draftProposals, setDraftProposals] = useState<ProposalDraft[]>([]);

  const getDraftProposalsAndSet = useCallback(
    async (authorAddress: `0x${string}`) => {
      const proposals = await fetchDraftProposals(authorAddress);
      setDraftProposals(proposals);
    },
    []
  );

  useEffect(() => {
    if (!address) return;
    getDraftProposalsAndSet(address);
  }, [fetchDraftProposals, address]);

  if (!draftProposals.length) {
    return null;
  }

  return (
    <div className="mb-16">
      <h1 className="text-2xl font-black mb-6">My proposals</h1>
      <div className="space-y-6">
        {draftProposals.map((proposal) => (
          <Link
            key={proposal.id}
            href={`/proposals/draft/${proposal.id}?stage=${getStageIndexForTenant(proposal.stage)}`}
            className="block"
          >
            <DraftProposalCard proposal={proposal} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyDraftProposals;
