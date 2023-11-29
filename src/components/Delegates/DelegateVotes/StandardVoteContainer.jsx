import React from "react";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import { colorForSupportType } from "@/lib/voteUtils";
import { pluralizeVote } from "@/lib/tokenUtils";

function StandardVoteContainer({ support, weight }) {
  return (
    <span
      className={css`
        color: ${colorForSupportType(support)};
        font-size: ${theme.fontSize.xs};
        font-weight: ${theme.fontWeight.medium};
      `}
    >
      <span
        className={css`
          text-transform: capitalize;
        `}
      >
        {support.toLowerCase()}
      </span>{" "}
      with {pluralizeVote(weight, "optimism")}
    </span>
  );
}

export default StandardVoteContainer;
