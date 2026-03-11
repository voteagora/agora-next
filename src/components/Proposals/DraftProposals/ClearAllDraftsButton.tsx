"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as deleteAllAction } from "@/app/proposals/draft/actions/deleteAllDraftProposals";
import toast from "react-hot-toast";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";
import { TrashIcon } from "@heroicons/react/20/solid";
import { useSIWE } from "connectkit";
import { getStoredSiweJwt, waitForStoredSiweJwt } from "@/lib/siweSession";

const ClearAllDraftsButton = ({
  draftCount,
  onSuccess,
}: {
  draftCount: number;
  onSuccess?: () => void;
}) => {
  const openDialog = useOpenDialog();

  if (draftCount === 0) return null;

  return (
    <button
      className="flex flex-row items-center space-x-2 text-secondary hover:text-primary transition-colors"
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        openDialog({
          type: "DELETE_ALL_DRAFT_PROPOSALS",
          params: {
            draftCount,
            onSuccess,
          },
        });
      }}
    >
      <TrashIcon className="h-5 w-5" />
      <span>Clear all drafts</span>
    </button>
  );
};

export const DeleteAllDraftProposalsDialog = ({
  draftCount,
  onSuccess,
  closeDialog,
}: {
  draftCount: number;
  onSuccess?: () => void;
  closeDialog: () => void;
}) => {
  const [isPending, setIsPending] = useState(false);
  const { address } = useAccount();
  const { getAuthenticationData } = useProposalActionAuth();
  const { signIn } = useSIWE();

  return (
    <div>
      <h3 className="text-center text-primary font-semibold text-lg mb-1">
        Delete all drafts
      </h3>
      <p className="text-center text-secondary">
        Are you sure you want to delete all {draftCount} draft
        {draftCount === 1 ? "" : "s"}? This action cannot be undone.
      </p>
      <div className="mt-6 flex items-center justify-between space-x-2">
        <UpdatedButton
          type="secondary"
          fullWidth
          onClick={() => {
            closeDialog();
          }}
        >
          Cancel
        </UpdatedButton>
        <UpdatedButton
          type="primary"
          fullWidth
          isLoading={isPending}
          onClick={async () => {
            if (isPending) return;
            setIsPending(true);
            try {
              let jwt = getStoredSiweJwt({ expectedAddress: address });
              if (!jwt) {
                try {
                  await signIn();
                  jwt = await waitForStoredSiweJwt({
                    expectedAddress: address,
                    timeoutMs: 10_000,
                    intervalMs: 200,
                  });
                } catch (e) {
                  toast("Sign-in cancelled or failed. Please try again.");
                  setIsPending(false);
                  return;
                }
                if (!jwt) {
                  toast("Session expired. Please sign in to continue.");
                  setIsPending(false);
                  return;
                }
              }

              const messagePayload = {
                action: "deleteAllDrafts",
                creatorAddress: address,
                timestamp: new Date().toISOString(),
              };
              const auth = await getAuthenticationData(messagePayload);
              if (!auth || !address) {
                setIsPending(false);
                return;
              }

              const result = await deleteAllAction({
                address: address as `0x${string}`,
                message: auth.message,
                signature: auth.signature,
                jwt: auth.jwt,
              });

              if (result.ok) {
                toast.success(
                  `Successfully deleted ${result.deletedCount || draftCount} draft${
                    (result.deletedCount || draftCount) === 1 ? "" : "s"
                  }`
                );
                closeDialog();
                if (onSuccess) {
                  onSuccess();
                } else {
                  window.location.reload();
                }
              } else {
                toast.error(result.message || "Failed to delete drafts");
                setIsPending(false);
              }
            } catch (error) {
              toast.error("An error occurred. Please try again.");
              setIsPending(false);
            }
          }}
        >
          Delete All
        </UpdatedButton>
      </div>
    </div>
  );
};

export default ClearAllDraftsButton;
