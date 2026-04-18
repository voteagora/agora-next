import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";

import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  isOffchainLegacyProposalType,
  isSnapshotProposal,
} from "@/features/proposals/domain";
import ENSName from "@/components/shared/ENSName";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { getBlockScanUrl, getProposalTypeText } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

export default function ProposalTitle({
  title,
  proposal,
}: {
  title: string;
  proposal: Proposal;
}) {
  const isSnapshot = isSnapshotProposal(proposal);
  const isOffchain =
    proposal.kind?.scope === "offchain" ||
    (proposal.proposalType
      ? isOffchainLegacyProposalType(proposal.proposalType)
      : false);
  const proposalData = isSnapshot
    ? (proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"])
    : undefined;
  const proposalText = getProposalTypeText(
    proposal.proposalType ?? "",
    proposalData
  );
  const { ui } = Tenant.current();
  const useIsEasOOProposal = ui.toggle("has-eas-oodao")?.enabled ?? false;

  return (
    <div className="flex-col items-start">
      {!useIsEasOOProposal && (
        <div className="text-xs font-semibold text-secondary flex items-center">
          {proposalText} by
          {Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM ? (
            ` The ${ui.organization?.title}`
          ) : (
            <>
              &nbsp;
              <ENSName address={proposal.proposer} />{" "}
            </>
          )}
          <a
            href={
              isSnapshot
                ? proposalData?.link
                : getBlockScanUrl(
                    proposal.createdTransactionHash ?? "",
                    isOffchain
                  )
            }
            target="_blank"
            rel="noreferrer noopener"
          >
            <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
          </a>
        </div>
      )}
      <h2
        data-testid="proposal-title"
        className="font-black text-2xl text-primary"
      >
        {title}
      </h2>
    </div>
  );
}
