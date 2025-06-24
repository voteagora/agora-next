import { disapprovalThreshold } from "@/lib/constants";
import { calculateOptimisticProposalMetrics } from "@/lib/proposalUtils";

export default function OPOptimisticProposalStatus({
  proposal,
  votableSupply,
}) {
  const { againstRelativeAmount, status } = calculateOptimisticProposalMetrics(
    proposal,
    votableSupply
  );

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
