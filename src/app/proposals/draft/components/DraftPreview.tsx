"use client";

import FormCard from "./form/FormCard";
import ProposalTransactionDisplay from "../../../../components/Proposals/ProposalPage/ApprovedTransactions/ProposalTransactionDisplay";
import { useAccount, useBlockNumber } from "wagmi";
import { formatUnits } from "viem";
import AvatarAddress from "./AvatarAdress";
import toast from "react-hot-toast";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import { formatFullDate } from "@/lib/utils";
import { truncateAddress } from "@/app/lib/utils/text";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { DraftProposal } from "../../../proposals/draft/types";
import Tenant from "@/lib/tenant/tenant";

const PreText = ({ text }: { text: string }) => {
  return (
    <pre className="bg-[#FAFAF2] border-[#ECE3CA] text-[#B16B19] inline-block px-1 py-0.5 rounded">
      {text}
    </pre>
  );
};
const DraftPreview = ({
  proposalDraft,
  actions,
  isArchived = false,
}: {
  proposalDraft: DraftProposal;
  actions?: React.ReactNode;
  isArchived?: boolean;
}) => {
  const tenant = Tenant.current();
  const { address } = useAccount();
  const { data: threshold } = useProposalThreshold();
  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber || BigInt(0),
  });

  const hasEnoughVotes =
    accountVotesData && threshold ? accountVotesData >= threshold : false;

  // sorted and filtered checklist items
  // take most recent of each checklist item by title
  // sort by completed_at
  const filteredAndSortedChecklistItems = proposalDraft.checklist_items
    .sort((a, b) => {
      // sort by alphabetical of the title field then by the completed at field
      if (a.title.toLowerCase() === b.title.toLowerCase()) {
        return a.completed_at > b.completed_at ? 1 : -1;
      } else {
        return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
      }
    })
    .filter((item, index, self) => {
      if (index === self.length - 1) return true; // keep last item
      return item.title.toLowerCase() !== self[index + 1].title.toLowerCase();
    });

  const renderProposalDescription = (proposal: DraftProposal) => {
    switch (proposal.proposal_type) {
      case "basic":
        return (
          <p className="text-agora-stone-700 mt-2">
            This is a <PreText text="basic" /> proposal.
          </p>
        );
      case "approval":
        return (
          <p className="text-agora-stone-700 mt-2">
            This is an <PreText text="approval" /> proposal. The maximum number
            of tokens that can be transferred from all the options in this
            proposal is <PreText text={proposal.budget} />. The number of
            options each voter may select is{" "}
            <PreText text={proposal.max_options.toString()} />.{" "}
            {proposal.criteria === "Threshold" &&
              `All options with more than ${proposal.threshold} votes will be considered approved.`}
            {proposal.criteria === "Top choices" &&
              `The top ${proposal.threshold} choices will be considered approved.`}
          </p>
        );

      case "social":
        return (
          <p className="text-agora-stone-700 mt-2">
            This is a <PreText text="social" /> proposal. Voters will vote on
            snapshot.
          </p>
        );

      default:
        return (
          <p className="text-agora-stone-700 mt-2">
            This is an <PreText text="optimistic" /> proposal
          </p>
        );
    }
  };

  return (
    <FormCard>
      {!isArchived && (
        <FormCard.Header>
          <div className="flex items-center justify-between">
            <span className="text-xs">Your proposal preview</span>
            <span className="text-xs">Please review carefully</span>
          </div>
        </FormCard.Header>
      )}
      <FormCard.Section>
        <h2 className="font-black text-agora-stone-900 text-2xl">
          {proposalDraft.title}
        </h2>
        {renderProposalDescription(proposalDraft)}
        <div className="mt-6">
          {"transactions" in proposalDraft &&
            proposalDraft.transactions.length > 0 && (
              <ProposalTransactionDisplay
                descriptions={proposalDraft.transactions.map(
                  (t) => t.description
                )}
                targets={proposalDraft.transactions.map((t) => t.target)}
                calldatas={
                  proposalDraft.transactions.map(
                    (t) => t.calldata
                  ) as `0x${string}`[]
                }
                values={proposalDraft.transactions.map((t) => t.value)}
              />
            )}
        </div>
        {proposalDraft.proposal_type === "social" && (
          <div>
            <h3 className="font-semibold mt-6">Voting strategy</h3>
            <p className="text-agora-stone-700 mt-2">
              {proposalDraft.proposal_social_type}
            </p>
            {proposalDraft.start_date_social && (
              <>
                <h3 className="font-semibold mt-6">Voting start</h3>
                <p className="text-agora-stone-700 mt-2">
                  {formatFullDate(proposalDraft.start_date_social)}
                </p>
              </>
            )}
            {proposalDraft.end_date_social && (
              <>
                <h3 className="font-semibold mt-6">Voting end</h3>
                <p className="text-agora-stone-700 mt-2">
                  {formatFullDate(proposalDraft.end_date_social)}
                </p>
              </>
            )}
            <h3 className="font-semibold mt-6 mb-2">Voting options</h3>
            {proposalDraft.social_options.map((option, index) => (
              <p className="text-agora-stone-700" key={`draft-${index}`}>
                {option.text}
              </p>
            ))}
          </div>
        )}

        <h3 className="font-semibold mt-6">Abstract</h3>
        <p className="text-agora-stone-700 mt-2">{proposalDraft.abstract}</p>
      </FormCard.Section>
      <FormCard.Section className="!z-0">
        {proposalDraft.sponsor_address &&
        address != proposalDraft.sponsor_address ? (
          <>
            <p className="text-agora-stone-700">
              Your proposal is awaiting{" "}
              <span className="font-mono text-xs border border-yellow-500 text-yellow-700 bg-yellow-100 p-1 rounded">
                {proposalDraft.sponsor_address}
              </span>
              &apos;s sponsorship. Once your sponsor approves, your proposal
              will be automatically submitted, without needing your input. In
              the meantime, you can contact your sponsor by copying the link
              below.
            </p>
            <div className="bg-agora-stone-50 border border-agora-stone-100 rounded-lg p-2 relative mt-6">
              <div className="flex flex-row items-center space-x-2">
                <AvatarAddress
                  address={proposalDraft.sponsor_address as `0x${string}`}
                />
                <span className="text-xs font-bold text-agora-stone-700">
                  Awaiting sponsorship
                </span>
              </div>
              <button
                type="button"
                className="absolute right-[-1px] top-[-1px] rounded-lg box-border border bg-white border-agora-stone-100 p-2"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/proposals/sponsor/${proposalDraft.id}`
                  );
                  toast("Proposal link copied to clipboard!");
                }}
              >
                Copy sponsor link
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-semibold">Ready to submit?</h3>
            {!hasEnoughVotes && (
              <p className="text-agora-stone-700 mt-2">
                You do not meet the requirement to submit this proposal.
                However, you can ask someone who does to help you by sharing
                this link with them.
              </p>
            )}
            <div className="mt-6">
              {filteredAndSortedChecklistItems.map((item, index) => {
                return (
                  <div
                    className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4"
                    key={`checklist-${index}`}
                  >
                    <p className="flex-grow">{item.title}</p>
                    <span className="text-secondary font-mono text-xs">
                      on {formatFullDate(item.completed_at)}
                    </span>
                    <span className="text-secondary font-mono text-xs">
                      {item.link
                        ? `(by ${truncateAddress(item.completed_by)})`
                        : "(skipped)"}
                    </span>
                    <input
                      type="checkbox"
                      className="rounded text-agora-stone-900"
                      checked={!!item.link}
                    />
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer">
                        <Image
                          src={icons.link}
                          height="16"
                          width="16"
                          alt="link icon"
                        />
                      </a>
                    )}
                  </div>
                );
              })}
              <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4">
                <p className="flex-grow">Proposal threshold</p>
                <span className="text-secondary font-mono text-xs">
                  {threshold
                    ? Math.round(
                        parseFloat(
                          formatUnits(BigInt(threshold), tenant.token.decimals)
                        )
                      )
                    : "0"}{" "}
                  required
                </span>
                <input
                  type="checkbox"
                  className="rounded text-agora-stone-900"
                  checked={hasEnoughVotes}
                />
              </div>
            </div>
            {actions}
          </>
        )}
      </FormCard.Section>
    </FormCard>
  );
};

export default DraftPreview;
