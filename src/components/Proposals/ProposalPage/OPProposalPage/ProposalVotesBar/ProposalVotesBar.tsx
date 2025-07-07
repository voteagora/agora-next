import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  proposal: Proposal;
}

export default function ProposalVotesBar({ proposal }: Props) {
  const { ui } = Tenant.current();
  const showQuorumAndThreshold =
    ui.toggle("show-quorum-and-threshold")?.enabled ?? true;
  const thresholdPercent = Math.round(Number(proposal.approvalThreshold) / 100);

  const results =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];
  const totalVotesCount =
    Number(results.for) + Number(results.against) + Number(results.abstain);
  const hasVotes = totalVotesCount > 0;

  return (
    <div id="chartContainer" className="relative flex items-stretch gap-x-0.5">
      {hasVotes ? (
        <>
          {Number(results.for) > 0 && (
            <div
              style={{ flex: Number(results.for) / totalVotesCount }}
              className="min-w-[1px] bg-positive h-[10px]"
            ></div>
          )}
          {Number(results.abstain) > 0 && (
            <div
              style={{ flex: Number(results.abstain) / totalVotesCount }}
              className="min-w-[1px] bg-tertiary h-[10px]"
            ></div>
          )}
          {Number(results.against) > 0 && (
            <div
              style={{ flex: Number(results.against) / totalVotesCount }}
              className="min-w-[1px] bg-negative h-[10px]"
            ></div>
          )}
        </>
      ) : (
        <div className="w-full bg-wash h-[10px]"></div>
      )}

      {proposal.approvalThreshold && showQuorumAndThreshold && (
        <div
          className="bg-primary h-4 w-[2px] absolute -top-[3px] z-50"
          style={{ left: `${thresholdPercent}%` }}
        />
      )}
    </div>
  );
}
