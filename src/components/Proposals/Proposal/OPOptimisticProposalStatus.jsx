import { VStack } from "@/components/Layout/Stack";
import { formatUnits } from "ethers";
import { disapprovalThreshold } from "@/lib/constants";

function formatNumber(amount, decimals = 0, maximumSignificantDigits = 4) {
  const standardUnitAmount = Number(formatUnits(amount, decimals));
  return standardUnitAmount;
}

export default function OPOptimisticProposalStatus({
  proposal,
  votableSupply,
}) {
  const formattedVotableSupply = Number(
    BigInt(votableSupply) / BigInt(10 ** 18)
  );
  const againstLength = formatNumber(proposal.proposalResults.against, 18, 0);
  const againstRelativeAmount =
    (Math.floor(againstLength / formattedVotableSupply) * 100) / 100;
  const status =
    againstRelativeAmount <= disapprovalThreshold ? "approved" : "defeated";
  return (
    <VStack className="text-right">
      <VStack>
        <div className="text-xs text-secondary">
          <p>
            {againstRelativeAmount}% / {disapprovalThreshold}% against needed to
            defeat
          </p>
        </div>
        <p>Optimistically {status}</p>
      </VStack>
    </VStack>
  );
}
