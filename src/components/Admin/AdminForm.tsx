import ProposalTypeSettings from "./ProposalTypeSettings";
import GovernorSettings from "./GovernorSettings";
import FAQs from "./FAQs";

// TODO: Take init values from the chain
export default function AdminForm({
  votableSupply,
}: {
  votableSupply: string;
}) {
  return (
    <div className="space-y-8 lg:space-y-0 lg:flex lg:gap-12 mt-12">
      <div className="space-y-8 lg:flex-grow">
        <GovernorSettings />
        <ProposalTypeSettings votableSupply={votableSupply} />
      </div>
      <FAQs />
    </div>
  );
}
