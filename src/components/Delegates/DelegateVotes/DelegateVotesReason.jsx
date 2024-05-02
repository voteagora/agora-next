import React from "react";
import { VStack } from "@/components/Layout/Stack";
import styles from "./delegateVotes.module.scss";

function VoteReason({ reason }) {
  return (
    <VStack className={styles.vote_reason_container}>Reason: {reason}</VStack>
  );
}

export default VoteReason;
