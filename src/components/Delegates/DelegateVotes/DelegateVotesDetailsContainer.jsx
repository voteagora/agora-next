import React from "react";
import { VStack } from "@/components/Layout/Stack";
import styles from "./delegateVotes.module.scss";

function VoteDetailsContainer({ children }) {
  return (
    <VStack gap={3} className={styles.vote_details_container}>
      {children}
    </VStack>
  );
}

export default VoteDetailsContainer;
