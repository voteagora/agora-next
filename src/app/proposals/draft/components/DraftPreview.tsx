"use client";

import FormCard from "./form/FormCard";
import ProposalTransactionDisplay from "@/components/Proposals/ProposalPage/ApprovedTransactions/ProposalTransactionDisplay";
import { useAccount, useBlockNumber } from "wagmi";
import { formatUnits } from "viem";
import AvatarAddress from "./AvatarAdress";
import { formatFullDate } from "@/lib/utils";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { DraftProposal, ProposalGatingType } from "@/app/proposals/draft/types";
import Tenant from "@/lib/tenant/tenant";
import { ProposalType } from "@/app/proposals/draft/types";
import toast from "react-hot-toast";

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
}: {
  proposalDraft: DraftProposal;
  actions?: React.ReactNode;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const gatingType = plmToggle?.config?.gatingType;
  const { address } = useAccount();
  const { data: threshold } = useProposalThreshold();
  const { data: manager } = useManager();
  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber || BigInt(0),
  });

  const canSponsor = () => {
    switch (gatingType) {
      case ProposalGatingType.MANAGER:
        return manager === address;
      case ProposalGatingType.TOKEN_THRESHOLD:
        return accountVotesData !== undefined && threshold !== undefined
          ? accountVotesData >= threshold
          : false;
      case ProposalGatingType.GOVERNOR_V1:
        return (
          manager === address ||
          (accountVotesData !== undefined && threshold !== undefined
            ? accountVotesData >= threshold
            : false)
        );
      default:
        return false;
    }
  };

  const canAddressSponsor = canSponsor();

  const renderProposalDescription = (proposal: DraftProposal) => {
    switch (proposal.proposal_type) {
      case ProposalType.BASIC:
        return (
          <p className="text-agora-stone-700 mt-2">
            This is a <PreText text="basic" /> proposal.
          </p>
        );
      case ProposalType.APPROVAL:
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

      case ProposalType.SOCIAL:
        return (
          <p className="text-agora-stone-700 mt-2">
            This is a <PreText text="social" /> proposal. Voters will vote on
            snapshot.
          </p>
        );

      case ProposalType.OPTIMISTIC:
        return (
          <p className="text-agora-stone-700 mt-2">
            This is an <PreText text="optimistic" /> proposal
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <FormCard>
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

        <h3 className="font-semibold mt-6">Description</h3>
        <p className="text-agora-stone-700 mt-2">{proposalDraft.abstract}</p>
      </FormCard.Section>
      <FormCard.Section className="z-0">
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
            <h3 className="font-semibold">Requirements</h3>
            {!canAddressSponsor && (
              <p className="text-agora-stone-700 mt-2">
                You do not meet the requirement to submit this proposal.
                However, you can ask someone who does to help you by sharing
                this link with them.
              </p>
            )}
            <div className="mt-6">
              {(gatingType === ProposalGatingType.MANAGER ||
                gatingType === ProposalGatingType.GOVERNOR_V1) && (
                <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4">
                  <p className="flex-grow">Manager address</p>
                  <span className="text-secondary font-mono text-xs">
                    {manager?.toString()}
                  </span>
                </div>
              )}
              {(gatingType === ProposalGatingType.TOKEN_THRESHOLD ||
                gatingType === ProposalGatingType.GOVERNOR_V1) && (
                <div className="relative">
                  {gatingType === ProposalGatingType.GOVERNOR_V1 && (
                    <div className="absolute top-[-15px] left-[calc(48%)] bg-neutral border border-line py-1 px-2 text-xs font-semibold rounded">
                      OR
                    </div>
                  )}
                  <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4">
                    <p className="flex-grow">Token balance</p>
                    <span className="text-secondary font-mono text-xs">
                      {"> "}
                      {threshold
                        ? Math.round(
                            parseFloat(
                              formatUnits(
                                BigInt(threshold),
                                tenant.token.decimals
                              )
                            )
                          )
                        : "0"}{" "}
                      tokens
                    </span>
                  </div>
                </div>
              )}
            </div>
            {actions}
          </>
        )}
      </FormCard.Section>
    </FormCard>
  );
};

export default DraftPreview;
