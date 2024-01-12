"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./castVoteInput.module.scss";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Proposal } from "@/app/api/proposals/proposal";
import { Delegate } from "@/app/api/delegates/delegate";
import { Vote } from "@/app/api/votes/vote";
import { SupportTextProps } from "@/components/Proposals/ProposalPage/CastVoteDialog/CastVoteDialog";
import { VotingPowerData } from "@/app/api/voting-power/votingPower";
import { fetchAndSet, fetchAndSetAll } from "@/lib/utils";
import { checkIfVoted } from "@/lib/voteUtils";

type Props = {
  proposal: Proposal;
  fetchVotingPower: (
    addressOrENSName: string | `0x${string}`,
    blockNumber: number
  ) => Promise<VotingPowerData>;
  fetchAuthorityChains: (
    address: string | `0x${string}`,
    blockNumber: number
  ) => Promise<{ chains: string[][] }>;
  fetchDelegate: (
    addressOrENSName: string | `0x${string}`
  ) => Promise<Delegate>;
  fetchVotesForProposalAndDelegate: (
    proposal_id: string,
    address: string | `0x${string}`
  ) => Promise<Vote[]>;
  isOptimistic?: boolean;
};

export default function CastVoteInput({
  proposal,
  fetchVotingPower,
  fetchAuthorityChains,
  fetchDelegate,
  fetchVotesForProposalAndDelegate,
  isOptimistic = false,
}: Props) {
  const [reason, setReason] = useState("");
  const [votingPower, setVotingPower] = useState<VotingPowerData>({
    directVP: "0",
    advancedVP: "0",
    totalVP: "0",
  });
  const [delegate, setDelegate] = useState({});
  const [chains, setChains] = useState<string[][]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isReady, setIsReady] = useState(false);
  const openDialog = useOpenDialog();

  const { address } = useAccount();

  const fetchData = useCallback(async () => {
    try {
      await fetchAndSetAll(
        [
          () => fetchVotingPower(address!, proposal.snapshotBlockNumber),
          () => fetchDelegate(address!),
          async () =>
            (
              await fetchAuthorityChains(address!, proposal.snapshotBlockNumber)
            ).chains,
          () => fetchVotesForProposalAndDelegate(proposal.id, address!),
        ],
        [setVotingPower, setDelegate, setChains, setVotes]
      );

      setIsReady(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [
    fetchVotingPower,
    fetchDelegate,
    fetchAuthorityChains,
    address,
    proposal,
    fetchVotesForProposalAndDelegate,
  ]);

  useEffect(() => {
    if (address && proposal.snapshotBlockNumber) {
      fetchData();
    }
  }, [fetchData, address, proposal.snapshotBlockNumber]);

  return (
    <VStack className={styles.cast_vote_container}>
      <textarea
        placeholder="I believe..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="text-sm"
      />
      <VStack
        justifyContent="justify-between"
        alignItems="items-stretch"
        className={styles.vote_actions}
      >
        <VoteButtons
          onClick={(supportType: SupportTextProps["supportType"]) =>
            openDialog({
              type: "CAST_VOTE",
              params: {
                reason,
                supportType,
                proposalId: proposal.id,
                delegate,
                votingPower,
                authorityChains: chains,
              },
            })
          }
          proposalStatus={proposal.status}
          delegateVotes={votes}
          isReady={isReady}
          isOptimistic={isOptimistic}
          votingPower={votingPower}
        />
      </VStack>
    </VStack>
  );
}

function VoteButtons({
  onClick,
  proposalStatus,
  delegateVotes,
  isReady,
  isOptimistic,
  votingPower,
}: {
  onClick: (supportType: SupportTextProps["supportType"]) => void;
  proposalStatus: Proposal["status"];
  delegateVotes: Vote[];
  isReady: boolean;
  isOptimistic: boolean;
  votingPower: VotingPowerData;
}) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();

  if (proposalStatus !== "ACTIVE") {
    return <DisabledVoteButton reason="Not open to voting" />;
  }

  if (!isConnected) {
    return (
      <Button variant={"outline"} onClick={() => setOpen(true)}>
        Connect wallet to vote
      </Button>
    );
  }

  if (!isReady) {
    return <DisabledVoteButton reason="Loading..." />;
  }

  const hasVoted = checkIfVoted(delegateVotes, votingPower);

  if (hasVoted) {
    return <DisabledVoteButton reason="Already voted" />;
  }

  return (
    <HStack gap={2} className="pt-1">
      {(isOptimistic ? ["AGAINST"] : ["FOR", "AGAINST", "ABSTAIN"]).map(
        (supportType) => (
          <VoteButton
            key={supportType}
            action={supportType as SupportTextProps["supportType"]}
            onClick={() => {
              onClick(supportType as SupportTextProps["supportType"]);
            }}
          />
        )
      )}
    </HStack>
  );
}

function VoteButton({
  action,
  onClick,
}: {
  action: SupportTextProps["supportType"];
  onClick: () => void;
}) {
  const className = `${styles["vote_button_" + action.toLowerCase()]}`;

  return (
    <button className={className} onClick={onClick}>
      {action.toLowerCase()}
    </button>
  );
}

function DisabledVoteButton({ reason }: { reason: string }) {
  return (
    <button disabled className={styles.vote_button_disabled}>
      {reason}
    </button>
  );
}
