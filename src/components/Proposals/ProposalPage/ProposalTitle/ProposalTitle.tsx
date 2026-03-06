import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl, getProposalTypeText } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ENSName from "@/components/shared/ENSName";
import { ParsedProposalData } from "@/lib/proposalUtils";

export default function ProposalTitle({
  title,
  proposal,
}: {
  title: string;
  proposal: Proposal;
}) {
  const isOffchain = proposal.proposalType?.startsWith("OFFCHAIN");
  const proposalData =
    proposal.proposalType === "SNAPSHOT"
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
              proposal.proposalType === "SNAPSHOT"
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
      <h2 className="font-black text-2xl text-primary">{title}</h2>
    </div>
  );
}
