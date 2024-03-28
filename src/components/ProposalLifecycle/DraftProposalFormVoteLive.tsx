import React, { useContext } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion-proposal-draft";
import DraftProposalReview from "./DraftProposalReview";
import { ProposalDraft } from "@prisma/client";
import { LinkIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { ProposalDraftWithTransactions } from "./types";
import Link from "next/link";

const staticText = {
  description:
    "Please proofread a preview of your proposal below. If you need to change any of its content, please edit your draft in the previous step.",
};

interface DraftProposalVoteLiveProps {
  proposalState: ProposalDraftWithTransactions;
  setProposalState: React.Dispatch<
    React.SetStateAction<ProposalDraftWithTransactions>
  >;
  updateProposal: (
    proposal: ProposalDraft,
    updateData: Partial<ProposalDraft>
  ) => Promise<ProposalDraft>;
}

const DraftProposalVoteLive: React.FC<DraftProposalVoteLiveProps> = (props) => {
  const { proposalState, setProposalState, updateProposal } = props;

  return (
    <div className="bg-gray-fa rounded-2xl ring-1 ring-inset ring-gray-eo">
      <AccordionItem
        value="proposal-live"
        className="w-full rounded-2xl bg-white border border-gray-eo shadow-sm"
      >
        <AccordionTrigger>
          <h2 className="text-2xl font-black">Waiting for the results</h2>
        </AccordionTrigger>
      </AccordionItem>
      {proposalState.proposal_status_id == 6 && (
        <div className="flex flex-col gap-y-2 p-6">
          {proposalState.proposal_type === "social" ? (
            <div className="flex flex-col gap-y-2">
              <p className="text-stone-700">
                {`The proposal has been submitted to Snapshot, and the voters know that it’s time to go in and let the world know what they think about it. Celebrate!`}
              </p>
              <Link href={""} className="underline">
                Link to snapshot proposal
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-y-2">
              <p className="text-stone-700">
                {`Waiting for the results of the onchain vote. If successful, the proposal will be able to queue for execution. Stay tuned!`}
              </p>
              <Link href={""} className="underline">
                Link to onchain proposal
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraftProposalVoteLive;
