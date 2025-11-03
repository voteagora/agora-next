import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ArchiveProposalVotesCard from "./ArchiveProposalVotesCard";
import ArchiveProposalTypeApproval from "./ArchiveProposalTypeApproval";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default function ArchiveStandardProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { namespace } = Tenant.current();
  const isTempCheck =
    proposal.archiveMetadata?.proposalTypeTag === "Temp Check";

  return (
    <div className="flex flex-col">
      <div className="flex gap-0 md:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <div className="w-full proposal-description pb-8 md:pb-0">
          <ProposalDescription proposal={proposal} />

          {namespace === TENANT_NAMESPACES.SYNDICATE && isTempCheck && (
            <div className="mt-4 p-3 rounded-lg border border-line">
              <p className="text-xs text-gray leading-relaxed">
                Most temp checks require 5% of tokens in circulation; however,
                to replace parties as authorized through governance proposal
                (currently, Syndicate Labs) to make changes to the construction
                or function of the smart contracts comprising the Syndicate
                Network require higher percentages to ensure operational
                stability.
                <br />
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>
                    Nov 3, 2025 - Nov 2, 2026: 30% of tokens in circulation
                  </li>
                  <li>
                    Nov 3, 2026 - Nov 2, 2027: 20% of tokens in circulation
                  </li>
                  <li>
                    Nov 3, 2027 - Nov 2, 2028: 10% of tokens in circulation
                  </li>
                  <li>Nov 3, 2028 onward: Reverts to standard 5%</li>
                </ul>
              </p>
            </div>
          )}
        </div>
        <div className="w-full md:max-w-[24rem]">
          <ArchiveProposalTypeApproval proposal={proposal} />
          <ArchiveProposalVotesCard proposal={proposal} />
        </div>
      </div>
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
