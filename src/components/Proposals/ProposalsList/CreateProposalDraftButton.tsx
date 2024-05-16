import { useState } from "react";
import { UpdatedButton } from "@/components/Button";
import createProposalDraft from "./actions/createProposalDraft";

const CreateProposalDraftButton = ({ address }: { address: `0x${string}` }) => {
  const [isPending, setIsPending] = useState(false);
  return (
    <UpdatedButton
      variant="rounded"
      type="primary"
      isLoading={isPending}
      onClick={async () => {
        setIsPending(true);
        const proposal = await createProposalDraft(address);
        window.location.href = `/proposals/draft/${proposal.id}`;
        setIsPending(false);
      }}
    >
      Create
    </UpdatedButton>
  );
};

export default CreateProposalDraftButton;
