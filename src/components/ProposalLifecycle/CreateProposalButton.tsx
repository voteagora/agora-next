import { ProposalDraft } from "@prisma/client";

interface CreateProposalButtonProps {
  createProposal: () => Promise<ProposalDraft>;
}

export default function CreateProposalButton(props: CreateProposalButtonProps) {
  const { createProposal } = props;

  return (
    <button
      className={`w-full md:w-fit bg-stone-900 text-white text-base font-medium border border-stone-100 rounded-full py-2 px-4 flex items-center`}
      onClick={async () => {
        const proposal = await createProposal();
        window.location.href = `/proposals/draft/${proposal.id}`;
      }}
    >
      Create proposal
    </button>
  );
}
