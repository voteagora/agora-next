import {
  SimulationCheck,
  SimulationStateChange,
  StructuredSimulationReport,
} from "@/lib/seatbelt/types";
import { getBlockScanAddress } from "@/lib/utils";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  InfoIcon,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

interface StateChangesProps {
  stateChanges: SimulationStateChange[];
}

function StateChanges({ stateChanges }: StateChangesProps) {
  if (stateChanges.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-tertiary border border-line rounded-md bg-wash/30">
        <InfoIcon className="h-4 w-4 mr-2 text-tertiary" />
        <span>No state changes found in the report</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Group state changes by contract */}
      {Object.entries(
        stateChanges.reduce<Record<string, SimulationStateChange[]>>(
          (acc, change) => {
            // Contract always exists on change but may be generic
            const contractName = change.contract;

            const key = `${contractName}|${change.contractAddress || ""}`;

            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(change);
            return acc;
          },
          {}
        )
      ).map(([contractKey, changes]) => {
        const [contractName, contractAddress] = contractKey.split("|");
        return (
          <div key={contractKey} className="space-y-3">
            <div className="flex items-center gap-2 mb-2 p-2 bg-wash rounded-md border-l-4 border-brandPrimary">
              <h3 className="text-base font-semibold">
                {contractName === "balances"
                  ? "Token Balances"
                  : contractName === "storage"
                    ? "Contract Storage"
                    : contractName === "code"
                      ? "Contract Code"
                      : contractName}
                {contractAddress && (
                  <span className="ml-2 text-sm font-normal">
                    at{" "}
                    <a
                      href={getBlockScanAddress(contractAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs bg-tertiary/10 px-1 py-0.5 rounded-md hover:bg-tertiary/20 transition-colors inline-flex items-center"
                    >
                      {contractAddress}
                      <ExternalLinkIcon className="h-3 w-3 ml-1 text-tertiary" />
                    </a>
                  </span>
                )}
              </h3>
            </div>
            {/* State changes for this contract */}
            <div className="space-y-3 pl-2">
              {changes.map((change, index) => (
                <StateChangeItem
                  key={`state-${change.contract}-${change.key}-${index}`}
                  stateChange={change}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface StructuredReportProps {
  report: StructuredSimulationReport;
}

export function StructuredReport({ report }: StructuredReportProps) {
  const checksToShow =
    report.status === "error"
      ? report.checks.filter((check) => check.status === "failed")
      : report.checks;

  return (
    <div className="w-full border border-line rounded-md shadow-sm max-h-[600px] overflow-y-auto">
      <div className="bg-wash p-6 border-b border-line">
        <h2 className="text-2xl font-bold text-primary">Simulation</h2>
        <div className="flex items-center mt-3">
          <span className="text-tertiary mr-2">Status:</span>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              report.status === "success"
                ? "bg-positive/20 text-positive"
                : report.status === "warning"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-negative/20 text-negative"
            }`}
          >
            {report.status === "success"
              ? "Passed"
              : report.status === "warning"
                ? "Passed with warnings"
                : "Failed"}
          </div>
        </div>
        <p className="text-tertiary mt-3 text-sm">{report.summary}</p>
        <a
          href={`https://tdly.co/shared/simulation/${report.simulation.simulation.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm flex gap-1 items-center mt-3 text-tertiary hover:underline font-semibold"
        >
          <span>View simulation on Tenderly</span>
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </div>

      <div className="overflow-y-auto">
        <div className="p-4">
          {report.checks.length === 0 ? (
            <div className="flex items-center justify-center p-6 text-tertiary border border-line rounded-md bg-wash/30">
              <InfoIcon className="h-4 w-4 mr-2 text-tertiary" />
              <span>No checks found in the report</span>
            </div>
          ) : (
            <div className="space-y-4">
              {checksToShow.map((check: SimulationCheck, index: number) => (
                <ExpandableCheckItem
                  key={`check-${check.title}-${index}`}
                  check={check}
                  stateChanges={report.stateChanges}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components
function ExpandableCheckItem({
  check,
  stateChanges,
}: {
  check: SimulationCheck;
  stateChanges?: SimulationStateChange[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    if (check.status === "warning") {
      return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
    if (check.status === "failed") {
      return <AlertTriangleIcon className="h-5 w-5 text-negative" />;
    }
    return <CheckCircleIcon className="h-5 w-5 text-positive" />;
  };

  const getStatusBadge = () => {
    if (check.status === "warning") {
      return (
        <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
          Warning
        </div>
      );
    }
    if (check.status === "failed") {
      return (
        <div className="px-3 py-1 rounded-full bg-negative/20 text-negative text-xs font-medium">
          Failed
        </div>
      );
    }
    return (
      <div className="px-3 py-1 rounded-full bg-positive/20 text-positive text-xs font-medium">
        Passed
      </div>
    );
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if this is a state changes check
  const isStateChangesCheck = check.title
    .toLowerCase()
    .includes("state changes");

  // Format the details content as React components
  const FormattedDetails = useMemo(() => {
    if (!check.details) return null;

    // Check if this is an ETH balance changes check
    if (check.title.toLowerCase().includes("eth balance changes")) {
      return <EthBalanceChanges details={check.details} />;
    }

    // Pre-process the raw details to remove all instances of "**Info**:" and similar patterns
    let preprocessedDetails = check.details;

    preprocessedDetails = preprocessedDetails.replace(
      /\*\*Info\*\*: - ([A-Za-z0-9]+ \([A-Za-z0-9]+\))/g,
      "$1"
    );

    // Then remove all other variations of Info prefixes
    preprocessedDetails = preprocessedDetails
      .replace(/\*\*Info\*\*:/g, "")
      .replace(/\*\*Warnings\*\*:/g, "")
      .replace(/Info:/g, "")
      .replace(/Warnings:/g, "")
      .replace(/^- \*\*Info\*\*:/gm, "")
      .replace(/^-\s*\*\*Info\*\*:/gm, "")
      .replace(/^-\s*Info:/gm, "")
      .replace(/^-\s*/gm, "");

    // Remove all markdown formatting
    const cleanedDetails = preprocessedDetails.replace(
      /\*\*([^*]+)\*\*:/g,
      "$1:"
    );

    // Split by lines to process each line
    const lines = cleanedDetails
      .split("\n")
      .filter((line: string) => line.trim() !== "");

    if (isStateChangesCheck) {
      // Only return StateChanges if stateChanges exists and is not empty
      return stateChanges && stateChanges.length > 0 ? (
        <StateChanges stateChanges={stateChanges} />
      ) : null;
    }

    return (
      <>
        {lines.map((line: string, index: number) => {
          // Final cleanup for any remaining Info prefixes
          let processedLine = line
            .replace(/^\*\*Info\*\*:\s*/, "")
            .replace(/^\*\*Info\*\*:\s*-\s*/, "")
            .replace(/^Info:\s*/, "")
            .replace(/^Info\s*-\s*/, "");

          // Remove "Info:" if it appears at the beginning of a line
          processedLine = processedLine
            .replace(/^\*\*Info\*\*:\s*/, "")
            .replace(/^\*\*Info\*\*:\s*-\s*/, "");

          if (
            processedLine.match(
              /^\*\*Info\*\*:\s*-\s*[A-Za-z0-9]+ \([A-Za-z0-9]+\)/
            )
          ) {
            processedLine = processedLine.replace(/^\*\*Info\*\*:\s*-\s*/, "");
          }

          const uniMatch = processedLine.match(
            /^\*\*Info\*\*: - ([A-Za-z0-9]+ \([A-Za-z0-9]+\))/
          );
          if (uniMatch) {
            processedLine = uniMatch[1];
          }

          if (
            processedLine.match(
              /^[A-Za-z0-9]+ \([A-Za-z0-9]+\) at `0x[a-fA-F0-9]{40}`/
            )
          ) {
            const match = processedLine.match(
              /^([A-Za-z0-9]+ \([A-Za-z0-9]+\)) at `(0x[a-fA-F0-9]{40})`/
            );
            if (match) {
              const contractName = match[1];
              const contractAddress = match[2];
              return (
                <div
                  key={`contract-header-${contractAddress}`}
                  className="mb-4 mt-2"
                >
                  <h3 className="text-lg font-semibold flex items-center">
                    {contractName}
                    <span className="ml-2 text-sm font-normal">
                      at{" "}
                      <a
                        href={getBlockScanAddress(contractAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs bg-tertiary/10 px-1 py-0.5 rounded hover:underline inline-flex items-center"
                      >
                        {contractAddress}
                        <ExternalLinkIcon className="h-3 w-3 ml-1" />
                      </a>
                    </span>
                  </h3>
                </div>
              );
            }
          }

          // Process line to replace addresses with links
          const parts: React.ReactNode[] = [];
          let lastIndex = 0;
          const addressRegex = /`(0x[a-fA-F0-9]{40})`/g;
          let match: RegExpExecArray | null;

          // Check if this is a target line
          const isTargetLine =
            processedLine.includes("Contract (verified)") ||
            processedLine.includes("EOA (verification not applicable)") ||
            processedLine.includes("Contract (looks safe)") ||
            processedLine.includes("Trusted contract");

          if (isTargetLine) {
            // Extract target address from the line - handle different formats
            const targetMatch =
              processedLine.match(/\[`(0x[a-fA-F0-9]{40})`\]/) ||
              processedLine.match(/at `(0x[a-fA-F0-9]{40})`/);
            if (targetMatch) {
              const address = targetMatch[1];
              // Get the contract status
              let status = "Unknown";
              if (processedLine.includes("Contract (verified)"))
                status = "Contract (verified)";
              else if (
                processedLine.includes("EOA (verification not applicable)")
              )
                status = "EOA";
              else if (processedLine.includes("Contract (looks safe)"))
                status = "Contract (looks safe)";
              else if (processedLine.includes("Trusted contract"))
                status = "Trusted contract";

              // Format the target with proper styling
              return (
                <div key={`target-${address}`} className="mb-3">
                  <div className="flex items-center flex-wrap">
                    <span className="mr-2">
                      {processedLine.includes("at `") ? "" : "Target:"}
                    </span>
                    <a
                      href={getBlockScanAddress(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs bg-wash p-2 rounded hover:underline inline-flex items-center"
                    >
                      {address}
                      <ExternalLinkIcon className="h-3 w-3 ml-1" />
                    </a>
                    <span className="ml-2 text-tertiary text-xs">{status}</span>
                  </div>
                </div>
              );
            }
          }

          // Check if this is an event line
          const isEventLine =
            processedLine.includes("`") &&
            (processedLine.includes("Transfer(") ||
              processedLine.includes("Approval(") ||
              (processedLine.includes("(") &&
                processedLine.includes(")") &&
                processedLine.includes(":")));

          // Check if this is a calldata line
          const isCalldataLine = processedLine.includes("transfers");

          if (isCalldataLine) {
            // Format calldata as code and remove any backticks
            const formattedLine = processedLine.replace(/`/g, "");

            // Extract addresses from the calldata line
            const fromAddressMatch = formattedLine.match(
              /(0x[a-fA-F0-9]{40}) transfers/
            );
            const toAddressMatch = formattedLine.match(
              /to (0x[a-fA-F0-9]{40})/
            );

            if (fromAddressMatch && toAddressMatch) {
              const fromAddress = fromAddressMatch[1];
              const toAddress = toAddressMatch[1];
              const amountMatch = formattedLine.match(/transfers ([0-9.]+)/);
              const amount = amountMatch ? amountMatch[1] : "";

              return (
                <div
                  key={`calldata-${formattedLine.substring(0, 30)}`}
                  className="mb-3"
                >
                  <code className="block font-mono text-xs bg-wash p-3 rounded whitespace-pre-wrap overflow-x-auto">
                    <span className="flex flex-wrap gap-2 items-center">
                      <a
                        href={getBlockScanAddress(fromAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs bg-tertiary/10 px-1 py-0.5 rounded hover:underline inline-flex items-center"
                      >
                        {fromAddress}
                        <ExternalLinkIcon className="h-3 w-3 ml-1" />
                      </a>
                      <span>transfers</span>
                      <span className="font-bold">{amount}</span>
                      <span>to</span>
                      <a
                        href={getBlockScanAddress(toAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs bg-tertiary/10 px-1 py-0.5 rounded hover:underline inline-flex items-center"
                      >
                        {toAddress}
                        <ExternalLinkIcon className="h-3 w-3 ml-1" />
                      </a>
                    </span>
                  </code>
                </div>
              );
            }

            // Fallback if we can't parse the addresses
            return (
              <div
                key={`calldata-${formattedLine.substring(0, 30)}`}
                className="mb-3"
              >
                <code className="block font-mono text-xs bg-wash p-3 rounded whitespace-pre-wrap overflow-x-auto">
                  {formattedLine}
                </code>
              </div>
            );
          }

          if (isEventLine) {
            // Format event as code
            const eventMatch = processedLine.match(/`([^`]+)`/);
            if (eventMatch) {
              const eventText = eventMatch[1];

              // Format the event with proper styling
              return (
                <div
                  key={`event-${eventText.substring(0, 30)}-${index}`}
                  className="mb-3"
                >
                  <code className="block font-mono text-xs bg-wash p-3 rounded whitespace-pre-wrap overflow-x-auto">
                    {eventText}
                  </code>
                </div>
              );
            }
          }

          // Use a different approach to avoid assignment in the while condition
          match = addressRegex.exec(processedLine);
          while (match !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
              parts.push(processedLine.substring(lastIndex, match.index));
            }

            // Add the address as a link
            const address = match[1];
            parts.push(
              <a
                key={`address-${address}-${match.index}`}
                href={getBlockScanAddress(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs bg-tertiary/10 px-1 py-0.5 rounded hover:underline inline-flex items-center"
              >
                {address}
                <ExternalLinkIcon className="h-3 w-3 ml-1" />
              </a>
            );

            lastIndex = match.index + match[0].length;
            match = addressRegex.exec(processedLine);
          }

          // Add remaining text
          if (lastIndex < processedLine.length) {
            parts.push(processedLine.substring(lastIndex));
          }

          // For simple informational lines like "No ETH is required..."
          if (
            processedLine.includes("No ETH is required") ||
            processedLine.includes("No ETH transfers detected") ||
            (parts.length === 1 &&
              typeof parts[0] === "string" &&
              !processedLine.includes("`"))
          ) {
            return (
              <div
                key={`info-${processedLine.substring(0, 30).replace(/\s+/g, "-")}`}
                className="mb-3"
              >
                <p className="text-tertiary">
                  {parts.length > 0 ? parts : processedLine}
                </p>
              </div>
            );
          }

          return (
            <p
              key={`line-${index}-${processedLine.substring(0, 20)}`}
              className="mb-2"
            >
              {parts.length > 0 ? parts : processedLine}
            </p>
          );
        })}
      </>
    );
  }, [check.details, isStateChangesCheck, stateChanges]);

  return (
    <div className="border border-line rounded-md overflow-hidden shadow-sm">
      <button
        type="button"
        className="w-full p-4 text-left hover:bg-wash transition-colors cursor-pointer flex justify-between items-start bg-wash"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <h4 className="font-medium text-primary">{check.title}</h4>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-tertiary" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-tertiary" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="p-5 pt-4 pl-11 text-sm border-t border-line bg-wash/50">
          {!check.details ? (
            <div className="mt-3">
              <span>No details available</span>
            </div>
          ) : isStateChangesCheck ? (
            <div className="mt-3">
              {stateChanges && stateChanges.length > 0 ? (
                <StateChanges stateChanges={stateChanges} />
              ) : (
                <div className="flex items-center justify-center p-6 text-tertiary">
                  <InfoIcon className="h-4 w-4 mr-2 text-tertiary" />
                  <span>No state changes available</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 whitespace-pre-wrap text-secondary">
              {FormattedDetails}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const isJsonObject = (value: string): boolean => {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
};

function StateChangeItem({
  stateChange,
}: {
  stateChange: SimulationStateChange;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const cleanValue = (value: string): string => {
    // If the value is wrapped in quotes (like JSON strings often are)
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    return value;
  };

  const formatJsonDiff = (oldValue: string, newValue: string) => {
    try {
      const oldJson = JSON.parse(oldValue);
      const newJson = JSON.parse(newValue);

      const changes: { key: string; old: any; new: any }[] = [];

      // Find all keys in both objects
      const allKeys = new Set([
        ...Object.keys(oldJson),
        ...Object.keys(newJson),
      ]);

      for (const key of allKeys) {
        const oldVal = oldJson[key];
        const newVal = newJson[key];

        // Only include if values are different
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push({ key, old: oldVal, new: newVal });
        }
      }

      return (
        <div className="bg-wash p-3 rounded-md mt-4 border border-line/30 overflow-hidden">
          <div className="text-sm text-tertiary mb-2">JSON Changes</div>
          <div className="space-y-2">
            {changes.map((change, index) => (
              <div key={index} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-tertiary">
                  {change.key}
                </span>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <code className="w-full sm:w-1/2 font-mono text-xs bg-negative/10 px-2 py-1 rounded whitespace-pre-wrap break-all overflow-x-auto">
                    {JSON.stringify(change.old, null, 2)}
                  </code>
                  <span className="text-tertiary hidden sm:block">→</span>
                  <code className="w-full sm:w-1/2 font-mono text-xs bg-positive/10 px-2 py-1 rounded whitespace-pre-wrap break-all overflow-x-auto">
                    {JSON.stringify(change.new, null, 2)}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error formatting JSON diff:", error);
      return null;
    }
  };

  const oldValueCleaned = cleanValue(stateChange.oldValue);
  const newValueCleaned = cleanValue(stateChange.newValue);

  // Determine if the change is a simple value change or a complex one
  const isNumericChange =
    !Number.isNaN(Number(oldValueCleaned)) &&
    !Number.isNaN(Number(newValueCleaned));
  const isAddressChange =
    oldValueCleaned.startsWith("0x") && newValueCleaned.startsWith("0x");
  const isBooleanChange =
    (oldValueCleaned === "true" || oldValueCleaned === "false") &&
    (newValueCleaned === "true" || newValueCleaned === "false");
  const isJsonChange =
    isJsonObject(oldValueCleaned) && isJsonObject(newValueCleaned);

  // Calculate difference for numeric values
  const getDifference = () => {
    if (isJsonChange) {
      return formatJsonDiff(oldValueCleaned, newValueCleaned);
    }

    if (isBooleanChange) {
      return (
        <div className="bg-wash p-3 rounded-md mt-4 border border-line/30 overflow-hidden">
          <div className="text-sm flex items-center justify-between">
            <span className="text-tertiary">Change</span>
            <span
              className={`font-bold ${newValueCleaned === "true" ? "text-positive" : "text-negative"}`}
            >
              {oldValueCleaned} → {newValueCleaned}
            </span>
          </div>
        </div>
      );
    }

    if (isAddressChange) {
      return (
        <div className="bg-wash p-3 rounded-md mt-4 border border-line/30 overflow-hidden">
          <div className="text-sm text-tertiary">Address Change</div>
          <div className="font-medium text-xs">
            <div className="flex flex-col gap-1 mt-2">
              <span className="break-all">
                From:{" "}
                <code className="bg-tertiary/10 px-1 py-0.5 rounded-md break-all">
                  <a
                    href={getBlockScanAddress(oldValueCleaned)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-tertiary transition-colors inline-flex items-center break-all"
                  >
                    {oldValueCleaned}
                    <ExternalLinkIcon className="h-3 w-3 ml-1 text-tertiary shrink-0" />
                  </a>
                </code>
              </span>
              <span className="break-all">
                To:{" "}
                <code className="bg-tertiary/10 px-1 py-0.5 rounded-md break-all">
                  <a
                    href={getBlockScanAddress(newValueCleaned)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-tertiary transition-colors inline-flex items-center break-all"
                  >
                    {newValueCleaned}
                    <ExternalLinkIcon className="h-3 w-3 ml-1 text-tertiary shrink-0" />
                  </a>
                </code>
              </span>
            </div>
          </div>
        </div>
      );
    }

    // For other types of changes, show a generic difference indicator
    return (
      <div className="bg-wash p-3 rounded-md mt-4 border border-line/30 overflow-hidden">
        <div className="text-sm text-tertiary">Change</div>
        <div className="font-medium text-xs">Value changed</div>
      </div>
    );
  };

  // Format the key to show decoded storage path if available
  const formatKey = () => {
    if (stateChange.isRawSlot) {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-tertiary text-xs">Storage Slot:</span>
          <code className="font-mono text-xs bg-tertiary/10 px-2 py-1 rounded break-all">
            {stateChange.key}
          </code>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        <span className="text-tertiary text-xs">Variable:</span>
        <code className="font-mono text-xs bg-tertiary/10 px-2 py-1 rounded break-all">
          {stateChange.key}
        </code>
      </div>
    );
  };

  return (
    <div className="border border-line rounded-md overflow-hidden shadow-sm">
      <button
        type="button"
        className="w-full p-4 text-left hover:bg-wash transition-colors cursor-pointer flex justify-between items-start"
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {formatKey()}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-tertiary" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-tertiary" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="p-5 pt-0 pl-11 text-sm border-t border-line bg-wash/50">
          {getDifference()}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="overflow-hidden">
              <span className="text-tertiary font-medium">Old Value: </span>
              <div className="font-mono text-xs break-all mt-2 bg-wash p-3 rounded-md border border-line/30 overflow-auto max-h-[200px]">
                {stateChange.oldValue}
              </div>
            </div>
            <div className="overflow-hidden">
              <span className="text-tertiary font-medium">New Value: </span>
              <div className="font-mono text-xs break-all mt-2 bg-wash p-3 rounded-md border border-line/30 overflow-auto max-h-[200px]">
                {stateChange.newValue}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EthTransferProps {
  from: string;
  to: string;
  amount: string;
  description?: string;
}

function EthTransfer({ from, to, amount, description }: EthTransferProps) {
  return (
    <div className="p-3 bg-wash rounded-md border border-line/30 space-y-2">
      <div className="flex items-center gap-2">
        <a
          href={getBlockScanAddress(from)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs bg-tertiary/10 px-2 py-1 rounded hover:bg-tertiary/20 transition-colors inline-flex items-center break-all w-full"
        >
          {from}
          <ExternalLinkIcon className="h-3 w-3 ml-1 text-tertiary shrink-0" />
        </a>
        <span className="text-tertiary shrink-0">→</span>
        <a
          href={getBlockScanAddress(to)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs bg-tertiary/10 px-2 py-1 rounded hover:bg-tertiary/20 transition-colors inline-flex items-center break-all w-full"
        >
          {to}
          <ExternalLinkIcon className="h-3 w-3 ml-1 text-tertiary shrink-0" />
        </a>
      </div>
      <div className="flex items-center justify-between">
        <div className="font-mono text-sm font-medium text-primary">
          {amount} ETH
        </div>
        {description && (
          <span className="text-tertiary text-xs">{description}</span>
        )}
      </div>
    </div>
  );
}

interface EthBalanceChangeProps {
  address: string;
  description: string;
  change: string;
}

function EthBalanceChange({
  address,
  description,
  change,
}: EthBalanceChangeProps) {
  const isPositive = change.startsWith("+");
  const isNegative = change.startsWith("-");

  return (
    <div className="p-3 bg-wash rounded-md border border-line/30 space-y-2">
      <a
        href={getBlockScanAddress(address)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs bg-tertiary/10 px-2 py-1 rounded hover:bg-tertiary/20 transition-colors inline-flex items-center break-all w-full"
      >
        {address}
        <ExternalLinkIcon className="h-3 w-3 ml-1 text-tertiary shrink-0" />
      </a>
      <div className="flex items-center justify-between">
        <span className="text-tertiary text-xs">{description}</span>
        <div
          className={`font-mono text-sm font-medium shrink-0 ${
            isPositive
              ? "text-positive"
              : isNegative
                ? "text-negative"
                : "text-tertiary"
          }`}
        >
          {change}
        </div>
      </div>
    </div>
  );
}

function EthBalanceChanges({ details }: { details: string }) {
  const transfers: EthTransferProps[] = [];
  const balanceChanges: EthBalanceChangeProps[] = [];
  let currentSection = "";

  const lines = details.split("\n");
  for (const line of lines) {
    if (line.startsWith("•")) {
      // Parse transfer line
      const transferMatch = line.match(
        /• (.*?) sent ([\d.]+) ETH to (.*?)(?: as part of the proposal execution| for proposal execution)?$/
      );
      if (transferMatch) {
        const [_, from, amount, to] = transferMatch;
        transfers.push({
          from: from.match(/\[(.*?)\]\(.*?\)/)?.[1] || from,
          to: to.match(/\[(.*?)\]\(.*?\)/)?.[1] || to,
          amount,
          description: line.includes("as part of the proposal execution")
            ? "Part of proposal execution"
            : line.includes("for proposal execution")
              ? "For proposal execution"
              : undefined,
        });
      }
    } else if (line.includes("ETH Balance Changes")) {
      currentSection = "balance";
    } else if (currentSection === "balance" && line.includes("|")) {
      const balanceMatch = line.match(
        /\| `(0x[a-fA-F0-9]{40})` \| (.*?) \| <span style="color:(.*?)">([+-]?[\d.]+) ETH<\/span> \|/
      );
      if (balanceMatch) {
        const [_, address, description, color, amount] = balanceMatch;
        balanceChanges.push({
          address,
          description,
          change: `${amount} ETH`,
        });
      }
    }
  }

  if (transfers.length === 0 && balanceChanges.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-tertiary border border-line rounded-md bg-wash/30">
        <InfoIcon className="h-4 w-4 mr-2 text-tertiary" />
        <span>No ETH balance changes found</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transfers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-tertiary">ETH Transfers</h4>
          {transfers.map((transfer, index) => (
            <EthTransfer key={index} {...transfer} />
          ))}
        </div>
      )}
      {balanceChanges.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-tertiary">
            ETH Balance Changes
          </h4>
          {balanceChanges.map((change, index) => (
            <EthBalanceChange key={index} {...change} />
          ))}
        </div>
      )}
    </div>
  );
}
