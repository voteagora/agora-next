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
import { useContractRead } from "wagmi";
import { TENANT_NAMESPACES } from "@/lib/constants";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";

const GovernorSettingsProposalTypes = () => {
  const { contracts, namespace, token } = Tenant.current();

  // TODO: Refactor this to use the governor types
  const isQuorumSupportedByGovernor = namespace !== TENANT_NAMESPACES.CYBER;

  const { data: quorum, isFetched: isQuorumFetched } = useContractRead({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName:
      namespace === TENANT_NAMESPACES.UNISWAP ? "quorumVotes" : "quorum",
    enabled: isQuorumSupportedByGovernor,
  });

  const { data: threshold, isFetched: isThresholdFetched } = useContractRead({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "proposalThreshold",
  });

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-base font-semibold text-left text-gray-4f bg-gray-fa">
          <TableHead colSpan={3}>Proposal type</TableHead>
          <TableHead colSpan={4}>Proposal threshold</TableHead>
          {isQuorumSupportedByGovernor && (
            <TableHead colSpan={4}>Quorum</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="text-base font-semibold text-gray-4f">
          <TableCell colSpan={3}>Default</TableCell>
          <TableCell colSpan={4}>
            {isThresholdFetched && threshold !== undefined && (
              <TokenAmountDisplay
                amount={BigInt(threshold.toString())}
                currency={token.symbol}
                decimals={token.decimals}
              />
            )}
          </TableCell>
          {isQuorumSupportedByGovernor && (
            <TableCell colSpan={4}>
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
      </TableBody>
    </Table>
  );
};

export default GovernorSettingsProposalTypes;
