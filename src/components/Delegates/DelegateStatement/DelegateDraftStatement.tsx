"use client";

import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useGetDelegateDraftStatement } from "@/hooks/useGetDelegateDraftStatement";
import { useGetSafeMessageDetails } from "@/hooks/useGetSafeMessageDetails";
import { useGetSafeInfo } from "@/hooks/useGetSafeInfo";
import { ExclamationCircleIcon } from "@/icons/ExclamationCircleIcon";
import { DelegateStatement } from "@/app/api/common/delegateStatement/delegateStatement";
import { useCallback, useEffect, useState } from "react";
import { publishDelegateStatement } from "@/app/api/common/delegateStatement/publishDelegateStatement";
import { useDelegate } from "@/hooks/useDelegate";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useRouter } from "next/navigation";
import Tenant from "@/lib/tenant/tenant";

export const DraftStatementDetails = ({
  delegateStatement,
  address,
}: {
  delegateStatement: DelegateStatement;
  address?: `0x${string}`;
}) => {
  const [submitDraft, setSubmitDraft] = useState(false);
  const { selectedWalletAddress } = useSelectedWallet();
  const openDialog = useOpenDialog();
  const router = useRouter();
  const { data: draftStatement, refetch } = useGetDelegateDraftStatement(
    address
  );
  const { data: safeMessageDetails } = useGetSafeMessageDetails({
    messageHash: draftStatement?.message_hash,
  });

  const chainId = Tenant.current().contracts.governor.chain.id;
  const { data: safeInfo } = useGetSafeInfo(address);
  const { refetch: refetchStatement } = useDelegate({
    address,
  });
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const date = new Date(safeMessageDetails?.created || new Date());
  const formattedDate = formatDate(date);
  const formattedTime = formatTime(date).toLowerCase();

  const confirmedSignatures = safeMessageDetails?.confirmations?.length;
  const requiredSignatures = safeInfo?.threshold;
  const signaturesDisplay = `${confirmedSignatures}/${requiredSignatures} signatures`;

  const publishDraft = useCallback(async () => {
    if (draftStatement?.message_hash) {
      await publishDelegateStatement({
        message_hash: draftStatement.message_hash,
        chain_id: chainId,
      });
      refetch();
      refetchStatement();
    }
  }, [draftStatement?.message_hash, chainId, refetch, refetchStatement]);

  useEffect(() => {
    if (
      draftStatement?.message_hash &&
      delegateStatement?.message_hash !== draftStatement?.message_hash &&
      !submitDraft
    ) {
      if (
        confirmedSignatures &&
        requiredSignatures &&
        confirmedSignatures >= requiredSignatures
      ) {
        setSubmitDraft(true);
        publishDraft();
      }
    }
  }, [
    selectedWalletAddress,
    draftStatement,
    delegateStatement?.message_hash,
    confirmedSignatures,
    requiredSignatures,
    submitDraft,
    publishDraft,
    refetch,
    refetchStatement,
  ]);

  const openDeleteDialog = useCallback(async () => {
    if (!draftStatement?.message_hash || !selectedWalletAddress) {
      return;
    }
    openDialog({
      type: "SAFE_DELETE_DRAFT_STATEMENT",
      params: {
        address: selectedWalletAddress,
        messageHash: draftStatement?.message_hash,
      },
    });
  }, [selectedWalletAddress, draftStatement?.message_hash, openDialog]);

  if (!selectedWalletAddress || !draftStatement?.address) {
    return null;
  }

  if (
    selectedWalletAddress?.toLowerCase() !==
    draftStatement?.address?.toLowerCase()
  ) {
    return null;
  }

  if (
    confirmedSignatures &&
    requiredSignatures &&
    confirmedSignatures >= requiredSignatures
  ) {
    return null;
  }

  const onClickViewEdits = () => {
    router.push(`/delegates/create?draftView=true`);
  };

  return (
    <div className="flex flex-col bg-neutral rounded-xl py-8 px-6 mb-4 border border-line">
      <div className="inline-flex flex-col justify-start items-start gap-6">
        <div className="flex flex-col justify-start items-start gap-4">
          <div className="self-stretch inline-flex md:contents lg:inline-flex justify-between items-center">
            <div className="flex justify-start items-center gap-2">
              <div className="relative overflow-hidden">
                <ExclamationCircleIcon className="stroke-primary w-[20px] h-[20px]" />
              </div>
              <div className="justify-start text-neutral-900 text-2xl font-bold leading-loose">
                Pending signatures
              </div>
            </div>
            <div className="px-4 py-3 bg-neutral rounded-lg border border-primary flex justify-center items-center gap-2.5">
              <div className="justify-start text-neutral-900 text-base font-medium leading-normal">
                {signaturesDisplay}
              </div>
            </div>
          </div>
          <div className="self-stretch justify-start">
            <span className="text-secondary text-xs font-medium leading-none mb-6 block">
              Changes submitted on {formattedDate} @{formattedTime}
              <br />
            </span>
            <span className="text-secondary text-base font-medium leading-normal">
              Your updated delegate statement is awaiting approval. Until then,
              your public statement remains active.
            </span>
          </div>
        </div>
        <div className="inline-flex justify-start items-start gap-4">
          <button
            className="px-5 py-3 bg-white rounded-full shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02)] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.03)] outline outline-1 outline-offset-[-1px] outline-neutral-900 flex justify-center items-center gap-2"
            onClick={onClickViewEdits}
          >
            <div className="justify-center text-neutral-900 text-base font-medium leading-normal">
              View edits
            </div>
          </button>
          <button
            className="px-5 py-3 bg-white rounded-full shadow-[0px_4px_12px_0px_rgba(0,0,0,0.02)] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.03)] outline outline-1 outline-offset-[-1px] outline-neutral-900 flex justify-center items-center gap-2"
            onClick={openDeleteDialog}
          >
            <div className="justify-center text-neutral-900 text-base font-medium leading-normal">
              Cancel request
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
