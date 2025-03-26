"use client";

import FormCard from "./form/FormCard";
import ProposalTransactionDisplay from "@/components/Proposals/ProposalPage/ApprovedTransactions/ProposalTransactionDisplay";
import { useAccount } from "wagmi";
import { formatFullDate } from "@/lib/utils";
import { useManager } from "@/hooks/useManager";
import { DraftProposal, PLMConfig } from "@/app/proposals/draft/types";
import Tenant from "@/lib/tenant/tenant";
import { ProposalType, BasicProposal } from "@/app/proposals/draft/types";
import toast from "react-hot-toast";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useGetVotes } from "@/hooks/useGetVotes";
import Markdown from "@/components/shared/Markdown/Markdown";
import ProposalRequirements from "./ProposalRequirements";
import { useCanSponsor } from "../hooks/useCanSponsor";

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
  const gatingType = (plmToggle?.config as PLMConfig)?.gatingType;

  const { address } = useAccount();
  const { data: manager } = useManager();
  const { data: canAddressSponsor } = useCanSponsor(address as `0x${string}`);

  const renderProposalDescription = (proposal: DraftProposal) => {
    switch (proposal.voting_module_type) {
      case ProposalType.BASIC:
        return (
          <p className="text-secondary mt-2">
            This is a <PreText text="basic" /> proposal.
          </p>
        );
      case ProposalType.APPROVAL:
        return (
          <p className="text-secondary mt-2">
            This is an <PreText text="approval" /> proposal. The maximum number
            of tokens that can be transferred from all the options in this
            proposal is <PreText text={proposal.budget.toString()} />. The
            number of options each voter may select is{" "}
            <PreText text={proposal.max_options.toString()} />.{" "}
            {proposal.criteria === "Threshold" &&
              `All options with more than ${proposal.threshold} votes will be considered approved.`}
            {proposal.criteria === "Top choices" &&
              `The top ${proposal.top_choices} choices will be considered approved.`}
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

  return (
    <FormCard>
      <FormCard.Section>
        <h2 className="font-black text-primary text-2xl">
          {proposalDraft.title}
        </h2>
        {renderProposalDescription(proposalDraft)}
        <div className="mt-6">
          {proposalDraft.voting_module_type === ProposalType.BASIC && (
            <ProposalTransactionDisplay
              descriptions={(proposalDraft as BasicProposal).transactions.map(
                (t) => t.description
              )}
              targets={(proposalDraft as BasicProposal).transactions.map(
                (t) => t.target
              )}
              calldatas={
                (proposalDraft as BasicProposal).transactions.map(
                  (t) => t.calldata
                ) as `0x${string}`[]
              }
              values={(proposalDraft as BasicProposal).transactions.map(
                (t) => t.value
              )}
              simulationDetails={{
                id: (proposalDraft as BasicProposal).transactions[0]
                  ?.simulation_id,
                state: (proposalDraft as BasicProposal).transactions[0]
                  ?.simulation_state,
              }}
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
        <h3 className="font-semibold text-primary">Requirements</h3>
        {!canAddressSponsor && (
          <p className="text-secondary mt-2">
            You do not meet the requirement to submit this proposal. However,
            you can ask someone who does meet the requirement to sponsor this
            proposal on your behalf. You can make this proposal private and send
            it to a select few people, or you can make it public for anyone in
            the community to sponsor.
          </p>
        )}
        <ProposalRequirements proposalDraft={proposalDraft} />
        {actions}
      </FormCard.Section>
    </FormCard>
  );
};

export default DraftPreview;
