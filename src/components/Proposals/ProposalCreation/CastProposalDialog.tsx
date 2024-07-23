"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import Tenant from "@/lib/tenant/tenant";

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
      <VStack className="w-full bg-neutral rounded-xl">
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
      className="w-full relative z-[1] p-4 rounded-md border border-line"
    >
      <div className="font-medium">{text}</div>
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
  const { ui } = Tenant.current();
  return (
    <VStack className="w-full">
      <img
        src={ui.assets.success}
        className="w-full mb-3"
        alt="Proposal successfully created!"
      />
      <div className="mb-2 text-2xl font-black">
        Proposal successfully created!
      </div>
      <div className="mb-5 text-sm font-medium text-secondary">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div
          onClick={closeDialog}
          className="text-center font-bold bg-neutral rounded-md border border-line shadow-newDefault cursor-pointer py-3 px-4 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary"
        >
          Got it
        </div>
      </div>
      <BlockScanUrls hash1={txHash} />
    </VStack>
  );
}

export function Loading() {
  const { ui } = Tenant.current();

  return (
    <VStack className="w-full">
      <img src={ui.assets.pending} className="w-full mb-3" alt="Pending" />
      <div className="mb-2 text-2xl font-black">Creating your proposal ...</div>
      <div className="mb-5 text-base font-medium text-secondary">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div className="flex flex-row justify-center w-full py-3 rounded-lg bg-line">
          <div className="text-base font-semibold text-secondary">
            Writing your proposal to chain...
          </div>
        </div>
      </div>
    </VStack>
  );
}
