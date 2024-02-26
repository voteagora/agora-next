import { ProposalDraft } from "@prisma/client";
import Link from "next/link";
import React from "react";

interface DraftProposalsListRowProps {
  proposal: ProposalDraft;
}

const DraftProposalsListRow: React.FC<DraftProposalsListRowProps> = (props) => {
  const { proposal } = props;

  return (
    <Link
      href={`/proposals/draft/${proposal.id}`}
      className="bg-stone-100 border border-stone-200 rounded-2xl p-2"
    >
      <div className="bg-white border border-stone-200 rounded-2xl px-6 py-5 shadow-sm">
        <p className="font-semibold text-gray-800 text-xs">{`Prop ${proposal.id} - by ${proposal.author_address}`}</p>
        <p className="font-medium">{proposal.title}</p>
      </div>
      <div className="flex flex-row justify-between px-6 pt-2">
        <p className="text-xs font-medium text-gray-800">Create temp check</p>
        <p className="text-xs font-medium text-gray-800">Create draft</p>
        <p className="text-xs font-medium text-gray-800">Submit proposal</p>
        <p className="text-xs font-medium text-gray-800">Contact voters</p>
        <p className="text-xs font-medium text-gray-800">Queue proposal</p>
        <p className="text-xs font-medium text-gray-800">Execute proposal</p>
      </div>
    </Link>
  );
};

export default DraftProposalsListRow;
