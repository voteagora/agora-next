import ProposalTypeSettings from "./ProposalTypeSettings";
import GovernorSettings from "./GovernorSettings";
import FAQs from "./FAQs";
import { OptimismProposalTypes } from "@prisma/client";

// TODO: Take init values from the chain
export default function AdminForm({
  votableSupply,
  proposalTypes,
}: {
  votableSupply: string;
  proposalTypes: OptimismProposalTypes[];
}) {
  return (
    <div className="space-y-8 sm:space-y-0 sm:flex sm:gap-12 mt-12">
      <div className="space-y-8 sm:flex-grow">
        <GovernorSettings />
        <ProposalTypeSettings
          votableSupply={votableSupply}
          proposalTypes={proposalTypes}
        />
      </div>
      <FAQs />
    </div>
  );
}
