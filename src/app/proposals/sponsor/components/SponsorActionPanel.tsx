"use client";

import { getIndexForStage } from "@/app/proposals/draft/utils/stages";
import { UpdatedButton } from "@/components/Button";
import {
  ArrowUturnRightIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import { ProposalDraftApprovedSponsors, ProposalStage } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import toast from "react-hot-toast";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import AvatarAddress from "../../draft/components/AvatarAdress";
import ProposalRequirements from "../../draft/components/ProposalRequirements";
import { useCanSponsor } from "../../draft/hooks/useCanSponsor";
import { DraftProposal, ProposalType } from "../../draft/types";
import { ackSponsorshipRequest } from "../actions/rejectSponsorshipRequest";
import { motion, AnimatePresence } from "framer-motion";

const SponsorActionPanel = ({
  draftProposal,
}: {
  draftProposal: DraftProposal & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
  };
}) => {
  const { address } = useAccount();
  const router = useRouter();
  const { data: canSponsor, status } = useCanSponsor(address);
  const [_, startTransition] = useTransition();
  const [optimisticDraftProposal, setOptimisticDraftProposal] = useOptimistic<
    DraftProposal & { approved_sponsors: ProposalDraftApprovedSponsors[] },
    ProposalDraftApprovedSponsors
  >(draftProposal, (state, updatedSponsor) => {
    return {
      ...state,
      approved_sponsors: state.approved_sponsors.map((sponsor) =>
        sponsor.sponsor_address === updatedSponsor.sponsor_address
          ? updatedSponsor
          : sponsor
      ),
    };
  });

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
        {renderDetails()}
        {optimisticDraftProposal.approved_sponsors.length > 0 && (
          <section className="border-b border-line pb-4">
            <h3 className="font-bold text-primary capitalize">Sponsors</h3>
            <p className="text-secondary mt-2">
              This is a private draft viewable by the following users:
            </p>
            <div className="flex flex-col gap-2 mt-3">
              {optimisticDraftProposal.approved_sponsors.map((sponsor) => (
                <>
                  <div className="flex flex-row items-center space-x-2 relative">
                    {isAddress(sponsor.sponsor_address) && (
                      <AvatarAddress address={sponsor.sponsor_address} />
                    )}
                    <AnimatePresence initial={false}>
                      {sponsor.status === "REJECTED" && (
                        <motion.div
                          key={`${sponsor.sponsor_address}-rejected`}
                          className="absolute left-[-10px] w-[calc(100%+5px)] flex flex-row items-center"
                          initial={false}
                        >
                          <motion.div
                            className="h-[3px] bg-negative/50 rounded-full mr-1 flex-1"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                              duration: 0.2,
                              ease: [0.32, 0, 0.67, 0],
                            }}
                            style={{ transformOrigin: "left" }}
                          />
                          <motion.span
                            className="text-negative text-xs italic"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            Declined
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
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
        {status === "pending" ? (
          <span className="w-full bg-tertiary/5 animate-pulse italic block mt-4 rounded-lg p-2 text-tertiary text-sm text-center">
            Loading actions...
          </span>
        ) : canSponsor ? (
          <div className="flex flex-col gap-2 mt-6">
            <UpdatedButton type="primary" className="w-full">
              Sponsor proposal
            </UpdatedButton>

            <UpdatedButton
              type="secondary"
              className="w-full"
              onClick={(event: any) => {
                event.preventDefault();
                startTransition(async () => {
                  const sponsor = draftProposal.approved_sponsors.find(
                    (sponsor) => sponsor.sponsor_address === address
                  ) as ProposalDraftApprovedSponsors;

                  const newStatus =
                    sponsor.status === "REJECTED" ? "PENDING" : "REJECTED";

                  setOptimisticDraftProposal({
                    ...sponsor,
                    status: newStatus,
                  });

                  await ackSponsorshipRequest({
                    address: address as `0x${string}`,
                    proposalId: draftProposal.id.toString(),
                    status: newStatus,
                  });
                });
              }}
            >
              {optimisticDraftProposal.approved_sponsors.find(
                (sponsor) => sponsor.sponsor_address === address
              )?.status === "REJECTED"
                ? "Un-decline sponsorship"
                : "Decline sponsorship"}
            </UpdatedButton>
          </div>
        ) : (
          <p className="text-secondary text-xs mt-2">
            You are not eligible to sponsor this proposal.
          </p>
        )}
      </div>
    </div>
  );
};

export default SponsorActionPanel;
