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
import { useReadContract, useBlockNumber } from "wagmi";
import { TENANT_NAMESPACES } from "@/lib/constants";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

const GovernorSettingsProposalTypes = ({
  proposalTypes,
}: {
  proposalTypes: any[];
}) => {
  const { contracts, namespace, token } = Tenant.current();

  const isApprovalThresholdSupportedbyGovernor =
    namespace !== TENANT_NAMESPACES.UNISWAP &&
    namespace !== TENANT_NAMESPACES.ENS;

  // TODO: Refactor this to use the governor types
  const isQuorumSupportedByGovernor =
    namespace !== TENANT_NAMESPACES.CYBER &&
    namespace !== TENANT_NAMESPACES.BOOST &&
    namespace !== TENANT_NAMESPACES.PGUILD &&
    namespace !== TENANT_NAMESPACES.DERIVE &&
    namespace !== TENANT_NAMESPACES.DEMO &&
    namespace !== TENANT_NAMESPACES.B3 &&
    namespace !== TENANT_NAMESPACES.XAI &&
    namespace !== TENANT_NAMESPACES.SCROLL;

  const { data: blockNumber } = useBlockNumber({
    chainId: contracts.governor.chain.id,
  });

  let args;
  if (namespace === TENANT_NAMESPACES.ENS) {
    args = [BigInt(blockNumber || 0)];
  } else {
    args = undefined;
  }

  const { data: quorum, isFetched: isQuorumFetched } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName:
      namespace === TENANT_NAMESPACES.UNISWAP ? "quorumVotes" : "quorum",
    query: { enabled: isQuorumSupportedByGovernor },
    args,
    chainId: contracts.governor.chain.id,
  }) as { data: bigint | undefined; isFetched: boolean };

  const { data: threshold, isFetched: isThresholdFetched } = useReadContract({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "proposalThreshold",
    chainId: contracts.governor.chain.id,
  }) as { data: bigint | undefined; isFetched: boolean };

  const showQuorum = isQuorumSupportedByGovernor || proposalTypes.length > 0;

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-base font-semibold text-left text-secondary bg-wash">
          <TableHead colSpan={3} className="text-secondary rounded-tl-lg">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-row space-x-1 items-center">
                  <span>Proposal type</span>
                  <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                </TooltipTrigger>
                <TooltipContent className="text-primary text-sm max-w-[200px]">
                  Proposal types can have different quorums and approval
                  thresholds.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
          {isApprovalThresholdSupportedbyGovernor && (
            <TableHead colSpan={3} className="text-secondary">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex flex-row space-x-1 items-center">
                    <span>Approval threshold</span>
                    <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                  </TooltipTrigger>
                  <TooltipContent className="text-primary text-sm max-w-[200px]">
                    {`For votes as a percentage of (For + Against) required for a vote to be approved ("pass").`}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          )}
          <TableHead
            colSpan={4}
            className={cn("text-secondary", showQuorum ? "" : "rounded-tr-lg")}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex flex-row space-x-1 items-center">
                  <span>Proposal threshold</span>
                  <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                </TooltipTrigger>
                <TooltipContent className="text-primary text-sm max-w-[200px]">
                  How much voting power is needed to submit a proposal of this
                  type.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TableHead>
          {showQuorum && (
            <TableHead colSpan={4} className="text-secondary rounded-tr-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex flex-row space-x-1 items-center">
                    <span>Quorum</span>
                    <QuestionMarkCircleIcon className="h-4 w-4 text-secondary" />
                  </TooltipTrigger>
                  <TooltipContent className="text-primary text-sm max-w-[200px]">
                    What percentage of the total supply of voting power must
                    vote For, Against, or Abstain in order for a vote to be
                    valid.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isQuorumSupportedByGovernor && (
          <TableRow className="text-base font-semibold text-secondary">
            <TableCell
              className={cn(!proposalTypes?.length && "rounded-bl-lg")}
              colSpan={3}
            >
              Default
            </TableCell>
            <TableCell colSpan={4}>
              {isThresholdFetched && threshold !== undefined && (
                <TokenAmountDecorated
                  amount={BigInt(threshold.toString())}
                  currency={token.symbol}
                  decimals={token.decimals}
                />
              )}
            </TableCell>
            <TableCell
              className={cn(!proposalTypes?.length && "rounded-br-lg")}
              colSpan={4}
            >
              {isQuorumFetched && quorum && (
                <TokenAmountDecorated
                  amount={BigInt(quorum.toString())}
                  currency={token.symbol}
                  decimals={token.decimals}
                />
              )}
            </TableCell>
          </TableRow>
        )}
        {proposalTypes.map((proposalType, i) => (
          <TableRow
            key={`proposal-type-${proposalType.id}`}
            className="text-base font-semibold text-secondary"
          >
            <TableCell
              className={cn(i === proposalTypes.length - 1 && "rounded-bl-lg")}
              colSpan={3}
            >
              {proposalType.name}
            </TableCell>
            <TableCell colSpan={4}>
              {Number(proposalType.approval_threshold) / 100} %
            </TableCell>
            <TableCell colSpan={3}>
              {isThresholdFetched && threshold !== undefined && (
                <TokenAmountDecorated
                  amount={BigInt(threshold.toString())}
                  currency={token.symbol}
                  decimals={token.decimals}
                />
              )}
            </TableCell>
            <TableCell
              className={cn(i === proposalTypes.length - 1 && "rounded-br-lg")}
              colSpan={4}
            >
              {Number(proposalType.quorum) / 100} %
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GovernorSettingsProposalTypes;
