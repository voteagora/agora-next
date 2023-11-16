"use client";

import * as theme from "@/styles/theme";
import { css } from "@emotion/css";
import { HStack, VStack } from "../Layout/Stack";
import { bpsToString, pluralizeAddresses } from "@/lib/utils";
import { DelegateProfileImage } from "./DelegateProfileImage";

export default function DelegateCard({ delegate }) {
  console.log(delegate);
  if (!delegate) {
    return null;
  }
  return (
    <VStack
      className={css`
        position: sticky;
        top: ${theme.spacing["16"]};
        flex-shrink: 0;
        width: ${theme.maxWidth.xs};

        @media (max-width: ${theme.maxWidth["6xl"]}) {
          position: static;
        }

        @media (max-width: ${theme.maxWidth.lg}) {
          width: 100%;
        }
      `}
    >
      <VStack
        className={css`
          background-color: ${theme.colors.white};
          border-radius: ${theme.spacing["3"]};
          border-width: ${theme.spacing.px};
          border-color: ${theme.colors.gray["300"]};
          box-shadow: ${theme.boxShadow.newDefault};
        `}
      >
        <VStack
          alignItems="stretch"
          className={css`
            padding: ${theme.spacing["6"]};
            border-bottom: ${theme.spacing.px} solid ${theme.colors.gray["300"]};
          `}
        >
          <DelegateProfileImage
            address={delegate.address}
            votingPower={delegate.votingPower}
          />
        </VStack>

        <div
          className={css`
            ${css`
              display: flex;
              flex-direction: column;
              padding: ${theme.spacing["6"]} ${theme.spacing["6"]};
            `};
          `}
        >
          <VStack gap="4">
            <PanelRow
              title="Proposals Voted"
              detail={
                !delegate.proposalsVotedOn
                  ? "N/A"
                  : `${delegate.proposalsVotedOn} (${bpsToString(
                      delegate.votingParticipation * 100
                    )})`
              }
            />

            <PanelRow
              title="For / Against / Abstain"
              detail={`${delegate.votedFor} / ${delegate.votedAgainst} / ${delegate.votedAbstain}`}
            />

            <PanelRow
              title="Vote Power"
              detail={
                <>
                  {bpsToString(
                    delegate.votingPowerRelativeToVotableSupply * 100
                  )}{" "}
                  votable supply
                  <br />
                  {bpsToString(delegate.votingPowerRelativeToQuorum * 100)}{" "}
                  quorum
                </>
              }
            />

            <PanelRow
              title="Recent activity"
              detail={
                delegate.lastTenProps
                  ? `${delegate.lastTenProps} of 10 last props`
                  : "N/A"
              }
            />

            <PanelRow
              title="Proposals created"
              detail={`${delegate.proposalsCreated}`}
            />

            <PanelRow
              title="Delegated from"
              detail={pluralizeAddresses(delegate.numOfDelegators)}
            />
          </VStack>
        </div>
      </VStack>
    </VStack>
  );
}

export const PanelRow = ({ title, detail }) => {
  return (
    <HStack gap="2" justifyContent="space-between" alignItems="baseline">
      <span
        className={css`
          white-space: nowrap;
        `}
      >
        {title}
      </span>

      <span
        className={css`
          font-size: ${theme.fontSize.sm};
          color: #4f4f4f;
          text-align: right;
        `}
      >
        {detail}
      </span>
    </HStack>
  );
};
