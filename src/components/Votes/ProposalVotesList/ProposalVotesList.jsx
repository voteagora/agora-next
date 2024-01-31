"use client";

import * as React from "react";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./proposalVotesList.module.scss";
import { VStack, HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import Image from "next/image";
import VoteText from "../VoteText/VoteText";
import VoterHoverCard from "../VoterHoverCard";
import useIsAdvancedUser from "@/app/lib/hooks/useIsAdvancedUser";
import { useAccount } from "wagmi";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function ProposalVotesList({
  initialProposalVotes,
  fetchVotesForProposal,
  fetchDelegate,
  fetchDelegateStatement,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  fetchDirectDelegatee,
  fetchUserVotes,
  getProxyAddress,
  proposal_id,
  getDelegators,
}) {
  const { address: connectedAddress } = useAccount();
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialProposalVotes] || []);
  const [meta, setMeta] = React.useState(initialProposalVotes.meta);
  const [delegators, setDelegators] = React.useState(null);
  const [userVotes, setUserVotes] = React.useState([]);

  const fetchDelegatorsAndSet = async (addressOrENSName) => {
    let fetchedDelegators;
    try {
      fetchedDelegators = await getDelegators(addressOrENSName);
    } catch (error) {
      fetchedDelegators = null;
    }
    setDelegators(fetchedDelegators);
  };

  const fetchUserVoteAndSet = async (proposal_id, address) => {
    let fetchedUserVotes;
    try {
      fetchedUserVotes = await fetchUserVotes(proposal_id, address);
    } catch (error) {
      fetchedUserVotes = [];
    }
    setUserVotes(fetchedUserVotes);
  };

  const loadMore = async (page) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchVotesForProposal(proposal_id, page);
      const existingIds = new Set(proposalVotes.map((v) => v.transactionHash));
      const uniqueVotes = data.votes.filter(
        (v) => !existingIds.has(v.transactionHash)
      );
      setPages((prev) => [...prev, { ...data, votes: uniqueVotes }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const proposalVotes = pages.reduce((all, page) => all.concat(page.votes), []);

  const { isAdvancedUser } = useIsAdvancedUser();

  React.useEffect(() => {
    if (connectedAddress) {
      fetchDelegatorsAndSet(connectedAddress);
      fetchUserVoteAndSet(proposal_id, connectedAddress);
    } else {
      setDelegators(null);
      setUserVotes([]);
    }
  }, [connectedAddress]);

  return (
    <div className={styles.vote_container}>
      <InfiniteScroll
        hasMore={meta.hasNextPage}
        pageStart={1}
        loadMore={loadMore}
        useWindow={false}
        loader={
          <div className="flex text-xs font-medium text-stone-500" key={0}>
            Loading more votes...
          </div>
        }
        element="main"
      >
        <ul className="flex flex-col">
          {userVotes.map((vote) => (
            <li key={vote.transactionHash}>
              <SingleVote
                vote={vote}
                fetchDelegate={fetchDelegate}
                fetchDelegateStatement={fetchDelegateStatement}
                fetchBalanceForDirectDelegation={
                  fetchBalanceForDirectDelegation
                }
                fetchVotingPowerForSubdelegation={
                  fetchVotingPowerForSubdelegation
                }
                checkIfDelegatingToProxy={checkIfDelegatingToProxy}
                fetchCurrentDelegatees={fetchCurrentDelegatees}
                fetchDirectDelegatee={fetchDirectDelegatee}
                getProxyAddress={getProxyAddress}
                isAdvancedUser={isAdvancedUser}
                delegators={delegators}
              />
            </li>
          ))}
          {proposalVotes.map((vote) => (
            <li
              key={vote.transactionHash}
              className={`${
                connectedAddress?.toLowerCase() === vote.address && "hidden"
              }`}
            >
              <SingleVote
                vote={vote}
                fetchDelegate={fetchDelegate}
                fetchDelegateStatement={fetchDelegateStatement}
                fetchBalanceForDirectDelegation={
                  fetchBalanceForDirectDelegation
                }
                fetchVotingPowerForSubdelegation={
                  fetchVotingPowerForSubdelegation
                }
                checkIfDelegatingToProxy={checkIfDelegatingToProxy}
                fetchCurrentDelegatees={fetchCurrentDelegatees}
                fetchDirectDelegatee={fetchDirectDelegatee}
                getProxyAddress={getProxyAddress}
                isAdvancedUser={isAdvancedUser}
                delegators={delegators}
              />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  );
}

function SingleVote({
  vote,
  fetchDelegate,
  fetchDelegateStatement,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  fetchDirectDelegatee,
  getProxyAddress,
  isAdvancedUser,
  delegators,
}) {
  const { address: connectedAddress } = useAccount();

  return (
    <VStack key={vote.transactionHash} gap={2} className={styles.vote_row}>
      <VStack>
        <HoverCard openDelay={100} closeDelay={100}>
          <HoverCardTrigger>
            <HStack justifyContent="justify-between" className={styles.voter}>
              <HStack gap={1} alignItems="items-center">
                <HumanAddress address={vote.address} />
                {vote.address === connectedAddress?.toLowerCase() && (
                  <p>(you)</p>
                )}
                <VoteText support={vote.support} />
              </HStack>
              <HStack alignItems="items-center" className={styles.vote_weight}>
                <TokenAmountDisplay
                  amount={vote.weight}
                  decimals={18}
                  currency="OP"
                />
              </HStack>
            </HStack>
          </HoverCardTrigger>
          <HoverCardContent
            className="w-full shadow"
            side="left"
            sideOffset="3"
          >
            <VoterHoverCard
              address={vote.address}
              fetchDelegate={fetchDelegate}
              fetchDelegateStatement={fetchDelegateStatement}
              fetchBalanceForDirectDelegation={fetchBalanceForDirectDelegation}
              fetchVotingPowerForSubdelegation={
                fetchVotingPowerForSubdelegation
              }
              checkIfDelegatingToProxy={checkIfDelegatingToProxy}
              fetchCurrentDelegatees={fetchCurrentDelegatees}
              fetchDirectDelegatee={fetchDirectDelegatee}
              getProxyAddress={getProxyAddress}
              isAdvancedUser={isAdvancedUser}
              delegators={delegators}
            />
          </HoverCardContent>
        </HoverCard>
      </VStack>
      <pre className={styles.vote_reason}>{vote.reason}</pre>
    </VStack>
  );
}
