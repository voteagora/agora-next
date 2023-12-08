"use client";
import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./castVoteInput.module.scss";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAgoraContext } from "@/app/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";

export default function CastVoteInput({
  proposal,
  fetchVotingPower,
  fetchAuthorityChains,
}) {
  const [reason, setReason] = useState("");
  const [votingPower, setVotingPower] = useState("0");
  const [chains, setChains] = useState([]);

  const { address } = useAccount();

  useEffect(() => {
    if (address && proposal.snapshotBlockNumber) {
      fetchVotingPower(address, proposal.snapshotBlockNumber).then(
        ({ votingPower }) => {
          setVotingPower(votingPower);
        }
      );

      fetchAuthorityChains(address, proposal.snapshotBlockNumber).then(
        ({ chains }) => {
          setChains(chains);
        }
      );
    }
  }, [
    address,
    proposal.snapshotBlockNumber,
    fetchVotingPower,
    fetchAuthorityChains,
  ]);

  return (
    <VStack className={styles.cast_vote_container}>
      <textarea
        placeholder="I believe..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <VStack
        justifyContent="stretch"
        alignItems="stretch"
        className={styles.vote_actions}
      >
        <VoteButtons
          onClick={(supportType) => onVoteClick(supportType, reason)}
          proposalStatus={proposal.status}
        />
      </VStack>
    </VStack>
  );
}

function VoteButtons({ onClick, proposalStatus }) {
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

  //   const hasVoted = !!delegate.votes.find((it) => it.proposal.id === result.id);
  //   if (hasVoted) {
  //     return <DisabledVoteButton reason="Already voted" />;
  //   }

  return (
    <HStack gap={2} className="pt-1">
      {["FOR", "AGAINST", "ABSTAIN"].map((supportType) => (
        <VoteButton
          key={supportType}
          action={supportType}
          onClick={() => {
            onClick(supportType);
          }}
        />
      ))}
    </HStack>
  );
}

function VoteButton({ action, onClick }) {
  const className = `${styles["vote_button_" + action.toLowerCase()]}`;

  return (
    <button className={className} onClick={onClick}>
      {action.toLowerCase()}
    </button>
  );
}

function DisabledVoteButton({ reason }) {
  return (
    <button disabled className={styles.vote_button_disabled}>
      {reason}
    </button>
  );
}

// export function ConnectWalletButton({ reason }) {
//   return (
//     <button
//     <ConnectKitButton.Custom>
//       {({ show }) => (
//         <div className={styles.vote_button_connect} onClick={show}>
//           {reason}
//         </div>
//       )}
//     </ConnectKitButton.Custom>
//   );
// }
