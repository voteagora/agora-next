"use client";

import { UpdatedButton } from "@/components/Button";
import { useAccount } from "wagmi";
import { DraftProposal, ProposalType } from "../../draft/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  ArrowUturnRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import { getIndexForStage } from "@/app/proposals/draft/utils/stages";
import { ProposalDraftApprovedSponsors, ProposalStage } from "@prisma/client";
import ProposalRequirements from "../../draft/components/ProposalRequirements";
import { isAddress } from "viem";
import AvatarAddress from "../../draft/components/AvatarAdress";
import { useCanSponsor } from "../../draft/hooks/useCanSponsor";

const SponsorActionPanel = ({
  draftProposal,
}: {
  draftProposal: DraftProposal & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
  };
}) => {
  const { address } = useAccount();
  const router = useRouter();
  const { data: canSponsor } = useCanSponsor(address);

  const proposalTypeDescriptionMap = {
    [ProposalType.SOCIAL]:
      "Social proposals are offchain proposals that are submitted to snapshot and used to gauge support for a proposal.",
    [ProposalType.BASIC]:
      "Basic proposals are onchain proposals with for/against/abstain vote types.",
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
        <h3 className="font-bold text-primary capitalize">
          {draftProposal.voting_module_type} proposal
        </h3>
        <section className="border-b border-line pb-4">
          <p className="text-secondary mt-2">
            {proposalTypeDescriptionMap[draftProposal.voting_module_type]}
          </p>
        </section>
        {renderDetails()}
        {draftProposal.approved_sponsors.length > 0 && (
          <section className="border-b border-line pt-4 pb-4">
            <h3 className="font-bold text-primary capitalize">Sponsors</h3>
            <p className="text-secondary mt-2">
              This is a private draft viewable by the following users:
            </p>
            <div className="flex flex-col gap-2 mt-3">
              {draftProposal.approved_sponsors.map((sponsor) => (
                <div className="flex flex-row justify-between items-center">
                  {isAddress(sponsor.sponsor_address) && (
                    <AvatarAddress address={sponsor.sponsor_address} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="flex flex-col gap-2 mt-4">
          <UpdatedButton
            type="secondary"
            className="w-full flex items-center justify-center"
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
          </UpdatedButton>
          {address === draftProposal.author_address && (
            <UpdatedButton
              type="secondary"
              className="w-full flex items-center justify-center"
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
            </UpdatedButton>
          )}
        </div>
      </div>
      <div className="bg-tertiary/5 p-6 pt-10 relative z-10 -mt-6 w-full rounded-lg border border-line">
        <h2 className="text-primary font-semibold">Sponsorship requirements</h2>
        <div className="mt-4 bg-neutral rounded-xl">
          <ProposalRequirements proposalDraft={draftProposal} />
        </div>
        {canSponsor && (
          <div className="flex flex-col gap-2 mt-6">
            <UpdatedButton type="primary" className="w-full">
              Sponsor proposal
            </UpdatedButton>
            <UpdatedButton type="secondary" className="w-full">
              Decline sponsorship
            </UpdatedButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorActionPanel;
