"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Tenant from "@/lib/tenant/tenant";
import { useReadContract } from "wagmi";
import { TENANT_NAMESPACES } from "@/lib/constants";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { formatNumber } from "@/lib/tokenUtils";

const GovernorSettingsProposalTypes = ({
  proposalTypes,
}: {
  proposalTypes: any[];
}) => {
  const { contracts, namespace, token } = Tenant.current();

  // TODO: Refactor this to use the governor types
  const isQuorumSupportedByGovernor =
    namespace !== TENANT_NAMESPACES.CYBER &&
    namespace !== TENANT_NAMESPACES.PGUILD;

  const { data: quorum, isFetched: isQuorumFetched } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName:
      namespace === TENANT_NAMESPACES.UNISWAP ? "quorumVotes" : "quorum",
    query: { enabled: isQuorumSupportedByGovernor },
  }) as { data: bigint | undefined; isFetched: boolean };

  const { data: threshold, isFetched: isThresholdFetched } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "proposalThreshold",
  }) as { data: bigint | undefined; isFetched: boolean };

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-base font-semibold text-left text-secondary bg-wash">
          <TableHead colSpan={3} className="rounded-tl-xl text-secondary">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-row space-x-1 items-center">
                  <span>Proposal type</span>
                  <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                </TooltipTrigger>
                <TooltipContent className="text-sm max-w-[200px]">
                  Proposal types can have different quorums and approval
                  thresholds.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
          <TableHead colSpan={3} className="rounded-tl-xl text-secondary">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-row space-x-1 items-center">
                  <span>Approval threshold</span>
                  <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                </TooltipTrigger>
                <TooltipContent className="text-sm max-w-[200px]">
                  {`For votes as a percentage of (For + Against) required for a vote to be approved ("pass").`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
          <TableHead
            colSpan={4}
            className={`text-secondary ${isQuorumSupportedByGovernor ? "rounded-none" : "rounded-tr-xl"}`}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-row space-x-1 items-center">
                  <span>Proposal threshold</span>
                  <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                </TooltipTrigger>
                <TooltipContent className="text-sm max-w-[200px]">
                  How much voting power is needed to submit a proposal of this
                  type.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
          {isQuorumSupportedByGovernor ||
            (proposalTypes.length > 0 && (
              <TableHead colSpan={4} className="text-secondary rounded-tr-xl">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex flex-row space-x-1 items-center">
                      <span>Quorum</span>
                      <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                    </TooltipTrigger>
                    <TooltipContent className="text-sm max-w-[200px]">
                      What percentage of the total supply of voting power must
                      vote For, Against, or Abstain in order for a vote to be
                      valid.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
            ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isQuorumSupportedByGovernor && (
          <TableRow className="text-base font-semibold text-secondary">
            <TableCell colSpan={3} className="rounded-bl-xl">
              Default
            </TableCell>
            <TableCell
              colSpan={4}
              className={`${isQuorumSupportedByGovernor ? "rounded-none" : "rounded-br-xl"}`}
            >
              {isThresholdFetched && threshold !== undefined && (
                <TokenAmountDisplay
                  amount={BigInt(threshold.toString())}
                  currency={token.symbol}
                  decimals={token.decimals}
                />
              )}
            </TableCell>
            {isQuorumSupportedByGovernor && (
              <TableCell colSpan={4} className="rounded-br-xl">
                {isQuorumFetched && quorum && (
                  <TokenAmountDisplay
                    amount={BigInt(quorum.toString())}
                    currency={token.symbol}
                    decimals={token.decimals}
                  />
                )}
              </TableCell>
            )}
          </TableRow>
        )}
        {proposalTypes.map((proposalType) => (
          <TableRow
            key={`proposal-type-${proposalType.id}`}
            className="text-base font-semibold text-secondary"
          >
            <TableCell colSpan={3} className="rounded-bl-xl">
              {proposalType.name}
            </TableCell>

            <TableCell
              colSpan={4}
              className={`${isQuorumSupportedByGovernor ? "rounded-none" : "rounded-br-xl"}`}
            >
              {Number(proposalType.approval_threshold) / 100} %
            </TableCell>
            <TableCell colSpan={3} className="rounded-bl-xl">
              {threshold && formatNumber(threshold)}
            </TableCell>
            <TableCell colSpan={4} className="rounded-br-xl">
              {Number(proposalType.quorum) / 100} %
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GovernorSettingsProposalTypes;
