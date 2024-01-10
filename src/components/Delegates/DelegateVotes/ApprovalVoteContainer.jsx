import React, { Fragment } from "react";
import { pluralizeVote } from "@/lib/tokenUtils";
import styles from "./delegateVotes.module.scss";

function ApprovalVoteContainer({ params, support, weight }) {
  return (
    <div className={styles.container}>
      {params?.length > 1 && "Voted: "}
      {params?.map((option, i) => (
        <Fragment key={option}>
          {option}
          {/* add a coma here if not last option */}
          {i !== params.length - 1 && ", "}
        </Fragment>
      ))}
      {(!params || params?.length === 0) && "Abstain"}
      <span className={styles.vote + ` vote_${support.toLowerCase()}`}>
        {" "}
        with {pluralizeVote(weight, "optimism")}
      </span>
    </div>
  );
}

export default ApprovalVoteContainer;
