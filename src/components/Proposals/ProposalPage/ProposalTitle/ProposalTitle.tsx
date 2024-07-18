import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl, getProposalTypeText } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import HumanAddress from "@/components/shared/HumanAddress";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { Proposal } from "@/app/api/common/proposals/proposal";

export default function ProposalTitle({
  title,
  proposal,
}: {
  title: string;
  proposal: Proposal;
}) {
  const proposalText = getProposalTypeText(proposal.proposalType ?? "");
  const { ui } = Tenant.current();

  return (
    <div className="flex-col items-start">
      <div className="text-xs font-semibold text-gray-700 flex items-center">
        {proposalText} by
        {Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM ? (
          ` The ${ui.organization?.title}`
        ) : (
          <>
            &nbsp;
            <HumanAddress address={proposal.proposer} />{" "}
          </>
        )}
        <a
          href={getBlockScanUrl(proposal.created_transaction_hash ?? "")}
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
