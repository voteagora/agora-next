"use client";

import { useState, useEffect } from "react";
import { UpdatedButton } from "@/components/Button";
import createProposalDraft from "./actions/createProposalDraft";
import classNames from "classnames";
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
        setIsPending(true);
        const proposal = await createProposalDraft(address);
        const nextId = (proposal as any).uuid ?? proposal.id;
        window.location.href = `/proposals/draft/${nextId}`;
      }}
    >
      Create proposal
    </UpdatedButton>
  );
};

export default CreateProposalDraftButton;
