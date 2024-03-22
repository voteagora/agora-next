import { fetchDelegate as apiFetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { fetchDelegateStatement as apiFetchDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import { fetchCurrentDelegators as apiFetchCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import { fetchVotableSupply as apiFetchVoteableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalTimeStatus from "@/components/Proposals/Proposal/ProposalTimeStatus";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import { disapprovalThreshold } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { formatUnits } from "ethers";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import OpManagerDeleteProposal from "./OpManagerDeleteProposal";
import styles from "./OPProposalPage.module.scss";

async function fetchProposalVotes(proposal_id, page = 1) {
  "use server";

  return fetchVotesForProposal({ proposal_id, page });
}

async function fetchDelegate(addressOrENSName) {
  "use server";

  return await apiFetchDelegate(addressOrENSName);
}

async function fetchUserVotesForProposal(proposal_id, address) {
  "use server";

  return await apiFetchUserVotesForProposal({
    proposal_id,
    address,
  });
}

async function fetchVotableSupply() {
  "use server";

  return apiFetchVoteableSupply();
}

async function fetchDelegateStatement(addressOrENSName) {
  "use server";

  return await apiFetchDelegateStatement(addressOrENSName);
}

async function fetchCurrentDelegators(addressOrENSName) {
  "use server";

  return apiFetchCurrentDelegators(addressOrENSName);
}

export default async function OPProposalPage({ proposal }) {
  const votableSupply = await fetchVotableSupply();
  const proposalVotes = await fetchProposalVotes(proposal.id);

  const formattedVotableSupply = Number(
    BigInt(votableSupply) / BigInt(10 ** 18)
  );
  const againstLengthString = formatNumber(
    proposal.proposalResults.against,
    18,
    0
  );
  const againstLength = Number(
    formatUnits(proposal.proposalResults.against, 18)
  );

  const againstRelativeAmount = parseFloat(
    ((againstLength / formattedVotableSupply) * 100).toFixed(2)
  );
  const status =
    againstRelativeAmount <= disapprovalThreshold ? "approved" : "defeated";

  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <HStack
      gap={16}
      justifyContent="justify-between"
      alignItems="items-start"
      className={styles.proposal_container}
    >
      <ProposalDescription proposal={proposal} />
      <div>
        <OpManagerDeleteProposal proposal={proposal} />
        <VStack
          gap={4}
          justifyContent="justify-between"
          className={styles.proposal_votes_container}
        >
          <VStack gap={4} className={styles.proposal_actions_panel}>
            <div>
              <div className={styles.proposal_header}>Proposal votes</div>
              <div className={styles.proposal_votes_summary_container}>
                {proposal.status === "CANCELLED" ? (
                  <p className="text-red-negative">
                    This proposal has been cancelled
                  </p>
                ) : (
                  <div>
                    <p
                      className={
                        status === "approved"
                          ? "text-green-positive"
                          : "text-red-negative"
                      }
                    >
                      This proposal is optimistically {status}
                    </p>

                    <p className="mt-1 font-normal text-gray-4f">
                      This proposal will automatically pass unless{" "}
                      {disapprovalThreshold}% of the votable supply of OP is
                      against. Currently {againstRelativeAmount}% (
                      {againstLengthString} OP) is against.
                    </p>
                  </div>
                )}
                <HStack className="bg-gray-fa border-t -mx-4 px-4 py-2 text-gray-4f rounded-b-md justify-end font-medium">
                  <ProposalTimeStatus
                    proposalStatus={proposal.status}
                    proposalEndTime={proposal.end_time}
                  />
                </HStack>
              </div>
            </div>
            {/* Show the scrolling list of votes for the proposal */}
            <ProposalVotesList
              initialProposalVotes={proposalVotes}
              fetchVotesForProposal={fetchProposalVotes}
              fetchDelegate={fetchDelegate}
              fetchDelegateStatement={fetchDelegateStatement}
              fetchUserVotes={fetchUserVotesForProposal}
              proposal_id={proposal.id}
              getDelegators={fetchCurrentDelegators}
            />
            {/* Show the input for the user to vote on a proposal if allowed */}
            <CastVoteInput proposal={proposal} isOptimistic />
            <p className="mx-4 text-xs text-gray-4f">
              If you agree with this proposal, you don’t need to vote. Only vote
              against if you oppose this proposal.
            </p>
          </VStack>
        </VStack>
      </div>
    </HStack>
  );
}
