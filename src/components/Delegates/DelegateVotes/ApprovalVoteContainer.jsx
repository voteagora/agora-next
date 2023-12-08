import React, { Fragment } from "react";
import { css } from "@emotion/css";
import { colorForSupportType } from "@/lib/voteUtils";
import * as theme from "@/styles/theme";
import { pluralizeVote } from "@/lib/tokenUtils";

function ApprovalVoteContainer({ params, support, weight }) {
  return (
    <div
      className={css`
        font-size: ${theme.fontSize.xs};
        font-weight: ${theme.fontWeight.medium};
        color: #66676b;
      `}
    >
      {params?.length > 1 && "Voted: "}
      {params?.map((option, i) => (
        <Fragment key={option}>
          {option}
          {/* add a coma here if not last option */}
          {i !== params.length - 1 && ", "}
        </Fragment>
      ))}
      {(!params || params?.length === 0) && "Abstain"}
      <span
        className={css`
          color: ${colorForSupportType(support)};
          font-size: ${theme.fontSize.xs};
          font-weight: ${theme.fontWeight.medium};
        `}
      >
        {" "}
        with {pluralizeVote(weight, "optimism")}
      </span>
    </div>
  );
}

export default ApprovalVoteContainer;
