"use client";

import FormCard from "./form/FormCard";
import {
  ProposalDraft,
  ProposalDraftTransaction,
  ProposalSocialOption,
} from "@prisma/client";
import ApprovedTransactions from "../../../../components/Proposals/ProposalPage/ApprovedTransactions/ApprovedTransactions";
import { useContractRead, useAccount, useBlockNumber } from "wagmi";
import { ENSGovernorABI } from "@/lib/contracts/abis/ENSGovernor";
import Tenant from "@/lib/tenant/tenant";
import AvatarAddress from "./AvatarAdress";
import toast from "react-hot-toast";

// TODO: either read from contract or add to tenant
const THRESHOLD = 100000000000000000000000;

const DraftPreview = ({
  proposalDraft,
  actions,
}: {
  proposalDraft: ProposalDraft & {
    transactions: ProposalDraftTransaction[];
    social_options: ProposalSocialOption[];
  };
  actions?: React.ReactNode;
}) => {
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber();
  const { data: accountVotesData } = useContractRead({
    abi: ENSGovernorABI,
    address: Tenant.current().contracts.governor.address as `0x${string}`,
    functionName: "getVotes",
    chainId: Tenant.current().contracts.governor.chain.id,
    args: [
      address as `0x${string}`,
      blockNumber ? blockNumber - BigInt(1) : BigInt(0),
    ],
  });

  const hasEnoughVotes = accountVotesData
    ? accountVotesData >= THRESHOLD
    : false;

  const parsedTransactions =
    proposalDraft.transactions?.map((transaction, idx) => {
      return {
        description: transaction.description,
        targets: [transaction.target],
        values: [transaction.value],
        signatures: [transaction.signature],
        calldatas: [transaction.calldata],
        functionArgsName: [
          {
            functionName: "name",
            functionArgs: ["arg1"],
          },
        ],
      };
    }) ?? [];
  return (
    <FormCard>
      <FormCard.Header>
        <div className="flex items-center justify-between">
          <span className="text-xs">Your proposal preview</span>
          <span className="text-xs">Please review carefully</span>
        </div>
      </FormCard.Header>
      <FormCard.Section>
        <h2 className="font-black text-agora-stone-900 text-2xl">
          {proposalDraft.title}
        </h2>
        {/* found in parseProposalData */}
        <div className="mt-6">
          <ApprovedTransactions
            proposalData={{
              options: parsedTransactions,
            }}
            proposalType="APPROVAL"
            executedTransactionHash={"https://etherscan.io/tx/0x123"}
          />
        </div>
        {proposalDraft.proposal_type === "social" && (
          <div>
            <h3 className="font-semibold mt-6">Voting strategy</h3>
            <p className="text-agora-stone-700 mt-2">
              {proposalDraft.proposal_social_type}
            </p>
            <h3 className="font-semibold mt-6">Voting start</h3>
            <p className="text-agora-stone-700 mt-2">
              {proposalDraft.start_date_social?.toString()}
            </p>
            <h3 className="font-semibold mt-6">Voting end</h3>
            <p className="text-agora-stone-700 mt-2">
              {proposalDraft.end_date_social?.toString()}
            </p>
            <h3 className="font-semibold mt-6 mb-2">Voting options</h3>
            {proposalDraft.social_options.map((option, index) => (
              <p className="text-agora-stone-700" key={`draft-${index}`}>
                {option.text}
              </p>
            ))}
          </div>
        )}

        <h3 className="font-semibold mt-6">Description</h3>
        <p className="text-agora-stone-700 mt-2">{proposalDraft.description}</p>
        <h3 className="font-semibold mt-6">Abstract</h3>
        <p className="text-agora-stone-700 mt-2">{proposalDraft.abstract}</p>
      </FormCard.Section>
      <FormCard.Section className="!z-0">
        {proposalDraft.sponsor_address ? (
          <>
            <p className="text-agora-stone-700">
              Your proposal is awaiting{" "}
              <span className="font-mono text-xs border border-yellow-500 text-yellow-700 bg-yellow-100 p-1 rounded">
                {proposalDraft.sponsor_address}
              </span>
              's sponsorship. Once your sponsor approves, your proposal will be
              automatically submitted, without needing your input. In the
              meantime, you can contact your sponsor by copying the link below.
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
            {actions}
          </>
        )}
        {/* <div className="mt-6">
            {SUBMISSION_CHECKLIST_ITEMS.map((item, index) => {
              return (
                <div
                  className="first-of-type:rounded-t-xl first-of-type:border-t border-x border-b last-of-type:rounded-b-xl p-4 flex flex-row items-center space-x-4"
                  key={`checklist-${index}`}
                >
                  <p className="flex-grow">{item.title}</p>
                  <span className="text-stone-500 font-mono text-xs">
                    on {item.date}
                  </span>
                  <span className="text-stone-500 font-mono text-xs">
                    (by {item.completedBy})
                  </span>
                  <input
                    type="checkbox"
                    className="rounded text-agora-stone-900"
                    checked
                  />
                  <Image
                    src={icons.link}
                    height="16"
                    width="16"
                    alt="link icon"
                  />
                </div>
              );
            })}
          </div> */}
      </FormCard.Section>
    </FormCard>
  );
};

export default DraftPreview;
