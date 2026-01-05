"use client";

import { useState, useEffect } from "react";
import classNames from "classnames";
import { useSIWE } from "connectkit";
import { UpdatedButton } from "@/components/Button";
import Tenant from "@/lib/tenant/tenant";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { PLMConfig } from "@/app/proposals/draft/types";
import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getStoredSiweJwt, waitForStoredSiweJwt } from "@/lib/siweSession";

const CreateProposalDraftButton = ({
  address,
  className,
}: {
  address: `0x${string}`;
  className?: string;
}) => {
  const [isPending, setIsPending] = useState(false);
  const { getAuthenticationData } = useProposalActionAuth();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { signIn } = useSIWE();
  const { ui } = Tenant.current();
  const protocolLevelCreateProposalButtonCheck = (
    ui.toggle("proposal-lifecycle")?.config as PLMConfig
  )?.protocolLevelCreateProposalButtonCheck;

  const { data: threshold } = useProposalThreshold({
    enabled: !!protocolLevelCreateProposalButtonCheck,
  });
  const { data: manager } = useManager({
    enabled: !!protocolLevelCreateProposalButtonCheck,
  });
  const { data: accountVotes } = useGetVotes({
    address: address as `0x${string}`,
    blockNumber: BigInt(0),
    enabled: !!address && !!protocolLevelCreateProposalButtonCheck,
  });

  // hydration issue fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Check if the account holder is the gov manager OR has enough VP such that they meet the proposal threshold.
  if (
    protocolLevelCreateProposalButtonCheck &&
    !(manager === address) &&
    !(accountVotes !== undefined && threshold !== undefined
      ? accountVotes >= threshold
      : false)
  ) {
    return null;
  }

  return (
    <UpdatedButton
      variant="rounded"
      type="primary"
      isLoading={isPending}
      disabled={isPending}
      aria-busy={isPending}
      aria-disabled={isPending}
      className={classNames(className)}
      onClick={async () => {
        if (isPending) return;
        setIsPending(true);
        try {
          // Require SIWE JWT session before proceeding (middleware enforces it)
          let jwt = getStoredSiweJwt({ expectedAddress: address });
          if (!jwt) {
            // Try to initiate SIWE sign-in and then proceed
            try {
              await signIn();
              // Retry fetching the session for up to 10 seconds to handle potential race conditions
              // specifically observed with Brave Wallet
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
            action: "createDraft",
            creatorAddress: address,
            timestamp: new Date().toISOString(),
          };

          const auth = await getAuthenticationData(messagePayload);
          if (!auth) {
            setIsPending(false);
            return;
          }

          const res = await fetch("/api/v1/drafts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: auth.jwt ? `Bearer ${auth.jwt}` : "",
            },
            body: JSON.stringify({
              creatorAddress: address,
              message: auth.message,
              signature: auth.signature,
            }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            const errMsg = body?.message || "Failed to create draft";
            throw new Error(errMsg);
          }
          const proposal = await res.json();
          const nextId = proposal.uuid;
          router.push(`/proposals/draft/${nextId}`);
        } catch (error) {
          console.error("Error creating draft proposal:", error);
          const message = (error as any)?.message || "Error creating draft";
          toast(message);
        } finally {
          setIsPending(false);
        }
      }}
    >
      Create proposal
    </UpdatedButton>
  );
};

export default CreateProposalDraftButton;
