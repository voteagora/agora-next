"use client";

import React, { useState } from "react";
import {
  getBlockScanUrl,
  getBlockScanAddress,
  shortAddress,
} from "@/lib/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useTransactionDecoding } from "@/hooks/useTransactionDecoding";

const ProposalTransactionDisplay = ({
  targets,
  calldatas,
  values,
  descriptions,
  executedTransactionHash,
  simulationDetails,
  network = "mainnet",
}: {
  targets: string[];
  calldatas: `0x${string}`[];
  values: string[];
  descriptions?: string[];
  executedTransactionHash?: string | null;
  simulationDetails?: {
    id?: string | null;
    state?: string | null;
  };
  network?: string;
}) => {
  const [collapsed, setCollapsed] = useState(true);

  if (targets.length === 0) {
    return (
      <div>
        <div className="flex flex-col border rounded-lg border-line p-4 text-xs text-secondary break-words overflow-hidden">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs text-tertiary">Actions</span>
          </div>
          <div className="text-xs text-tertiary mt-1">
            This proposal does not execute any transactions.
          </div>
        </div>
      </div>
    );
  }

  const normalizedLength = Math.min(
    targets.length,
    calldatas.length,
    values.length
  );

  return (
    <div>
      <div className="flex flex-col border rounded-t-lg border-line text-xs text-primary break-words overflow-hidden">
        <div className="w-full flex items-center justify-between mb-2 border-b border-line px-4 py-3">
          <span className="text-xs font-semibold text-primary">Actions</span>
          {executedTransactionHash && (
            <a
              href={getBlockScanUrl(executedTransactionHash)}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          )}
          {simulationDetails?.id && simulationDetails?.state && (
            <>
              {simulationDetails.state === "UNCONFIRMED" ? (
                <div className="bg-neutral/20 text-secondary rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-x-1">
                  <span>Simulation {simulationDetails.state}</span>
                </div>
              ) : (
                <a
                  href={`https://dashboard.tenderly.co/shared/simulation/${simulationDetails.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`
                ${simulationDetails.state === "VALID" ? "bg-positive/20 hover:bg-positive/30 text-positive" : simulationDetails.state === "INVALID" ? "bg-negative/20 hover:bg-negative/30 text-negative" : "bg-neutral text-secondary"}
                transition-colors cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-x-1`}
                >
                  <span>Simulation {simulationDetails.state}</span>
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 ml-1" />
                </a>
              )}
            </>
          )}
        </div>
        <div className="p-4 pt-2">
          {(collapsed ? [targets[0]] : targets.slice(0, normalizedLength)).map(
            (target, idx) => (
              <TransactionItem
                key={idx}
                target={target}
                calldata={idx < calldatas.length ? calldatas[idx] : "0x"}
                value={idx < values.length ? values[idx] : "0"}
                description={
                  descriptions && idx < descriptions.length
                    ? descriptions[idx]
                    : undefined
                }
                collapsed={collapsed}
                network={network}
                index={idx}
              />
            )
          )}
        </div>
      </div>
      <div
        className="border border-t-0 border-line rounded-b-lg p-4 cursor-pointer text-sm text-tertiary font-medium hover:bg-neutral/10 transition-colors flex justify-center"
        onClick={() => {
          setCollapsed(!collapsed);
        }}
      >
        {collapsed
          ? `Expand all actions (${normalizedLength})`
          : "Collapse actions"}
      </div>
    </div>
  );
};

const TransactionItem = ({
  target,
  calldata,
  value,
  description,
  collapsed,
  network,
  index,
}: {
  target: string;
  calldata: `0x${string}`;
  value: string;
  description?: string;
  collapsed: boolean;
  network: string;
  index: number;
}) => {
  const {
    data: decodedData,
    isLoading,
    error,
  } = useTransactionDecoding(target, calldata, value, network, {
    enabled: index === 0 || !collapsed,
  });

  return (
    <div className={`${index > 0 ? "pt-4" : ""}`}>
      {description && (
        <div className="text-tertiary mb-2 text-xs italic">{`// ${description}`}</div>
      )}

      <div className="flex justify-between items-center mb-2">
        <div className="text-base font-semibold text-primary">
          Action {index + 1}
        </div>
        <a
          className="text-xs text-tertiary hover:text-primary transition-colors flex items-center"
          href={getBlockScanAddress(target)}
          target="_blank"
          rel="noreferrer noopener"
        >
          View contract
          <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
        </a>
      </div>

      <div className="flex flex-col gap-y-10 border-line border rounded-lg p-4 bg-wash">
        <ActionSummary
          decodedData={decodedData}
          target={target}
          value={value}
          isLoading={isLoading}
          error={error ? (error as Error).message : null}
        />

        {!collapsed && (
          <ActionDetails
            decodedData={decodedData}
            target={target}
            calldata={calldata}
            value={value}
            isLoading={isLoading}
            error={error ? (error as Error).message : null}
          />
        )}
      </div>
    </div>
  );
};

const safelyFormatEther = (val: string) => {
  return `${BigInt(val).toString()}`;
};

const ActionSummary = ({
  decodedData,
  target,
  value,
  isLoading,
  error,
}: {
  decodedData: any;
  target: string;
  value: string;
  isLoading: boolean;
  error: string | null;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-2 font-semibold text-primary text-base">
        <div>Signature</div>
        <div className="text-xs">Decoding transaction...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-y-2 font-semibold text-negative text-base">
        <div>Signature</div>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs">Error</div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">{error}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  if (!decodedData) {
    return (
      <div className="flex flex-col gap-y-2 font-semibold text-primary text-base">
        <div>Raw Transaction</div>
        <div className="text-xs">
          <a
            className="hover:underline"
            href={getBlockScanAddress(target)}
            target="_blank"
            rel="noreferrer noopener"
          >
            {shortAddress(target)}
          </a>
          {!!value && BigInt(value) > 0n && (
            <span className="ml-2 text-xs">{safelyFormatEther(value)}</span>
          )}
        </div>
      </div>
    );
  }

  if (decodedData.function === "transfer") {
    const valueToUse =
      decodedData?.parameters?.value?.value ||
      decodedData?.parameters?.rawAmount?.value ||
      decodedData?.parameters?.amount?.value ||
      value;
    return (
      <div className="flex justify-between items-center font-semibold text-primary text-base">
        <div>Transfer</div>
        <div className="text-xs">{safelyFormatEther(valueToUse)}</div>
      </div>
    );
  }

  const functionSignature = getFunctionSignature(decodedData);

  return (
    <div className="flex flex-col gap-y-2 font-semibold text-primary text-base">
      <div>Signature</div>
      {functionSignature ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate text-xs break-all">
                {functionSignature}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs break-all max-w-[400px]">
                {functionSignature}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="truncate text-xs break-all">
          {decodedData.function === "unknown" || !decodedData.function
            ? "Function Call"
            : formatFunctionName(decodedData.function)}
        </div>
      )}
    </div>
  );
};

const ActionDetails = ({
  decodedData,
  target,
  calldata,
  value,
  isLoading,
  error,
}: {
  decodedData: any;
  target: string;
  calldata: `0x${string}`;
  value: string;
  isLoading: boolean;
  error: string | null;
}) => {
  if (isLoading) {
    return (
      <div className="text-primary text-xs font-semibold">
        Decoding transaction data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-base text-primary font-semibold">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-negative">Error</div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">{error}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="mt-2 text-xs">
          <div>Raw calldata:</div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="break-all mt-1 text-secondary truncate">
                  {calldata}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs break-all max-w-[400px] max-h-[300px] overflow-auto">
                  {calldata}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  if (decodedData && decodedData.function === "transfer") {
    const recipient =
      decodedData?.parameters?.to?.value ||
      decodedData?.parameters?.dst?.value ||
      decodedData?.parameters?.recipient?.value ||
      target;
    const valueToUse =
      decodedData?.parameters?.value?.value ||
      decodedData?.parameters?.rawAmount?.value ||
      decodedData?.parameters?.amount?.value ||
      value;
    const amount = safelyFormatEther(valueToUse);
    const note = decodedData?.parameters?.note?.value || "";
    const from = "";

    const isMultiRecipient =
      recipient.includes(",") ||
      (decodedData?.parameters?.recipients?.value &&
        Array.isArray(decodedData.parameters.recipients.value));

    const recipientCount = isMultiRecipient
      ? Array.isArray(decodedData?.parameters?.recipients?.value)
        ? decodedData.parameters.recipients.value.length
        : "multiple"
      : 1;

    return (
      <div className="text-base text-primary font-semibold">
        <div className="flex flex-col gap-y-2">
          <span>Transfer:</span>
          <span className="text-xs">{amount}</span>

          <span>To:</span>
          <div className="text-xs">
            {isMultiRecipient ? (
              <span>{recipientCount} wallets</span>
            ) : (
              <a
                className="hover:underline"
                href={getBlockScanAddress(recipient)}
                target="_blank"
                rel="noreferrer noopener"
              >
                {recipient}
              </a>
            )}
          </div>

          {from && (
            <>
              <span>From:</span>
              <span className="text-xs">{from}</span>
            </>
          )}

          {note && (
            <>
              <span>Note:</span>
              <span className="text-xs">{note}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!decodedData) {
    if ((calldata && calldata !== "0x") || (value && BigInt(value) > 0n)) {
      return (
        <div className="text-base text-primary font-semibold">
          <div className="flex flex-col gap-y-2">
            <span>Contract:</span>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    className="hover:underline truncate inline-block text-xs"
                    href={getBlockScanAddress(target)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {target}
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs break-all">{target}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {!!value && BigInt(value) > 0n && (
              <>
                <span>Value:</span>
                <span className="text-xs">{safelyFormatEther(value)}</span>
              </>
            )}

            {calldata && calldata !== "0x" && (
              <>
                <span>Calldata:</span>
                <div className="text-xs break-all overflow-hidden">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="truncate">{calldata}</div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs break-all max-w-[400px] max-h-[300px] overflow-auto">
                          {calldata}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  const hasParameters =
    decodedData.parameters && Object.keys(decodedData.parameters).length > 0;
  const hasValue = value && BigInt(value) > 0n;
  const hasTarget = target && target !== "0x";

  if (!hasParameters && !hasValue) {
    return null;
  }

  return (
    <div className="text-base text-primary font-semibold">
      <div className="flex flex-col gap-y-10">
        {hasParameters && (
          <div>
            <div className="mb-2">Parameters:</div>
            <div className="text-xs">
              <ParametersList parameters={decodedData.parameters} />
            </div>
          </div>
        )}

        {hasTarget && (
          <div>
            <div className="mb-2">Target:</div>
            <div className="text-xs">
              <ParameterValue param={{ value: target, type: "address" }} />
            </div>
          </div>
        )}

        {!!hasValue && (
          <div>
            <div className="mb-2">Value:</div>
            <div className="text-xs">{safelyFormatEther(value)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const ParametersList = ({ parameters }: { parameters: any }) => {
  if (!parameters || typeof parameters !== "object") {
    return <div className="text-xs">No parameters available</div>;
  }

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-2 mt-1">
      {Object.entries(parameters).map(([name, param]: [string, any], index) => (
        <React.Fragment key={index}>
          <span className="text-xs">{name}:</span>
          <ParameterValue param={param} />
        </React.Fragment>
      ))}
    </div>
  );
};

const ParameterValue = ({ param }: { param: any }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isLargeValue =
    (typeof param.value === "string" && param.value.length > 100) ||
    (Array.isArray(param.value) && param.value.length > 5);

  if (param.nestedFunction) {
    return (
      <div className="flex flex-col">
        <span className="text-xs">
          {formatFunctionName(param.nestedFunction.name || "Unknown")}()
        </span>
        {param.nestedFunction.parameters &&
          Object.keys(param.nestedFunction.parameters).length > 0 && (
            <div className="ml-4 mt-1">
              <ParametersList parameters={param.nestedFunction.parameters} />
            </div>
          )}
      </div>
    );
  }

  if (param.components) {
    return (
      <div className="flex flex-col">
        <div
          className={`flex items-center ${isLargeValue ? "cursor-pointer" : ""}`}
          onClick={() => isLargeValue && setIsCollapsed(!isCollapsed)}
        >
          {isLargeValue && (
            <span className="mr-1">
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
        {(!isCollapsed || !isLargeValue) && (
          <div className="ml-4 mt-1">
            <ParametersList parameters={param.components} />
          </div>
        )}
      </div>
    );
  }

  if (param.type === "address" && param.value) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              className="text-xs hover:underline truncate inline-block max-w-full"
              href={getBlockScanAddress(param.value)}
              target="_blank"
              rel="noreferrer noopener"
            >
              {param.value}
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs break-all">{param.value}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (param.type === "bytes" || param.type === "string") {
    if (typeof param.value === "string" && param.value.length > 100) {
      return (
        <div className="break-all max-w-full overflow-hidden">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            )}
            <span className="text-xs truncate">
              {isCollapsed ? "Show full value" : "Collapse"}
            </span>
          </div>
          <div className="mt-1">
            {isCollapsed ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="truncate text-xs">{`${param.value.substring(0, 100)}...`}</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs break-all max-w-[400px] max-h-[300px] overflow-auto">
                      {param.value}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="break-all text-xs">{param.value}</div>
            )}
          </div>
        </div>
      );
    }
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate text-xs max-w-full">{param.value}</div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs break-all max-w-[400px]">{param.value}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (Array.isArray(param.value)) {
    const isLargeArray = param.value.length > 5;

    return (
      <div className="flex flex-col">
        <div
          className={`flex items-center ${isLargeArray ? "cursor-pointer" : ""}`}
          onClick={() => isLargeArray && setIsCollapsed(!isCollapsed)}
        >
          {isLargeArray && (
            <span className="mr-1">
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </span>
          )}
          <span className="text-xs">[{param.value.length} items]</span>
        </div>

        {(!isCollapsed || !isLargeArray) && (
          <div className="ml-4 mt-1">
            {param.value.map((item: any, idx: number) => (
              <div key={idx} className="mb-1 flex items-center gap-1">
                <span className="text-xs">{idx}:</span>{" "}
                <span className="text-xs inline-flex">
                  {formatArrayItem(item)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof param.value === "string" && param.value.length > 30) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs truncate inline-block max-w-full">
              {param.value?.toString()}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs break-all max-w-[400px]">
              {param.value?.toString()}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className="text-xs break-words">{param.value?.toString()}</span>;
};

function formatArrayItem(item: any): React.ReactNode {
  if (item === null) {
    return "null";
  }

  if (typeof item === "object") {
    try {
      if (Array.isArray(item)) {
        return `[Array(${item.length})]`;
      }

      const keys = Object.keys(item);
      if (keys.length === 0) {
        return "{}";
      }

      const preview = keys
        .slice(0, 3)
        .map((key) => {
          const value =
            typeof item[key] === "object" && item[key] !== null
              ? Array.isArray(item[key])
                ? `Array(${item[key].length})`
                : "{...}"
              : String(item[key]).substring(0, 10) +
                (String(item[key]).length > 10 ? "..." : "");
          return `${key}: ${value}`;
        })
        .join(", ");

      const displayText = `{ ${preview}${keys.length > 3 ? ", ..." : ""} }`;

      let stringified = "";
      let circularDetected = false;

      try {
        const getCircularReplacer = () => {
          const seen = new WeakSet();
          return (_: string, value: any) => {
            if (typeof value === "object" && value !== null) {
              if (seen.has(value)) {
                circularDetected = true;
                return "[Circular Reference]";
              }
              seen.add(value);
            }
            return value;
          };
        };

        stringified = JSON.stringify(item, getCircularReplacer(), 2);
      } catch (e) {
        stringified = "[Error: Could not stringify object]";
        circularDetected = true;
      }

      const tooltipContent = circularDetected
        ? stringified +
          "\n\n(Note: circular references were detected and simplified)"
        : stringified;

      if (displayText.length > 50 || stringified.length > 100) {
        return (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate inline-block max-w-full">
                  {displayText.length > 50
                    ? `${displayText.substring(0, 50)}...`
                    : displayText}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs break-all max-w-[400px] max-h-[300px] overflow-auto whitespace-pre-wrap">
                  {tooltipContent}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return displayText;
    } catch (e) {
      return "[Complex Object]";
    }
  }

  const str = String(item);
  if (str.length > 50) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate inline-block max-w-full">
              {`${str.substring(0, 50)}...`}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs break-all max-w-[400px]">{str}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return str;
}

function formatFunctionName(name: string): string {
  if (!name) return "Unknown Function";
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getFunctionSignature(decodedData: any): string | null {
  if (
    !decodedData ||
    !decodedData.function ||
    decodedData.function === "unknown"
  ) {
    return null;
  }

  try {
    let signature = `${decodedData.function}(`;
    const paramTypes = Object.entries(decodedData.parameters).map(
      ([_, param]: [string, any]) => {
        return param.type || "unknown";
      }
    );
    signature += paramTypes.join(",");
    signature += ")";
    return signature;
  } catch (error) {
    return null;
  }
}

export default ProposalTransactionDisplay;
