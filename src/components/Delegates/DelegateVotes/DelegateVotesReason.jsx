import React from "react";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";
import { VStack } from "@/components/Layout/Stack";

function VoteReason({ reason }) {
  return (
    <>
      <div
        className={css`
          width: ${theme.spacing.px};
          background: #ebebeb;

          @media (max-width: ${theme.maxWidth["2xl"]}) {
            display: none;
          }
        `}
      />

      <VStack
        className={css`
          overflow-y: scroll;
          overflow-x: scroll;
          padding: ${theme.spacing["4"]} ${theme.spacing["6"]};

          @media (max-width: ${theme.maxWidth["2xl"]}) {
            padding-top: 0;
            height: fit-content;
          }
        `}
      >
        <pre
          className={css`
            font-family: ${theme.fontFamily.sans};
            font-size: ${theme.fontSize.xs};
            font-weight: ${theme.fontWeight.medium};
            white-space: pre-wrap;
            color: #66676b;
            width: fit-content;
          `}
        >
          {reason}
        </pre>
      </VStack>
    </>
  );
}

export default VoteReason;
