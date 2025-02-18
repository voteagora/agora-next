import { formatUnits } from "ethers";
import { disapprovalThreshold } from "@/lib/constants";

interface Proposal {
  proposalResults: {
    against: bigint;
  };
}

interface OPOptimisticProposalStatusProps {
  proposal: Proposal;
  votableSupply: string | bigint;
}

function formatNumber(
  amount: bigint,
  decimals = 0,
  maximumSignificantDigits = 4
) {
  const standardUnitAmount = Number(formatUnits(amount, decimals));
  return standardUnitAmount;
}

export default function OPOptimisticProposalStatus({
  proposal,
  votableSupply,
}: OPOptimisticProposalStatusProps) {
  const formattedVotableSupply = Number(
    BigInt(votableSupply) / BigInt(10 ** 18)
  );
  const againstLength = formatNumber(proposal.proposalResults.against, 18, 0);
  const againstRelativeAmount =
    (Math.floor(againstLength / formattedVotableSupply) * 100) / 100;
  const status =
    againstRelativeAmount <= disapprovalThreshold ? "approved" : "defeated";
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
