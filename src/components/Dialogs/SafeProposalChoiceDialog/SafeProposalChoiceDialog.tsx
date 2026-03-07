"use client";

import { useState } from "react";

import { UpdatedButton } from "@/components/Button";
import { Button } from "@/components/ui/button";

type SafeProposalChoiceDialogProps = {
  closeDialog: () => void;
  onCancel?: () => void;
  onCreateDraftOffchain: () => Promise<void> | void;
  onSkipToOnchain: () => Promise<void> | void;
};

export function SafeProposalChoiceDialog({
  closeDialog,
  onCancel,
  onCreateDraftOffchain,
  onSkipToOnchain,
}: SafeProposalChoiceDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "offchain" | "onchain" | null
  >(null);

  const handleCancel = () => {
    onCancel?.();
    closeDialog();
  };

  const runAction = async (
    action: () => Promise<void> | void,
    actionType: "offchain" | "onchain"
  ) => {
    setPendingAction(actionType);

    try {
      await action();
      closeDialog();
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[32rem]">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-primary">
          Safe wallet detected
        </h2>
        <p className="text-secondary">
          Creating a draft offchain uses a Safe message signature flow before
          the proposal is submitted onchain.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Warning</p>
        <p className="mt-2">
          Creating a draft offchain requires all Safe signers to approve within
          2 minutes. Stay on this page and do not switch tabs until the flow is
          complete.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-primary">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-line"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
        />
        <span>I understand the risks of the offchain Safe signature flow.</span>
      </label>

      <div className="flex flex-col gap-3">
        <UpdatedButton
          onClick={() => runAction(onCreateDraftOffchain, "offchain")}
          isLoading={pendingAction === "offchain"}
          disabled={!acknowledged || pendingAction !== null}
          type="primary"
        >
          Create Draft Offchain Quickly
        </UpdatedButton>

        <UpdatedButton
          onClick={() => runAction(onSkipToOnchain, "onchain")}
          isLoading={pendingAction === "onchain"}
          disabled={pendingAction !== null}
          type="secondary"
        >
          Skip and Go Direct to Onchain
        </UpdatedButton>

        <Button
          onClick={handleCancel}
          variant="outline"
          disabled={pendingAction !== null}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
