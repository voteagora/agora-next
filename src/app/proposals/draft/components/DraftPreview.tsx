"use client";

import FormCard from "./form/FormCard";
import ProposalTransactionDisplay from "@/components/Proposals/ProposalPage/ApprovedTransactions/ProposalTransactionDisplay";
import { useAccount, useBlockNumber } from "wagmi";
import { formatUnits } from "viem";
import AvatarAddress from "./AvatarAdress";
import { formatFullDate } from "@/lib/utils";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import {
  DraftProposal,
  PLMConfig,
  ProposalGatingType,
  ProposalScope,
} from "@/app/proposals/draft/types";
import Tenant from "@/lib/tenant/tenant";
import { ProposalType } from "@/app/proposals/draft/types";
import toast from "react-hot-toast";
import { useGetVotes } from "@/hooks/useGetVotes";
import Markdown from "@/components/shared/Markdown/Markdown";
import { useEffect, useState } from "react";

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
  const config = plmToggle?.config as PLMConfig;
  const gatingType = config?.gatingType;
  const votingModuleType = proposalDraft.voting_module_type;
  const targets = proposalDraft.transactions.map((t) => t.target);
  const values = proposalDraft.transactions.map((t) => parseInt(t.value));
  const calldatas = proposalDraft.transactions.map((t) => t.calldata);
  const description = proposalDraft.transactions.map((t) => t.description);

  const { address } = useAccount();
  const { data: threshold } = useProposalThreshold();
  const { data: manager } = useManager();

  const { data: blockNumber } = useBlockNumber({
    chainId: tenant.ui.toggle("use-l1-block-number")?.enabled
      ? tenant.contracts.chainForTime?.id
      : undefined,
  });

  const { data: accountVotes } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: blockNumber ? blockNumber - BigInt(1) : BigInt(0),
    enabled: !!address && !!blockNumber,
  });

  const [lastValidVotes, setLastValidVotes] = useState<bigint | undefined>(
    undefined
  );

  useEffect(() => {
    if (accountVotes !== undefined) {
      setLastValidVotes(accountVotes);
    }
  }, [accountVotes]);

  // Use either the current votes or the last valid votes
  // This is to prevent re mounting of component since accountVotes is for a brief sec
  // after blockNumber is fetched and this causes the component to re render and few child components to mount again

  const effectiveVotes =
    accountVotes !== undefined ? accountVotes : lastValidVotes;

  const canSponsor = () => {
    if (
      proposalDraft.proposal_scope === ProposalScope.OFFCHAIN_ONLY ||
      (proposalDraft.proposal_scope === ProposalScope.HYBRID &&
        !!proposalDraft.onchain_transaction_hash)
    ) {
      return (
        !!config.offchainProposalCreator &&
        config.offchainProposalCreator.includes(address || "")
      );
    }
    switch (gatingType) {
      case ProposalGatingType.MANAGER:
        return manager === address;
      case ProposalGatingType.TOKEN_THRESHOLD:
        return effectiveVotes !== undefined && threshold !== undefined
          ? effectiveVotes >= threshold
          : false;
      case ProposalGatingType.GOVERNOR_V1:
        return (
          manager === address ||
          (effectiveVotes !== undefined && threshold !== undefined
            ? effectiveVotes >= threshold
            : false)
        );
      default:
        return false;
    }
  };

  const canAddressSponsor = canSponsor();

  const renderProposalDescription = (proposal: DraftProposal) => {
    switch (proposal.voting_module_type) {
      case ProposalType.BASIC:
        return (
          <p className="text-secondary mt-2">
            This is a <PreText text="basic" /> proposal.
          </p>
        );
      case ProposalType.APPROVAL:
        const isOnchainOnly =
          proposal.proposal_scope === ProposalScope.ONCHAIN_ONLY;
        return (
          <p className="text-secondary mt-2">
            This is an <PreText text="approval" /> proposal. The maximum number
            of tokens that can be transferred from all the options in this
            proposal is <PreText text={proposal.budget.toString()} />. The
            number of options each voter may select is{" "}
            <PreText text={proposal.max_options.toString()} />.{" "}
            {proposal.criteria === "Threshold" && (
              <>
                All options with more than{" "}
                <PreText
                  text={
                    isOnchainOnly
                      ? proposal.threshold.toString()
                      : `${(proposal.threshold / 100).toString()}%`
                  }
                />{" "}
                {isOnchainOnly ? "votes" : ""} will be considered approved
              </>
            )}
            {proposal.criteria === "Top choices" && (
              <>
                The top <PreText text={proposal.top_choices.toString()} />{" "}
                choices will be considered approved
              </>
            )}
          </p>
        );

      case ProposalType.SOCIAL:
        return (
          <p className="text-secondary mt-2">
            This is a <PreText text="social" /> proposal. Voters will vote on
            snapshot.
          </p>
        );

      case ProposalType.OPTIMISTIC:
        return (
          <p className="text-secondary mt-2">
            This is an <PreText text="optimistic" /> proposal
          </p>
        );

      default:
        return null;
    }
  };

  const renderProposalRequirements = () => {
    const requirements = [];

    if (votingModuleType === ProposalType.SOCIAL) {
      return (
        <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4">
          <p className="flex-grow text-primary">Voting power</p>
          <span className="text-secondary font-mono text-xs">
            {">= "}
            {config?.snapshotConfig?.requiredTokens}
            {" tokens"}
          </span>
        </div>
      );
    }
    if (
      (proposalDraft.proposal_scope === ProposalScope.OFFCHAIN_ONLY ||
        (proposalDraft.proposal_scope === ProposalScope.HYBRID &&
          !!proposalDraft.onchain_transaction_hash)) &&
      config?.offchainProposalCreator
    ) {
      return (
        <div className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b border-line last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4">
          <p className="flex-grow text-primary">Offchain proposal creator</p>
          <span className="text-secondary font-mono text-xs">
            <div className="flex flex-col">
              {config.offchainProposalCreator?.map((creator) => (
                <div key={creator}>
                  <span className="text-secondary font-mono text-xs">
                    {creator}
                  </span>
                </div>
              ))}
            </div>
          </span>
        </div>
      );
    }

    if (
      gatingType === ProposalGatingType.MANAGER ||
      gatingType === ProposalGatingType.GOVERNOR_V1
    ) {
      requirements.push(
        <div
          key="manager"
          className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b border-line last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4"
        >
          <p className="flex-grow text-primary">Manager address</p>
          <span className="text-secondary font-mono text-xs">
            {manager?.toString()}
          </span>
        </div>
      );
    }

    if (
      gatingType === ProposalGatingType.TOKEN_THRESHOLD ||
      gatingType === ProposalGatingType.GOVERNOR_V1
    ) {
      requirements.push(
        <div
          key="threshold"
          className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b border-line last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4"
        >
          <p className="flex-grow text-primary">Voting power</p>
          <span className="text-secondary font-mono text-xs">
            {">= "}
            {threshold
              ? Math.round(
                  parseFloat(
                    formatUnits(BigInt(threshold), tenant.token.decimals)
                  )
                )
              : "0"}{" "}
            tokens
          </span>
        </div>
      );
    }

    return requirements.length > 0 ? requirements : null;
  };

  return (
    <FormCard>
      <FormCard.Section>
        <h2 className="font-black text-primary text-2xl">
          {proposalDraft.title}
        </h2>
        {renderProposalDescription(proposalDraft)}
        <div className="mt-6">
          {proposalDraft.voting_module_type === ProposalType.BASIC &&
            proposalDraft.proposal_scope !== ProposalScope.OFFCHAIN_ONLY && (
              <ProposalTransactionDisplay
                descriptions={description as string[]}
                targets={targets as `0x${string}`[]}
                calldatas={calldatas as `0x${string}`[]}
                values={(values as number[]).map((v) => v.toString())}
                network={tenant.contracts.governor.chain.name}
              />
            )}
        </div>
        {proposalDraft.voting_module_type === "social" && (
          <div>
            <h3 className="font-semibold mt-6">Voting strategy</h3>
            <p className="text-secondary mt-2">
              {proposalDraft.proposal_social_type}
            </p>
            {proposalDraft.start_date_social && (
              <>
                <h3 className="font-semibold mt-6">Voting start</h3>
                <p className="text-secondary mt-2">
                  {formatFullDate(proposalDraft.start_date_social)}
                </p>
              </>
            )}
            {proposalDraft.end_date_social && (
              <>
                <h3 className="font-semibold mt-6">Voting end</h3>
                <p className="text-secondary mt-2">
                  {formatFullDate(proposalDraft.end_date_social)}
                </p>
              </>
            )}
            <h3 className="font-semibold mt-6 mb-2">Voting options</h3>
            {proposalDraft.social_options.map((option, index) => (
              <p className="text-secondary" key={`draft-${index}`}>
                {option.text}
              </p>
            ))}
          </div>
        )}

        <h3 className="text-primary font-semibold mt-6">Description</h3>
        <div className="mt-2 p-4 bg-wash border border-line rounded-lg text-primary">
          <Markdown content={proposalDraft.abstract} />
        </div>
      </FormCard.Section>
      <FormCard.Section className="z-0">
        {proposalDraft.sponsor_address &&
        address != proposalDraft.sponsor_address ? (
          <>
            <p className="text-secondary">
              Your proposal is awaiting{" "}
              <span className="font-mono text-xs border border-yellow-500 text-yellow-700 bg-yellow-100 p-1 rounded">
                {proposalDraft.sponsor_address}
              </span>
              &apos;s sponsorship. Once your sponsor approves, your proposal
              will be automatically submitted, without needing your input. In
              the meantime, you can contact your sponsor by copying the link
              below.
            </p>
            <div className="bg-wash border border-line rounded-lg p-2 relative mt-6">
              <div className="flex flex-row items-center space-x-2">
                <AvatarAddress
                  address={proposalDraft.sponsor_address as `0x${string}`}
                />
                <span className="text-xs font-bold text-secondary">
                  Awaiting sponsorship
                </span>
              </div>
              <button
                type="button"
                className="absolute right-[-1px] top-[-1px] rounded-lg box-border border bg-white border-line p-2"
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
            <h3 className="font-semibold text-primary">Requirements</h3>
            {!canAddressSponsor && (
              <p className="text-secondary mt-2">
                You do not meet the requirement to submit this proposal.
                However, you can ask someone who does to help you by sharing
                this link with them.
              </p>
            )}
            <div className="mt-6">{renderProposalRequirements()}</div>
            {actions}
          </>
        )}
      </FormCard.Section>
    </FormCard>
  );
};

export default DraftPreview;
