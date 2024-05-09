import FormCard from "./form/FormCard";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import ApprovedTransactions from "../../../../components/Proposals/ProposalPage/ApprovedTransactions/ApprovedTransactions";

const DraftPreview = ({
  proposalDraft,
}: {
  proposalDraft: ProposalDraft & { transactions: ProposalDraftTransaction[] };
}) => {
  console.log(proposalDraft);
  const parsedTransactions =
    proposalDraft.transactions?.map((transaction, idx) => {
      return {
        description: transaction.description,
        targets: [transaction.target],
        values: [transaction.value],
        signatures: [transaction.signature],
        calldatas: [transaction.calldata],
        functionArgsName: [
          {
            functionName: "name",
            functionArgs: ["arg1"],
          },
        ],
      };
    }) ?? [];
  return (
    <FormCard>
      <FormCard.Header>
        <div className="flex items-center justify-between">
          <span className="text-xs">Your proposal preview</span>
          <span className="text-xs">Please review carefully</span>
        </div>
      </FormCard.Header>
      <FormCard.Section>
        <h2 className="font-black text-agora-stone-900 text-2xl">
          {proposalDraft.title}
        </h2>
        {/* found in parseProposalData */}
        <div className="mt-6">
          <ApprovedTransactions
            proposalData={{
              options: parsedTransactions,
            }}
            proposalType="APPROVAL"
            executedTransactionHash={"https://etherscan.io/tx/0x123"}
          />
        </div>
        <h3 className="font-semibold mt-6">Description</h3>
        <p className="text-agora-stone-700 mt-2">{proposalDraft.description}</p>
        <h3 className="font-semibold mt-6">Abstract</h3>
        <p className="text-agora-stone-700 mt-2">{proposalDraft.abstract}</p>
      </FormCard.Section>
    </FormCard>
  );
};

export default DraftPreview;
