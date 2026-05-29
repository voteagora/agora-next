import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import CopelandVotesPanel from "./CopelandVotesPanel/CopelandVotesPanel";
import { TaxFormBanner } from "../TaxFormBanner";

export default async function CopelandProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalState = proposal.status;
  return (
    <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
      <div className="w-full sm:w-auto sm:flex-1">
        <TaxFormBanner proposal={proposal} />
      </div>
      <div className="flex-1 proposal-description pb-6 md:pb-0">
        <ProposalDescription proposal={proposal} />
      </div>
      <div className="w-full md:max-w-[24rem] sticky flex flex-col flex-none top-20 bg-neutral border-line border rounded-xl shadow-newDefault mb-8 items-stretch sm:items-start justify-end sm:justify-between max-h-none md:max-h-[calc(100vh-220px)] h-auto min-h-0">
        <CopelandVotesPanel proposal={proposal} />
        {proposalState === "CLOSED" && (
          <div className="px-4 py-2 bg-wash font-semibold text-xs text-primary rounded-b-xl mt-2 border-t border-line flex items-center">
            This proposal has ended.
          </div>
        )}
      </div>
      {/* Mobile-only spacer to prevent overlap with modal/circle */}
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
