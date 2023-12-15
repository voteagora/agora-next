import React from "react";
import { VStack } from "@/components/Layout/Stack";
import styles from "./delegateVotes.module.scss";

function VoteReason({ reason }) {
  return (
    <>
      <div className={styles.vote_reason} />

      <VStack className={styles.vote_reason_container}>
        <pre>{reason}</pre>
      </VStack>
    </>
  );
}

export default VoteReason;
