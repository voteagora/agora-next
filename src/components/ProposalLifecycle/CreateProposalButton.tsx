import { ProposalDraft } from "@prisma/client";

interface CreateProposalButtonProps {
  createProposal: (address: string) => Promise<ProposalDraft>;
  address: string;
}

export default function CreateProposalButton(props: CreateProposalButtonProps) {
  const { createProposal, address } = props;

  return (
    <button
      className={`w-full md:w-fit bg-stone-900 text-white text-base font-medium border border-stone-100 rounded-full py-2 px-4 flex items-center`}
      onClick={async () => {
        const proposal = await createProposal(address);
        window.location.href = `/proposals/draft/${proposal.id}`;
      }}
    >
      Create proposal
    </button>
  );
}
