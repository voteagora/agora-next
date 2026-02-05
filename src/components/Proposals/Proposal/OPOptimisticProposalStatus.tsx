import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  calculateOptimisticProposalMetrics,
  ParsedProposalData,
} from "@/lib/proposalUtils";

type OPOptimisticStatusViewProps = {
  againstRelativeAmount: number;
  disapprovalThreshold: number;
  status: string;
};

export function OPOptimisticStatusView({
  againstRelativeAmount,
  disapprovalThreshold,
  status,
}: OPOptimisticStatusViewProps) {
  return (
    <div className="flex flex-col text-right text-primary">
      <div>
        <div className="text-xs text-secondary">
          <p>
            {againstRelativeAmount}% / {disapprovalThreshold}% against needed to
            defeat
          </p>
        </div>
        <p>Optimistically {status}</p>
      </div>
    </div>
  );
}

export default function OPOptimisticProposalStatus({
  proposal,
  votableSupply,
}: {
  proposal: Proposal;
  votableSupply: string;
}) {
  const { againstRelativeAmount, status } = calculateOptimisticProposalMetrics(
    proposal,
    votableSupply
  );
  const proposalData =
    proposal.proposalData as ParsedProposalData["OPTIMISTIC"]["kind"];
  const disapprovalThreshold = proposalData.disapprovalThreshold;

  return (
    <OPOptimisticStatusView
      againstRelativeAmount={againstRelativeAmount}
      disapprovalThreshold={disapprovalThreshold}
      status={status}
    />
  );
}

export type OPOptimisticStatusData = OPOptimisticStatusViewProps;
