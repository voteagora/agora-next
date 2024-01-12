import { VStack } from "@/components/Layout/Stack";
import styles from "./proposal.module.scss";
import { formatUnits } from "ethers";
import { disapprovalThreshold } from "../ProposalCreation/SubmitButton";

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
  const status = againstRelativeAmount <= 50 ? "approved" : "defeated";
  return (
    <VStack className="text-right">
      <VStack>
        <div className={styles.cell_content_title}>
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
