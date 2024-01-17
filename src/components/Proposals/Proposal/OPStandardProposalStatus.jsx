import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "./proposal.module.scss";
import { TokenAmountDisplay } from "@/lib/utils";
import { BigNumberish, formatUnits } from "ethers";

function formatNumber(amount, decimals, maximumSignificantDigits = 4) {
  const standardUnitAmount = Number(formatUnits(amount, decimals));
  return standardUnitAmount;
}

export default function OPStandardProposalStatus({ proposal }) {
  const forLength = formatNumber(proposal.proposalResults.for);
  const againstLength = formatNumber(proposal.proposalResults.against);
  const abstainLength = formatNumber(proposal.proposalResults.abstain);
  const totalLength = forLength + againstLength + abstainLength;
  return (
    <div className="flex flex-col items-end gap-1 justify-center">
      <HStack
        className={styles.proposal_status}
        gap={1}
        justifyContent="space-between"
      >
        <div>
          {TokenAmountDisplay(proposal.proposalResults.for, 18, "")} For
        </div>
        <div>–</div>
        <div>
          {TokenAmountDisplay(proposal.proposalResults.against, 18, "")} Against
        </div>
      </HStack>

      {totalLength > 0 && (
        <div className="flex w-52 h-1 bg-slate-100 rounded-full">
          <div
            className=" bg-green-500 h-1 rounded-l-full"
            style={{ width: `${(forLength / totalLength) * 100}%` }}
          ></div>
          <div
            className=" bg-slate-500 h-1"
            style={{ width: `${(abstainLength / totalLength) * 100}%` }}
          ></div>
          <div
            className=" bg-red-500 h-1 rounded-r-full"
            style={{ width: `${(againstLength / totalLength) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
