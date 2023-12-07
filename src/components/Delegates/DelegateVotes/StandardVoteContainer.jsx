import React from "react";
import { pluralizeVote } from "@/lib/tokenUtils";
import styles from "./delegateVotes.module.scss";

function StandardVoteContainer({ support, weight }) {
  return (
    <span
      className={styles.standard_container + ` vote_${support.toLowerCase()}`}
    >
      <span className="capitalize">{support.toLowerCase()}</span> with{" "}
      {pluralizeVote(weight, "optimism")}
    </span>
  );
}

export default StandardVoteContainer;
