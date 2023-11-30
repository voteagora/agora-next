"use client";
import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./castVoteInput.module.scss";
import { useState } from "react";

export default function CastVoteInput({ proposal }) {
  const [reason, setReason] = useState("");
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
  if (proposalStatus !== "ACTIVE") {
    return <DisabledVoteButton reason="Not open to voting" />;
  }

  //   if (!delegate) {
  //     return <ConnectWalletButton reason="Connect wallet to vote" />;
  //   }
  //   const hasVoted = !!delegate.votes.find((it) => it.proposal.id === result.id);
  //   if (hasVoted) {
  //     return <DisabledVoteButton reason="Already voted" />;
  //   }

  return (
    <HStack gap={2}>
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
