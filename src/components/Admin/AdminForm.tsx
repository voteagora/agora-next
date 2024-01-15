import ProposalTypeSettings from "./ProposalTypeSettings";
import GovernorSettings from "./GovernorSettings";
import FAQs from "./FAQs";
import { ProposalTypes } from "@prisma/client";

// TODO: Take init values from the chain
export default function AdminForm({
  proposalTypes,
  votableSupply,
}: {
  proposalTypes: ProposalTypes[];
  votableSupply: string;
}) {
  return (
    <div className="space-y-8 lg:space-y-0 lg:flex lg:gap-12 mt-12">
      <div className="space-y-8 lg:flex-grow">
        <GovernorSettings />
        <ProposalTypeSettings
          votableSupply={votableSupply}
          initProposalTypes={proposalTypes}
        />
      </div>
      <FAQs />
    </div>
  );
}
