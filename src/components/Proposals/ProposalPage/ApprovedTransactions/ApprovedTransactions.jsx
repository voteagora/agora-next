"use client";

import CodeChange from "./CodeChange";
import { useState } from "react";
import { formatEther } from "viem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl } from "@/lib/utils";
import { TENANT_NAMESPACES } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";

export default function ApprovedTransactions({
  proposalData,
  proposalType,
  executedTransactionHash,
}) {
  const [displayedOptions, setDisplayedOptions] = useState(1);
  const toggleElements = () => {
    displayedOptions === 1
      ? setDisplayedOptions(proposalData.options.length)
      : setDisplayedOptions(1);
  };

  if (proposalData.options.length === 0) {
    return null;
  }

  const { namespace } = Tenant.current();

  const isNoProposedTransactions =
    proposalType === "STANDARD" &&
    proposalData.options[0].calldatas[0] === "0x";

  return (
    <div className="flex flex-col gap-1 border border-line rounded-lg bg-wash py-4">
      <div className="flex items-center justify-between px-4 mb-2">
        <p className="font-mono text-xs font-medium leading-4 text-tertiary">
          {isNoProposedTransactions ? "No " : ""}
          Proposed Transactions{" "}
          {namespace === TENANT_NAMESPACES.OPTIMISM &&
            "(signal only – transactions are manually executed by the Foundation)"}
        </p>
        {executedTransactionHash && (
          <a
            href={getBlockScanUrl(executedTransactionHash)}
            target="_blank"
            rel="noreferrer noopener"
          >
            <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
          </a>
        )}
      </div>
      {!isNoProposedTransactions && (
        <div className="flex flex-col px-4">
          {proposalData.options.slice(0, displayedOptions).map((option) => {
            return (
              <>
                {proposalType === "APPROVAL" && (
                  <p className="font-mono text-xs font-medium leading-4 text-tertiary">
                    {"//"} {option.description}
                  </p>
                )}
                {option.values.length > 0 &&
                  option.targets.map((t, i) => {
                    const valueETH =
                      option.values[i] > 0
                        ? `{ value: ${formatEther(option.values[i])} ETH }`
                        : undefined;
                    return (
                      <div key={i}>
                        <CodeChange
                          target={option.targets[i]}
                          valueETH={valueETH}
                          functionName={option.functionArgsName[i].functionName}
                          functionArgs={option.functionArgsName[i].functionArgs}
                        />
                      </div>
                    );
                  })}
              </>
            );
          })}
        </div>
      )}
      {proposalData.options.length > 1 && (
        <div
          className="cursor-pointer text-xs font-mono font-medium text-tertiary leading-4 p-4 pb-0 border-t border-line"
          onClick={toggleElements}
        >
          {displayedOptions === 1
            ? `Reveal ${proposalData.options.length - 1} more options`
            : "Hide options"}
        </div>
      )}
    </div>
  );
}
