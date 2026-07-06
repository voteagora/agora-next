"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import toast from "react-hot-toast";
import { UpdatedButton } from "@/components/Button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConnectModal } from "@/components/providers/ConnectModalContext";
import { useSiweJwt } from "@/hooks/useSiweJwt";

const CONFIRMATION_WORD = "DELETE";

export function DeleteAccountDialog({
  closeDialog,
}: {
  closeDialog: () => void;
}) {
  const { user, getAccessToken } = usePrivy();
  const { disconnect } = useConnectModal();
  const { ensureSession } = useSiweJwt();
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const hasEmbeddedWallet =
    user?.linkedAccounts.some(
      (account) =>
        account.type === "wallet" &&
        (account.walletClientType === "privy" ||
          account.walletClientType === "privy-v2")
    ) ?? false;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const jwt = await ensureSession();
      if (!jwt) {
        toast.error("Sign-in failed. Please try again.");
        return;
      }
      const privyAccessToken = user ? await getAccessToken() : null;
      const response = await fetch("/api/v1/account", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(privyAccessToken ? { privyAccessToken } : {}),
      });
      if (!response.ok) {
        throw new Error(
          `Account deletion failed with status ${response.status}`
        );
      }
      closeDialog();
      disconnect();
      toast.success("Your account has been deleted");
    } catch (error) {
      console.error("Failed to delete account", error);
      toast.error("Couldn't delete your account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-neutral max-w-[28rem] gap-4">
      <h2 className="text-xl font-bold text-left text-primary">
        Delete my account
      </h2>
      <div className="flex flex-col gap-3 text-secondary text-sm">
        <p>
          This action is <strong>irreversible</strong>. Your profile, delegate
          statement, and contact email will be permanently deleted.
        </p>
        {hasEmbeddedWallet && (
          <p className="text-negative font-medium">
            Your managed wallet will be deleted along with your account. Access
            to it — and to anything it holds, including your membership NFT —
            will be permanently lost.
          </p>
        )}
        <p>
          Once your account is deleted we will no longer have your email
          address, so we will have no way to contact you.
        </p>
        <p>
          On-chain records such as votes and delegations are public and cannot
          be removed.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label
          className="text-sm text-secondary"
          htmlFor="delete-account-confirm"
        >
          Type <strong>{CONFIRMATION_WORD}</strong> to confirm
        </label>
        <Input
          id="delete-account-confirm"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-3">
        <UpdatedButton
          onClick={handleDelete}
          type={
            confirmation === CONFIRMATION_WORD && !isDeleting
              ? "destructive"
              : "disabled"
          }
          isLoading={isDeleting}
          disabled={confirmation !== CONFIRMATION_WORD || isDeleting}
        >
          Delete my account
        </UpdatedButton>
        <Button onClick={closeDialog} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}
