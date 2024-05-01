import React from "react";
import { VStack } from "@/components/Layout/Stack";
import styles from "./delegateVotes.module.scss";
import Link from "next/link";

function VoteDetailsContainer({ children, proposalId }) {
  return (
    <Link
      href={`/proposals/${proposalId}`}
      title={`Prop ${proposalId}`}
      className="block"
    >
      <VStack gap={3} className={styles.vote_details_container}>
        {children}
      </VStack>
    </Link>
  );
}

export default VoteDetailsContainer;
