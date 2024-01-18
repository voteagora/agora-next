"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
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
  closeDialog,
}: Props) {
  return (
    <VStack alignItems="items-center">
      <VStack className="w-full bg-white rounded-xl">
        <VStack className="text-xs">
          {!isError && !isLoading && !isSuccess && (
            <div>Waiting for transaction execution...</div>
          )}
          {txHash && !isLoading && !isSuccess && (
            <Message text="Transaction submitted and awaiting confirmation." />
          )}
          {isError && !txHash && <div>error</div>}
          {isLoading && <Loading />}
          {isSuccess && <SuccessMessage closeDialog={closeDialog} />}
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

export function SuccessMessage({ closeDialog }: { closeDialog: () => void }) {
  return (
    <VStack className={styles.full_width}>
      <img src={`/images/congrats.svg`} className="w-full mb-3" />
      <div className="font-black text-2xl mb-2">
        Proposal successfully created!
      </div>
      <div className="text-gray-700 text-sm mb-5 font-medium">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div onClick={closeDialog} className={`${styles.proposal_container}`}>
          Got it
        </div>
      </div>
    </VStack>
  );
}

export function Loading() {
  return (
    <VStack className={styles.full_width}>
      <img src={`/images/action-pending.svg`} className="w-full mb-3" />
      <div className="font-black text-2xl mb-2">Creating your proposal ...</div>
      <div className="text-gray-4f mb-5 font-medium text-base">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div className="flex flex-row justify-center w-full py-3 bg-gray-eo rounded-lg">
          <div className="text-gray-4f font-semibold text-base">
            Writing your proposal to chain...
          </div>
        </div>
      </div>
    </VStack>
  );
}
