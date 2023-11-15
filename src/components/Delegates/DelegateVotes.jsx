"use client";

import * as React from "react";
import { VStack } from "../Layout/Stack";
import { css } from "@emotion/css";
import * as theme from "@/lib/theme";
import { colorForSupportType } from "@/lib/proposalUtils";
import { pluralizeVote } from "@/lib/tokenUtils";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DelegateVotes({ initialVotes, fetchDelegateVotes }) {
  // const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialVotes]);
  // const [meta, setMeta] = React.useState(initialVotes.meta);

  const loadMore = async (page) => {
    // if (!fetching.current && page <= meta.total_pages) {
    //   fetching.current = true;
    //   const data = await fetchDelegateVotes(page);
    //   const existingIds = new Set(delegateVotes.map((v) => v.id));
    //   const uniqueDelegateVotes = data.delegateVotes.filter(
    //     (p) => !existingIds.has(p.id)
    //   );
    //   setPages((prev) => [
    //     ...prev,
    //     { ...data, delegateVotes: uniqueDelegateVotes },
    //   ]);
    //   setMeta(data.meta);
    //   fetching.current = false;
    // }
  };

  const delegateVotes = pages.reduce(
    (all, page) => all.concat(page.delegateVotes),
    []
  );

  return (
    <VStack gap="4">
      {delegateVotes.map(
        (vote, voteIdx) =>
          vote && (
            <VoteDetailsContainer key={voteIdx}>
              <div
                className={css`
                  display: grid;
                  overflow-y: hidden;
                  grid-template-columns: 1fr 1px 1fr;

                  @media (max-width: ${theme.maxWidth["2xl"]}) {
                    grid-template-rows: 1fr;
                    grid-template-columns: none;
                    overflow-y: scroll;
                  }
                `}
              >
                {vote.proposalType === "APPROVAL" && (
                  <ApprovalVoteContainer {...vote} />
                )}
                {vote.proposalType === "STANDARD" && (
                  <StandardVoteContainer {...vote} />
                )}
                {vote.reason && <VoteReason reason={vote.reason} />}
              </div>
            </VoteDetailsContainer>
          )
      )}
    </VStack>
  );
}

function VoteDetailsContainer({ children }) {
  return (
    <VStack
      gap="3"
      className={css`
        border-radius: ${theme.borderRadius.lg};
        border-width: ${theme.spacing.px};
        border-color: ${theme.colors.gray.eb};
        background: ${theme.colors.white};
        box-shadow: ${theme.shadow};
        max-height: 15rem;
      `}
    >
      {children}
    </VStack>
  );
}

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
        {support}
      </span>{" "}
      with {pluralizeVote(weight, "optimism")}
    </span>
  );
}

function ApprovalVoteContainer({ params, support, weight }) {
  return (
    <div
      className={css`
        font-size: ${theme.fontSize.xs};
        font-weight: ${theme.fontWeight.medium};
        color: #66676b;
      `}
    >
      Voted :{" "}
      {params?.map((option, i) => (
        <>
          {option}
          {/* add a coma here if not last option */}
          {i !== params.length - 1 && ", "}
        </>
      ))}
      {params?.length === 0 && "Abstain"}
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
