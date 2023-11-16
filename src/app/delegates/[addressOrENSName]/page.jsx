/*
 * Show page for a single delegate
 * Takes in the delegate address as a parameter
 */

import AgoraAPI from "@/app/lib/agoraAPI";
import DelegateCard from "@/components/Delegates/DelegateCard";
import DelegateVotes from "@/components/Delegates/DelegateVotes";
import { HStack, VStack } from "@/components/Layout/Stack";
import { css } from "@emotion/css";
import * as theme from "@/styles/theme";

async function getDelegate(addressOrENSName) {
  "use server";
  const api = new AgoraAPI();
  const data = await api.get(`/delegates/${addressOrENSName}`);
  return data.delegate;
}

async function getDelegateVotes(addressOrENSName, page = 1) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(
    `/delegates/${addressOrENSName}/votes?page=${page}`
  );
  return { delegateVotes: data.votes, meta: data.meta };
}

export default async function Page({ params: { addressOrENSName } }) {
  const delegate = await getDelegate(addressOrENSName);
  const delegateVotes = await getDelegateVotes(addressOrENSName);

  return (
    <HStack
      gap="16"
      justifyContent="space-between"
      alignItems="flex-start"
      className={css`
        margin: ${theme.spacing["16"]};
        margin-top: ${theme.spacing["8"]};
        padding-left: ${theme.spacing["4"]};
        padding-right: ${theme.spacing["4"]};
        width: 100%;
        max-width: ${theme.maxWidth["6xl"]};

        @media (max-width: ${theme.maxWidth["6xl"]}) {
          flex-direction: column;
          align-items: center;
        }
      `}
    >
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
        <DelegateCard delegate={delegate} />

        {!delegate.statement && (
          <div
            className={css`
              color: #66676b;
              line-height: ${theme.lineHeight.normal};
              font-size: ${theme.fontSize.xs};
              padding: ${theme.spacing["2"]};
            `}
          >
            This voter has not submitted a statement. Is this you? Connect your
            wallet to verify your address, and tell your community what you’d
            like to see.
          </div>
        )}
      </VStack>

      <VStack
        gap="8"
        className={css`
          min-width: 0;
          flex: 1;
        `}
      >
        {/** Statement section goes here */}

        <DelegateVotes
          initialVotes={delegateVotes}
          fetchDelegateVotes={getDelegateVotes}
        />
      </VStack>
    </HStack>
  );
}
