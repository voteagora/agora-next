import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl, getProposalTypeText } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

export default function ProposalTitle({
  title,
  proposalType,
  createdTransactionHash,
}) {
  const proposalText = getProposalTypeText(proposalType);
  const { ui } = Tenant.current();

  return (
    <div className="flex-col items-start">
      <div className="text-xs font-semibold text-gray-700 flex items-center">
        {proposalText} by The {ui.organization.title}
        <a
          href={getBlockScanUrl(createdTransactionHash)}
          target="_blank"
          rel="noreferrer noopener"
        >
          <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
        </a>
      </div>
      <h2 className="font-black text-2xl">{title}</h2>
    </div>
  );
}
