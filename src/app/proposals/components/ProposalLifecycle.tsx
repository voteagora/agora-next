import { Button } from "@/components/Button";
import Tenant from "@/lib/tenant/tenant";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { PROPOSAL_STATUS } from "@/lib/constants";

interface Props {
  proposal: Proposal;
}

export const ProposalLifecycle = ({ proposal }: Props) => {
  const { ui } = Tenant.current();

  const hasProposalLifecycle = Boolean(
    ui.toggle("proposals/lifecycle")?.enabled
  );

  if (!hasProposalLifecycle) {
    return null;
  }

  const renderActions = () => {
    switch (proposal.status) {
      case PROPOSAL_STATUS.ACTIVE:
        return <Button>Cancel</Button>;
      case PROPOSAL_STATUS.SUCCEEDED:
        return <Button>Queue</Button>;
      case PROPOSAL_STATUS.PENDING:
        return <Button>Execute</Button>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row justify-between items-center align-middle border border-line p-4 mb-6 rounded-md bg-neutral text-sm">
      <div>Proposal {proposal.status}</div>
      <div>
        <Button>Hello world</Button>
      </div>
    </div>
  );
};
