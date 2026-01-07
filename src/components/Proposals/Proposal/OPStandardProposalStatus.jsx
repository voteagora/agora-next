import { TokenAmountDisplay } from "@/lib/utils";
import { formatUnits } from "ethers";

/**
 * Safely converts a vote value to a string, handling objects and invalid types to prevent crashes.
 */
function safeVotesString(val) {
  if (typeof val === "string") {
    // Handle case where object was already stringified to "[object Object]"
    return val === "[object Object]" ? "0" : val;
  }
  if (typeof val === "number") return String(val);
  if (typeof val === "bigint") return val.toString();
  if (val === null || val === undefined) return "0";

  // Handle objects (BigInt polyfills, BigNumber wrappers, etc.)
  if (typeof val === "object") {
    console.error("DEBUG: Invalid vote value encountered:", val);
    try {
      const str = val.toString();
      if (str !== "[object Object]") return str;
    } catch (e) {
      // ignore error
    }
    return "0";
  }

  return String(val);
}

function formatNumber(amount, decimals) {
  if (amount == null) return 0;
  try {
    const safeAmount = safeVotesString(amount);
    const standardUnitAmount = Number(formatUnits(safeAmount, decimals));
    return standardUnitAmount;
  } catch (error) {
    console.error("Error formatting number:", error);
    return 0;
  }
}

export function OPStandardStatusView(props) {
  const { forAmount, againstAmount, abstainAmount, decimals } = props;
  const safeForAmount = safeVotesString(forAmount);
  const safeAgainstAmount = safeVotesString(againstAmount);
  const forLength = formatNumber(forAmount, decimals);
  const againstLength = formatNumber(againstAmount, decimals);
  const abstainLength = formatNumber(abstainAmount, decimals);
  const totalLength = forLength + againstLength + abstainLength;
  return (
    <div className="flex flex-col items-end gap-1 justify-center">
      <div className="flex flex-row space-between text-primary gap-1">
        <div>
          {TokenAmountDisplay({
            amount: safeForAmount,
            currency: "",
          })}{" "}
          For
        </div>
        <div>–</div>
        <div>
          {TokenAmountDisplay({
            amount: safeAgainstAmount,
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

export default function OPStandardProposalStatus({ proposal }) {
  const decimals = proposal.proposalResults.decimals ?? 18;
  return (
    <OPStandardStatusView
      forAmount={proposal.proposalResults.for}
      againstAmount={proposal.proposalResults.against}
      abstainAmount={proposal.proposalResults.abstain}
      decimals={decimals}
    />
  );
}
