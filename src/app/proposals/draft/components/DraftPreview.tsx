import FormCard from "./form/FormCard";
import { ProposalDraft } from "@prisma/client";
import ApprovedTransactions from "../../../../components/Proposals/ProposalPage/ApprovedTransactions/ApprovedTransactions";

const DraftPreview = ({ proposalDraft }: { proposalDraft: ProposalDraft }) => {
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
        {/* parseProposalData */}
        <div className="mt-6">
          <ApprovedTransactions
            proposalData={{
              options: [
                {
                  description: "Description of the option!!",
                  targets: ["0x"],
                  values: [0],
                  signatures: ["func"],
                  calldatas: ["0xabc"],
                  functionArgsName: [
                    {
                      functionName: "allowDepositedETH",
                      functionArgs: [
                        "0x2686A8919Df194aA7673244549E68D42C1685d03",
                        "444000004",
                      ],
                    },
                  ],
                },
              ],
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
