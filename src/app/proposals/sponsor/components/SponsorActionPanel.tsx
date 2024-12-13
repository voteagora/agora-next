"use client";

import { UpdatedButton } from "@/components/Button";
import { ProposalDraftApprovedSponsors } from "@prisma/client";
import { useOptimistic, useTransition } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import AvatarAddress from "../../draft/components/AvatarAdress";
import ProposalRequirements from "../../draft/components/ProposalRequirements";
import { useCanSponsor } from "../../draft/hooks/useCanSponsor";
import { DraftProposal } from "../../draft/types";
import { ackSponsorshipRequest } from "../actions/rejectSponsorshipRequest";
import { cn } from "@/lib/utils";
import SponsorActions from "./SponsorActions";

const SponsorActionPanel = ({
  draftProposal,
}: {
  draftProposal: DraftProposal & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
  };
}) => {
  const { address } = useAccount();
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

  //   const renderDetails = () => {
  //     switch (draftProposal.voting_module_type) {
  //       case ProposalType.SOCIAL:
  //         return (
  //           <section className="py-4 border-b border-line">
  //             <div className="flex flex-col gap-2">
  //               <span className="flex flex-row justify-between items-center">
  //                 <span className="text-tertiary">Starts</span>
  //                 <span className="text-primary">2024-01-01</span>
  //               </span>
  //               <span className="flex flex-row justify-between items-center">
  //                 <span className="text-tertiary">Ends</span>
  //                 <span className="text-primary">2024-01-01</span>
  //               </span>
  //               <span className="flex flex-row justify-between items-center gap-4">
  //                 <span className="text-tertiary">Options</span>
  //                 <span className="text-primary lowercase">
  //                   {draftProposal.social_options
  //                     .map((option) => option.text)
  //                     .join(", ")}
  //                 </span>
  //               </span>
  //             </div>
  //           </section>
  //         );

  //       case ProposalType.BASIC:
  //         return null;

  //       default:
  //         return null;
  //     }
  //   };

  return (
    <div className="relative z-20">
      <div className="border border-line rounded-lg z-20 relative bg-neutral">
        {optimisticDraftProposal.approved_sponsors.length > 0 && (
          <section className="border-b border-line p-6">
            <h3 className="font-semibold text-primary">Sponsorship requests</h3>
            <p className="text-tertiary mt-2">
              This is a private draft only viewable to invited users.
            </p>
            <div className="flex flex-col gap-4 mt-3 max-h-[200px] overflow-y-scroll">
              {optimisticDraftProposal.approved_sponsors.map((sponsor) => (
                <>
                  <div
                    className={cn(
                      "flex flex-row items-center justify-between space-x-2 relative",
                      sponsor.status === "REJECTED" && "opacity-50"
                    )}
                  >
                    {isAddress(sponsor.sponsor_address) && (
                      <AvatarAddress address={sponsor.sponsor_address} />
                    )}
                    <span className="text-secondary bg-tertiary/5 border border-line rounded px-1 py-0.5 text-xs lowercase first-letter:uppercase">
                      {sponsor.status}
                    </span>
                  </div>
                </>
              ))}
            </div>
          </section>
        )}
        <section className="p-6">
          <h2 className="text-primary font-semibold">
            Sponsorship requirements
          </h2>
          <div className="mt-4 bg-tertiary/5 rounded-xl">
            <ProposalRequirements proposalDraft={draftProposal} />
          </div>
          {status === "pending" ? (
            <span className="w-full bg-tertiary/5 animate-pulse italic block mt-4 rounded-lg p-2 text-tertiary text-sm text-center">
              Loading actions...
            </span>
          ) : canSponsor ? (
            <div className="flex flex-col gap-2 mt-6">
              <SponsorActions draftProposal={draftProposal} />
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
            <p className="text-secondary text-xs mt-4 text-center">
              You are not eligible to sponsor this proposal.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default SponsorActionPanel;
