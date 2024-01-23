"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./styles.module.scss";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl } from "@/lib/utils";
import BlockScanUrls from "@/components/shared/BlockScanUrl";

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
          {isSuccess && txHash && (
            <SuccessMessage txHash={txHash} closeDialog={closeDialog} />
          )}
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

export function SuccessMessage({
  closeDialog,
  txHash,
}: {
  closeDialog: () => void;
  txHash: string;
}) {
  return (
    <VStack className={styles.full_width}>
      <img src={`/images/congrats.svg`} className="w-full mb-3" />
      <div className="mb-2 text-2xl font-black">
        Proposal successfully created!
      </div>
      <div className="mb-5 text-sm font-medium text-gray-700">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div onClick={closeDialog} className={`${styles.proposal_container}`}>
          Got it
        </div>
      </div>
      <BlockScanUrls hash1={txHash} />
    </VStack>
  );
}

export function Loading() {
  return (
    <VStack className={styles.full_width}>
      <img src={`/images/action-pending.svg`} className="w-full mb-3" />
      <div className="mb-2 text-2xl font-black">Creating your proposal ...</div>
      <div className="mb-5 text-base font-medium text-gray-4f">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div className="flex flex-row justify-center w-full py-3 rounded-lg bg-gray-eo">
          <div className="text-base font-semibold text-gray-4f">
            Writing your proposal to chain...
          </div>
        </div>
      </div>
    </VStack>
  );
}
