import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalPage.module.scss";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import {
  getVoteForProposalAndDelegate,
  getVotesForProposal,
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
import {
  getDelegate,
  getDelegateStatement,
} from "@/app/api/delegates/getDelegates";
import {
  getCurrentDelegatees,
  getCurrentDelegators,
  getDirectDelegatee,
} from "@/app/api/delegations/getDelegations";
import { Proposal } from "@/app/api/proposals/proposal";

async function fetchProposalVotes(proposal_id: string, page = 1) {
  "use server";

  return await getVotesForProposal({ proposal_id, page });
}

async function fetchVotingPower(
  addressOrENSName: string | `0x${string}`,
  blockNumber: number
) {
  "use server";

  return {
    votingPower: (
      await getVotingPowerAtSnapshot({ blockNumber, addressOrENSName })
    ).totalVP,
  };
}

// Pass address of the connected wallet
async function fetchBalanceForDirectDelegation(
  addressOrENSName: string | `0x${string}`
) {
  "use server";

  return getVotingPowerAvailableForDirectDelegation({ addressOrENSName });
}

async function fetchAuthorityChains(
  address: string | `0x${string}`,
  blockNumber: number
) {
  "use server";

  return {
    chains: await getAuthorityChains({
      blockNumber,
      address,
    }),
  };
}

async function fetchDelegate(addressOrENSName: string | `0x${string}`) {
  "use server";

  return await getDelegate({
    addressOrENSName,
  });
}

async function fetchDelegateStatement(
  addressOrENSName: string | `0x${string}`
) {
  "use server";

  return await getDelegateStatement({
    addressOrENSName,
  });
}

async function fetchVoteForProposalAndDelegate(
  proposal_id: string,
  address: string | `0x${string}`
) {
  "use server";

  return await getVoteForProposalAndDelegate({
    proposal_id,
    address,
  });
}

async function fetchVotingPowerForSubdelegation(
  addressOrENSName: string | `0x${string}`
) {
  "use server";

  return getVotingPowerAvailableForSubdelegation({ addressOrENSName });
}

async function checkIfDelegatingToProxy(
  addressOrENSName: string | `0x${string}`
) {
  "use server";

  return isDelegatingToProxy({ addressOrENSName });
}

async function fetchCurrentDelegatees(
  addressOrENSName: string | `0x${string}`
) {
  "use server";

  return getCurrentDelegatees({ addressOrENSName });
}

async function fetchDirectDelegatee(addressOrENSName: string | `0x${string}`) {
  "use server";

  return getDirectDelegatee({ addressOrENSName });
}

async function getProxyAddress(addressOrENSName: string | `0x${string}`) {
  "use server";

  return getProxy({ addressOrENSName });
}

async function getDelegators(addressOrENSName: string | `0x${string}`) {
  "use server";

  return getCurrentDelegators({ addressOrENSName });
}

export default async function OPProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalVotes = await fetchProposalVotes(proposal.id);

  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <HStack
      gap={16}
      justifyContent="justify-between"
      alignItems="items-start"
      className={styles.proposal_container}
    >
      <ProposalDescription proposal={proposal} />
      <VStack
        gap={4}
        justifyContent="justify-between"
        className={styles.proposal_votes_container}
      >
        <VStack gap={4} className={styles.proposal_actions_panel}>
          <div>
            <div className={styles.proposal_header}>Proposal votes</div>
            {/* Show the summar bar with For, Against, Abstain */}
            <ProposalVotesSummary proposal={proposal} />
          </div>
          {/* Show the scrolling list of votes for the proposal */}
          <ProposalVotesList
            initialProposalVotes={proposalVotes}
            fetchVotesForProposal={fetchProposalVotes}
            fetchDelegate={fetchDelegate}
            fetchDelegateStatement={fetchDelegateStatement}
            fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
            fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
            checkIfDelegatingToProxy={checkIfDelegatingToProxy}
            fetchCurrentDelegatees={fetchCurrentDelegatees}
            fetchDirectDelegatee={fetchDirectDelegatee}
            getProxyAddress={getProxyAddress}
            proposal_id={proposal.id}
            getDelegators={getDelegators}
          />
          {/* Show the input for the user to vote on a proposal if allowed */}
          <CastVoteInput
            proposal={proposal}
            fetchVotingPower={fetchVotingPower}
            fetchAuthorityChains={fetchAuthorityChains}
            fetchDelegate={fetchDelegate}
            fetchVoteForProposalAndDelegate={fetchVoteForProposalAndDelegate}
          />
        </VStack>
      </VStack>
    </HStack>
  );
}
