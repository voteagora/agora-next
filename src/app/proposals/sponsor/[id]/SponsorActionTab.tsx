"use client";

import { ShareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { UpdatedButton } from "@/components/Button";
import { useAccount } from "wagmi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ProposalDraft, ProposalStage } from "@prisma/client";
import { getIndexForStage } from "../../draft/utils/stages";

const SponsorActionTab = ({
  draftProposal,
}: {
  draftProposal: ProposalDraft;
}) => {
  const { address } = useAccount();
  const router = useRouter();

  return (
    <div className="flex flex-row items-center gap-4">
      <div className="border border-line rounded p-1 h-[42px] aspect-square flex items-center justify-center bg-tertiary/5 hover:bg-tertiary/10 transition-colors cursor-pointer">
        <TrashIcon className="h-4 w-4 text-secondary" />
      </div>
      <div
        className="border border-line rounded p-1 h-[42px] aspect-square flex items-center justify-center bg-tertiary/5 hover:bg-tertiary/10 transition-colors cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}/proposals/sponsor/${draftProposal.id}`
          );
          toast("Proposal link copied to clipboard!");
        }}
      >
        <ShareIcon className="h-4 w-4 text-secondary" />
      </div>
      {address === draftProposal.author_address && (
        <UpdatedButton
          type="primary"
          className="w-full flex items-center justify-center"
          onClick={() => {
            router.push(
              `/proposals/draft/${draftProposal.id}?stage=${getIndexForStage(
                ProposalStage.AWAITING_SPONSORSHIP
              )}`
            );
          }}
        >
          <span className="w-[150px]">Edit</span>
        </UpdatedButton>
      )}
    </div>
  );
};

export default SponsorActionTab;
