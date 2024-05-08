import { UpdatedButton } from "@/components/Button";
import createProposalDraft from "./actions/createProposalDraft";

const CreateProposalDraftButton = ({ address }: { address: `0x${string}` }) => {
  return (
    <UpdatedButton
      variant="rounded"
      type="primary"
      onClick={async () => {
        const proposal = await createProposalDraft(address);
        window.location.href = `/proposals/draft/${proposal.id}`;
      }}
    >
      Create
    </UpdatedButton>
  );
};

export default CreateProposalDraftButton;
