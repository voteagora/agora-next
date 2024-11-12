"use client";

import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { DraftProposal, ProposalType } from "../../draft/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  ArrowUturnRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import { getIndexForStage } from "@/app/proposals/draft/utils/stages";
import { ProposalStage } from "@prisma/client";
import ProposalRequirements from "../../draft/components/ProposalRequirements";

const SponsorActionPanel = ({
  draftProposal,
}: {
  draftProposal: DraftProposal;
}) => {
  const { address } = useAccount();
  const router = useRouter();

  const proposalTypeDescriptionMap = {
    [ProposalType.SOCIAL]:
      "Social proposals are offchain proposals that are submitted to snapshot and used to gauge support for a proposal.",
    [ProposalType.BASIC]:
      "Basic proposals are onchain proposals that are submitted to the governance contract.",
  } as Record<ProposalType, string>;

  const renderDetails = () => {
    switch (draftProposal.voting_module_type) {
      case ProposalType.SOCIAL:
        return (
          <section className="py-4 border-b border-line">
            <div className="flex flex-col gap-2">
              <span className="flex flex-row justify-between items-center">
                <span className="text-tertiary">Starts</span>
                <span className="text-primary">2024-01-01</span>
              </span>
              <span className="flex flex-row justify-between items-center">
                <span className="text-tertiary">Ends</span>
                <span className="text-primary">2024-01-01</span>
              </span>
              <span className="flex flex-row justify-between items-center gap-4">
                <span className="text-tertiary">Options</span>
                <span className="text-primary lowercase">
                  {draftProposal.social_options
                    .map((option) => option.text)
                    .join(", ")}
                </span>
              </span>
            </div>
          </section>
        );

      case ProposalType.BASIC:
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="relative z-20">
      <div className="border border-line p-6 rounded-lg z-20 relative bg-neutral shadow-newDefault">
        <h3 className="font-black text-2xl text-primary capitalize">
          {draftProposal.voting_module_type} proposal
        </h3>
        <section className="border-b border-line pb-4">
          <p className="text-secondary mt-2">
            {proposalTypeDescriptionMap[draftProposal.voting_module_type]}
          </p>
        </section>
        {renderDetails()}
        <div className="flex flex-col gap-2 mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/proposals/sponsor/${draftProposal.id}`
              );
              toast("Proposal link copied to clipboard!");
            }}
          >
            <span className="flex flex-row items-center gap-2">
              <ArrowUturnRightIcon className="w-4 h-4" />
              Share proposal
            </span>
          </Button>
          {address === draftProposal.author_address && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                router.push(
                  `/proposals/draft/${draftProposal.id}?stage=${getIndexForStage(
                    ProposalStage.AWAITING_SPONSORSHIP
                  )}`
                );
              }}
            >
              <span className="flex flex-row items-center gap-2">
                <PencilSquareIcon className="w-4 h-4" />
                Edit proposal
              </span>
            </Button>
          )}
        </div>
      </div>
      <div className="bg-tertiary/5 p-6 pt-10 absolute z-10 mt-[-24px] w-full rounded-lg border border-line">
        <h2 className="text-primary font-semibold">Sponsorship requirements</h2>
        <div className="mt-4 bg-neutral">
          <ProposalRequirements proposalDraft={draftProposal} />
        </div>
        <Button variant="default" className="w-full mt-6">
          Sponsor proposal
        </Button>
      </div>
    </div>
  );
};

export default SponsorActionPanel;
