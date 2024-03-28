import { ProposalDraft } from "@prisma/client";
import Link from "next/link";
import React from "react";

interface DraftProposalsListRowProps {
  proposal: ProposalDraft;
}

const DraftProposalsListRow: React.FC<DraftProposalsListRowProps> = (props) => {
  const { proposal } = props;

  // TODO read the states from the database
  const proposalStates = [
    {
      id: 1,
      state: "Create temp check",
    },
    {
      id: 2,
      state: "Create draft",
    },
    {
      id: 3,
      state: "Submit proposal",
    },
    {
      id: 4,
      state: "Wait for sponsor",
    },
    {
      id: 5,
      state: "Contact voters",
    },
    {
      id: 6,
      state: "Queue proposal",
    },
    {
      id: 7,
      state: "Execute proposal",
    },
  ];

  return (
    <div className="bg-stone-100 border border-stone-200 rounded-2xl p-2 shadow-sm">
      <div className="flex flex-row justify-between bg-white border border-stone-200 rounded-2xl px-6 py-5 shadow-sm">
        <div>
          <p className="font-semibold text-stone-500 text-xs">{`By ${proposal.author_address}`}</p>
          <p className="font-medium">{proposal.title}</p>
        </div>
        <div className="flex flex-row gap-x-16">
          <div className="w-[140px]">
            <p className="font-semibold text-stone-500 text-xs">{`Status`}</p>
            <p className="font-medium">
              {proposalStates[proposal.proposal_status_id - 1].state}
            </p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-stone-500 text-xs">{`Type`}</p>
            <p className="font-medium">{proposal.proposal_type}</p>
          </div>
          <div className="w-[140px]">
            <p className="font-semibold text-stone-500 text-xs">{`Waiting for`}</p>
            <p className="font-medium">
              {proposal.proposal_status_id <= 3
                ? "Submitting proposal"
                : proposal.proposal_status_id == 4
                ? "Sponsor approval"
                : "Onchain vote"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between px-6 pt-2">
        {proposalStates.map((state) => (
          <div key={state.id} className="w-full">
            <div className="flex flex-row items-center my-2">
              <div
                className={`h-1 w-1 rounded-full ${
                  proposal.proposal_status_id >= state.id
                    ? "bg-stone-700"
                    : "bg-stone-300"
                }`}
              ></div>
              <div
                className={`w-full h-px ${
                  proposal.proposal_status_id > state.id
                    ? "bg-stone-700"
                    : "bg-stone-300"
                }`}
              ></div>
            </div>
            <p className="text-xs font-medium text-gray-800">{state.state}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftProposalsListRow;
