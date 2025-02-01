import { TokenAmountDisplay } from "@/lib/utils";
import { formatUnits } from "ethers";

function formatNumber(amount, decimals) {
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
      <div className="flex flex-row space-between text-primary gap-1">
        <div>
          {TokenAmountDisplay({
            amount: proposal.proposalResults.for,
            currency: "",
          })}{" "}
          For
        </div>
        <div>–</div>
        <div>
          {TokenAmountDisplay({
            amount: proposal.proposalResults.against,
            currency: "",
          })}{" "}
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
