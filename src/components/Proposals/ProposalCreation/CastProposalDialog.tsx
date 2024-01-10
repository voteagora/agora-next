"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import Image from "next/image";
import styles from "./styles.module.scss";

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
    <VStack alignItems="items-center" className={styles.create_dialog}>
      <VStack className={styles.create_dialog__content}>
        <VStack gap={6} className={styles.create_dialog__text}>
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
      className={styles.create_dialog__message}
    >
      <div>{text}</div>
      {image}
    </HStack>
  );
}

export function SuccessMessage() {
  return (
    <Message
      text="Success! Proposal has been cast. It will appear once the transaction is
    confirmed."
      image={<Image src={icons.ballot} alt={icons.ballot} className="h-5" />}
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
