"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { onSubmitAction as deleteAction } from "../actions/deleteDraftProposal";
import { TrashIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";

const DeleteDraftButton = ({
  proposalId,
  onDeleteSuccess,
  small = false,
}: {
  proposalId: number;
  onDeleteSuccess?: () => void;
  small?: boolean;
}) => {
  const openDialog = useOpenDialog();
  return (
    <button
      className="flex flex-row items-center space-x-2 text-secondary"
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "DELETE_DRAFT_PROPOSAL",
          params: {
            proposalId,
            onDeleteSuccess,
          },
        });
      }}
    >
      <TrashIcon className={small ? "h-4 w-4 text-negative" : "h-5 w-5"} />
      <span className={small ? "hidden" : "block"}>Delete Proposal</span>
    </button>
  );
};

export const DeleteDraftProposalDialog = ({
  proposalId,
  onDeleteSuccess,
  closeDialog,
}: {
  proposalId: number;
  onDeleteSuccess?: () => void;
  closeDialog: () => void;
}) => {
  const [isPending, setIsPending] = useState(false);
  const { address } = useAccount();
  const { getAuthenticationData } = useProposalActionAuth();
  return (
    <div>
      <h3 className="text-center text-primary font-semibold text-lg mb-1">
        Delete my draft
      </h3>
      <p className="text-center text-secondary">
        Are you sure you want to delete this proposal?
      </p>
      <div className="mt-6 flex items-center justify-between space-x-2">
        <UpdatedButton
          type="secondary"
          fullWidth
          onClick={() => {
            closeDialog();
          }}
        >
          No
        </UpdatedButton>
        <UpdatedButton
          type="primary"
          fullWidth
          isLoading={isPending}
          onClick={async () => {
            if (isPending) return;
            setIsPending(true);
            try {
              const auth = await getAuthenticationData({
                action: "deleteDraft",
                draftProposalId: proposalId,
                creatorAddress: address,
                timestamp: new Date().toISOString(),
              });
              if (!auth || !address) {
                setIsPending(false);
                return;
              }

              const result = await deleteAction(proposalId, {
                address: address as `0x${string}`,
                jwt: auth.jwt,
              });

              if (result.ok) {
                toast.success("Draft deleted successfully");
                closeDialog();
                onDeleteSuccess?.();
              } else {
                toast.error(result.message || "Failed to delete draft");
                setIsPending(false);
              }
            } catch (error) {
              toast.error("An error occurred. Please try again.");
              setIsPending(false);
            }
          }}
        >
          Yes
        </UpdatedButton>
      </div>
    </div>
  );
};

export default DeleteDraftButton;
