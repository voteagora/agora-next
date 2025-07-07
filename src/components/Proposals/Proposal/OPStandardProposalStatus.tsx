import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import { TokenAmountDisplay } from "@/lib/utils";
import { formatUnits } from "ethers";

function formatNumber(amount: string | bigint, decimals?: number) {
  if (amount == null) return 0;
  try {
    const standardUnitAmount = Number(formatUnits(amount, decimals));
    return standardUnitAmount;
  } catch (error) {
    console.error("Error formatting number:", error);
    return 0;
  }
}

export default function OPStandardProposalStatus({
  proposal,
}: {
  proposal: Proposal;
}) {
  const forLength = formatNumber(
    (proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"]).for
  );
  const againstLength = formatNumber(
    (proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"])
      .against
  );
  const abstainLength = formatNumber(
    (proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"])
      .abstain
  );
  const totalLength = forLength + againstLength + abstainLength;
  return (
    <div className="flex flex-col items-end gap-1 justify-center">
      <div className="flex flex-row space-between text-primary gap-1">
        <div>
          <TokenAmountDisplay
            amount={
              (
                proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"]
              ).for
            }
            currency=""
          />
          For
        </div>
        <div>–</div>
        <div>
          <TokenAmountDisplay
            amount={
              (
                proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"]
              ).against
            }
            currency=""
          />
          Against
        </div>
      </div>

      {totalLength > 0 && (
        <div className="flex w-52 h-1 bg-wash rounded-full">
          <div
            className=" bg-positive h-1 rounded-l-full"
            style={{ width: `${(forLength / totalLength) * 100}%` }}
          ></div>
          <div
            className=" bg-tertiary h-1"
            style={{ width: `${(abstainLength / totalLength) * 100}%` }}
          ></div>
          <div
            className=" bg-negative h-1 rounded-r-full"
            style={{ width: `${(againstLength / totalLength) * 100}%` }}
          ></div>
        </div>
      )}

      {totalLength === 0 && (
        <div className="flex w-52 h-1 bg-wash rounded-full">
          <div className=" bg-tertiary h-1" style={{ width: `100%` }}></div>
        </div>
      )}
    </div>
  );
}
