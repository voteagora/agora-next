"use client";

import { useState, useEffect } from "react";
import { UpdatedButton } from "@/components/Button";
import createProposalDraft from "./actions/createProposalDraft";
import classNames from "classnames";

const CreateProposalDraftButton = ({
  address,
  className,
}: {
  address: `0x${string}`;
  className?: string;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // hydration issue fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <UpdatedButton
      variant="rounded"
      type="primary"
      isLoading={isPending}
      className={classNames(className)}
      onClick={async () => {
        setIsPending(true);
        const proposal = await createProposalDraft(address);
        window.location.href = `/proposals/draft/${proposal.id}`;
      }}
    >
      Create proposal
    </UpdatedButton>
  );
};

export default CreateProposalDraftButton;
