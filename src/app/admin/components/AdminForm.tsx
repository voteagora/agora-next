import ProposalTypeSettings from "./ProposalTypeSettings";
import GovernorSettings from "./GovernorSettings";
import FAQs from "./FAQs";

// TODO: Take init values from the chain
export default function AdminForm() {
  return (
    <div className="space-y-8 lg:space-y-0 lg:flex lg:gap-12 my-12 max-w-screen-lg mx-auto">
      <div className="space-y-8 lg:flex-grow">
        <GovernorSettings />
        <ProposalTypeSettings />
      </div>
      <FAQs />
    </div>
  );
}
