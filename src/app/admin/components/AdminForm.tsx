import ProposalTypeSettings from "./ProposalTypeSettings";
import GovernorSettings from "./GovernorSettings";
import FAQs from "./FAQs";
import { getProposalTypes } from "@/app/api/proposals/getProposals";

// TODO: Take init values from the chain
export default async function AdminForm() {
  const proposalTypes = await getProposalTypes();
  return (
    <div className="space-y-8 lg:space-y-0 lg:flex lg:gap-12 mt-12">
      <div className="space-y-8 lg:flex-grow">
        <GovernorSettings />
        <ProposalTypeSettings initProposalTypes={proposalTypes} />
      </div>
      <FAQs />
    </div>
  );
}
