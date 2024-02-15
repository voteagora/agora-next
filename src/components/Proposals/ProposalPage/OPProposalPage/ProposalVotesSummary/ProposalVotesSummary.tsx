import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./proposalVotesSummary.module.scss";
import ProposalTimeStatus from "@/components/Proposals/Proposal/ProposalTimeStatus";
import ProposalVotesBar from "../ProposalVotesBar/ProposalVotesBar";
import { Proposal } from "@/app/api/common/proposals/proposal";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import { formatDistanceToNowStrict } from "date-fns";

export default function ProposalVotesSummary({
  proposal,
}: {
  proposal: Proposal;
}) {
  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];
  return (
    <VStack gap={2} className={styles.proposal_votes_summary_container}>
      <HStack justifyContent="justify-between" className="mt-2">
        <div className="gl_votes_for">
          FOR{" "}
          <TokenAmountDisplay
            amount={results.for}
            decimals={18}
            currency={"OP"}
          />
        </div>
        <div className="gl_votes_against">
          AGAINST{" "}
          <TokenAmountDisplay
            amount={results.against}
            decimals={18}
            currency={"OP"}
          />
        </div>
      </HStack>
      <ProposalVotesBar proposal={proposal} />
      <VStack className="font-medium">
        <HStack justifyContent="justify-between" className="text-gray-4f pb-2">
          <>
            {proposal.quorum && (
              <div>
                Quorum{" "}
                <TokenAmountDisplay
                  amount={proposal.quorum}
                  decimals={18}
                  currency={"OP"}
                />
              </div>
            )}
          </>
          <>
            {proposal.quorum && (
              <div>
                <p>{`Threshold ${
                  Number(proposal.approvalThreshold) / 100
                }%`}</p>
              </div>
            )}
          </>
        </HStack>
        <HStack
          justifyContent="justify-between"
          alignItems="items-center"
          className="bg-gray-fa border-t -mx-4 px-4 py-2 text-gray-4f rounded-b-md"
        >
          <div>
            {proposal.status === "ACTIVE" && (
              <p className="text-blue-600 bg-sky-200 rounded-sm px-1 py-0.5 font-semibold">
                ACTIVE
              </p>
            )}
            {proposal.status === "SUCCEEDED" && (
              <p className="text-green-600 bg-green-200 rounded-sm px-1 py-0.5 font-semibold">
                SUCCEEDED
              </p>
            )}
            {proposal.status === "DEFEATED" && (
              <p className="text-red-600 bg-red-200 rounded-sm px-1 py-0.5 font-semibold">
                DEFEATED
              </p>
            )}
          </div>
          <div>
            {proposal.end_time && proposal.status === "ACTIVE" && (
              <HStack gap={1}>
                <p>{`Ends in ${formatDistanceToNowStrict(
                  proposal.end_time
                )} at ${proposal.end_time.toLocaleTimeString("en-US")}`}</p>
              </HStack>
            )}
            {proposal.end_time &&
              proposal.status !== "PENDING" &&
              proposal.status !== "ACTIVE" && (
                <HStack gap={1}>
                  <p>{`Ended ${formatDistanceToNowStrict(
                    proposal.end_time
                  )} ago on ${proposal.end_time.toLocaleDateString()}`}</p>
                </HStack>
              )}
          </div>
        </HStack>
      </VStack>
    </VStack>
  );
}
