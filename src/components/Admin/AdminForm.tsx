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
    <div className="space-y-8 sm:space-y-0 sm:flex sm:gap-12 mt-12">
      <div className="space-y-8 sm:flex-grow">
        <GovernorSettings />
        <ProposalTypeSettings votableSupply={votableSupply} />
      </div>
      <FAQs />
    </div>
  );
}
