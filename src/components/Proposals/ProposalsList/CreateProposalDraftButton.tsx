"use client";

import { useState, useEffect } from "react";
import classNames from "classnames";
import { useSignMessage } from "wagmi";
import { UpdatedButton } from "@/components/Button";
import Tenant from "@/lib/tenant/tenant";
import { useGetVotes } from "@/hooks/useGetVotes";
import { useManager } from "@/hooks/useManager";
import { useProposalThreshold } from "@/hooks/useProposalThreshold";
import { PLMConfig } from "@/app/proposals/draft/types";

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
      className={classNames(className)}
      onClick={async () => {
        if (isPending) return;
        setIsPending(true);
        try {
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creatorAddress: address,
              message,
              signature,
            }),
          });
          if (!res.ok) {
            throw new Error("Failed to create draft");
          }
          const proposal = await res.json();
          const nextId = proposal.uuid;
          window.location.href = `/proposals/draft/${nextId}`;
        } catch (error) {
          console.error("Error creating draft proposal:", error);
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
