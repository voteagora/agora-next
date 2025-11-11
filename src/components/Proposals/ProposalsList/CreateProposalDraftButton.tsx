"use client";

import { useState, useEffect } from "react";
import classNames from "classnames";
import { useSignMessage } from "wagmi";
import { useSIWE } from "connectkit";
import { UpdatedButton } from "@/components/Button";
import Tenant from "@/lib/tenant/tenant";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { PLMConfig } from "@/app/proposals/draft/types";
import { LOCAL_STORAGE_SIWE_JWT_KEY } from "@/lib/constants";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CreateProposalDraftButton = ({
  address,
  className,
}: {
  address: `0x${string}`;
  className?: string;
}) => {
  const [isPending, setIsPending] = useState(false);
  const messageSigner = useSignMessage();
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
          let jwt: string | undefined;
          try {
            const session = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
            const parsed = session ? JSON.parse(session) : null;
            jwt = parsed?.access_token as string | undefined;
          } catch {}
          if (!jwt) {
            // Try to initiate SIWE sign-in and then proceed
            try {
              await signIn();
              const session = localStorage.getItem(LOCAL_STORAGE_SIWE_JWT_KEY);
              const parsed = session ? JSON.parse(session) : null;
              jwt = parsed?.access_token as string | undefined;
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
          const message = JSON.stringify(messagePayload);
          const signature = await messageSigner
            .signMessageAsync({ message })
            .catch(() => undefined);
          if (!signature) {
            return;
          }
          const res = await fetch("/api/v1/drafts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              creatorAddress: address,
              message,
              signature,
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
