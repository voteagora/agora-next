"use client";

import * as theme from "@/styles/theme";
import { HStack, VStack } from "@/components/Layout/Stack";
import { css } from "@emotion/css";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";

type Props = {
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  txHash?: string;
  closeDialog: () => void;
};

export function CastProposalDialog({
  isError,
  isLoading,
  isSuccess,
  txHash,
}: Props) {
  return (
    <VStack
      alignItems="items-center"
      className={css`
        padding: ${theme.spacing["8"]};
      `}
    >
      <VStack
        className={css`
          width: 100%;
          max-width: ${theme.maxWidth.xs};
          background: ${theme.colors.white};
          border-radius: ${theme.spacing["3"]};
          padding: ${theme.spacing["6"]};
        `}
      >
        <VStack
          gap={6}
          className={css`
            font-size: ${theme.fontSize["xs"]};
          `}
        >
          {!isError && !isLoading && !isSuccess && (
            <div>Waiting for transaction execution...</div>
          )}
          {txHash && !isLoading && !isSuccess && (
            <Message text="Transaction submitted and awaiting confirmation." />
          )}
          {isError && !txHash && <div>error</div>}
          {isLoading && <Loading />}
          {isSuccess && <SuccessMessage />}
        </VStack>
      </VStack>
    </VStack>
  );
}

function Message({ text, image }: { text: string; image?: JSX.Element }) {
  return (
    <HStack
      justifyContent="justify-between"
      alignItems="items-center"
      className={css`
        width: 100%;
        z-index: 1;
        position: relative;
        padding: ${theme.spacing["4"]};
        border-radius: ${theme.spacing["2"]};
        border: 1px solid ${theme.colors.gray.eb};
      `}
    >
      <div
        className={css`
          font-weight: ${theme.fontWeight.medium};
        `}
      >
        {text}
      </div>
      {image}
    </HStack>
  );
}

export function SuccessMessage() {
  return (
    <Message
      text="Success! Proposal has been cast. It will appear once the transaction is
    confirmed."
      image={
        <Image
          src={icons.ballot}
          alt={icons.ballot}
          className={css`
            height: 20px;
          `}
        />
      }
    />
  );
}

export function Loading() {
  return (
    <Message
      text="Creating proposal"
      image={<Image src={icons.spinner} alt={icons.spinner} />}
    />
  );
}
