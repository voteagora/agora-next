import { isAddress } from "viem";
import { getBlockScanAddress } from "@/lib/utils";

function linkIfAddress(content) {
  // TODO: This doesn't handle ENS addresses
  if (isAddress(content)) {
    return (
      <a href={getBlockScanAddress(content)} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return <span>{content}</span>;
}

export default function CodeChange({
  target,
  valueETH,
  functionName,
  functionArgs,
}) {
  return (
    <div className="break-all text-xs font-mono font-medium text-secondary leading-4 my-2 pl-2 border-l border-line">
      {linkIfAddress(target)}.{functionName}
      {valueETH}(
      <br />
      <span className="ml-2">
        {functionArgs.map((arg, index) => (
          <span key={arg}>
            {arg?.toString()}
            {index !== functionArgs.length - 1 && ", "}
          </span>
        ))}
      </span>
      )
    </div>
  );
}
