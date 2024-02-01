import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalPage.module.scss";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import {
  getVotesForProposalAndDelegate,
  getVotesForProposal,
  getAllForVoting,
  getUserVotesForProposal,
} from "@/app/api/votes/getVotes";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import {
  getProxy,
  getVotingPowerAtSnapshot,
  getVotingPowerAvailableForDirectDelegation,
  getVotingPowerAvailableForSubdelegation,
  isDelegatingToProxy,
} from "@/app/api/voting-power/getVotingPower";
import { getAuthorityChains } from "@/app/api/authority-chains/getAuthorityChains";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { getDelegateStatement } from "@/app/api/delegateStatement/getDelegateStatement";
import { getVotableSupply } from "@/app/api/votableSupply/getVotableSupply";
import { cn, formatNumber } from "@/lib/utils";
import { disapprovalThreshold } from "@/lib/constants";
import {
  getCurrentDelegatees,
  getCurrentDelegators,
  getDirectDelegatee,
} from "@/app/api/delegations/getDelegations";
import OpManagerDeleteProposal from "./OpManagerDeleteProposal";
import { formatUnits } from "ethers";

async function fetchProposalVotes(proposal_id, page = 1) {
  "use server";

  return getVotesForProposal({ proposal_id, page });
}

async function fetchVotingPower(address, blockNumber) {
  "use server";

  return getVotingPowerAtSnapshot({
    blockNumber,
    addressOrENSName: address,
  });
}

async function fetchAuthorityChains(address, blockNumber) {
  "use server";

  return {
    chains: await getAuthorityChains({ blockNumber, address }),
  };
}

async function fetchDelegate(addressOrENSName) {
  "use server";

  return await getDelegate({
    addressOrENSName,
  });
}

async function fetchVotesForProposalAndDelegate(proposal_id, address) {
  "use server";

  return await getVotesForProposalAndDelegate({
    proposal_id,
    address,
  });
}

async function fetchUserVotesForProposal(proposal_id, address) {
  "use server";

  return await getUserVotesForProposal({
    proposal_id,
    address,
  });
}

async function fetchVotableSupply() {
  "use server";

  return getVotableSupply();
}

async function fetchDelegateStatement(addressOrENSName) {
  "use server";

  return await getDelegateStatement({
    addressOrENSName,
  });
}

async function fetchBalanceForDirectDelegation(addressOrENSName) {
  "use server";

  return getVotingPowerAvailableForDirectDelegation({ addressOrENSName });
}

async function fetchVotingPowerForSubdelegation(addressOrENSName) {
  "use server";

  return getVotingPowerAvailableForSubdelegation({ addressOrENSName });
}

async function checkIfDelegatingToProxy(addressOrENSName) {
  "use server";

  return isDelegatingToProxy({ addressOrENSName });
}

async function fetchCurrentDelegatees(addressOrENSName) {
  "use server";

  return getCurrentDelegatees({ addressOrENSName });
}

async function fetchDirectDelegatee(addressOrENSName) {
  "use server";

  return getDirectDelegatee({ addressOrENSName });
}

async function getProxyAddress(addressOrENSName) {
  "use server";

  return getProxy({ addressOrENSName });
}

async function getDelegators(addressOrENSName) {
  "use server";

  return getCurrentDelegators({ addressOrENSName });
}

async function fetchAllForVoting(address, blockNumber, proposal_id) {
  "use server";

  return await getAllForVoting(address, blockNumber, proposal_id);
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
              <div
                className={cn(styles.proposal_votes_summary_container, "!py-4")}
              >
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
              </div>
            </div>
            {/* Show the scrolling list of votes for the proposal */}
            <ProposalVotesList
              initialProposalVotes={proposalVotes}
              fetchVotesForProposal={fetchProposalVotes}
              fetchDelegate={fetchDelegate}
              fetchDelegateStatement={fetchDelegateStatement}
              fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
              fetchVotingPowerForSubdelegation={
                fetchVotingPowerForSubdelegation
              }
              checkIfDelegatingToProxy={checkIfDelegatingToProxy}
              fetchCurrentDelegatees={fetchCurrentDelegatees}
              fetchDirectDelegatee={fetchDirectDelegatee}
              fetchUserVotes={fetchUserVotesForProposal}
              getProxyAddress={getProxyAddress}
              proposal_id={proposal.id}
              getDelegators={getDelegators}
            />
            {/* Show the input for the user to vote on a proposal if allowed */}
            <CastVoteInput
              proposal={proposal}
              fetchAllForVoting={fetchAllForVoting}
              isOptimistic
            />
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
