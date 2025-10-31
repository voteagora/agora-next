"use client";

import { useQuery } from "@tanstack/react-query";
import { ExecutionTransaction } from "@/lib/types";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import { shortAddress } from "@/lib/utils";
import { getChainById } from "@/lib/viem";

interface ExecutionTransactionsProps {
  proposalId: string;
  tenant: string;
}

/**
 * Utility functions moved outside component 
/** */
const formatAddress = (address: string) => {
  // For ENS names, don't truncate if they're short enough
  if (address.includes(".") && address.length <= 20) {
    return address;
  }
  // For addresses, use the shortAddress utility
  return shortAddress(address) || address;
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "MM/dd/yyyy");
};

const formatTransactionHash = (hash: string) => {
  // Match the design: 905948204....o402802
  return `${hash.slice(0, 9)}....${hash.slice(-7)}`;
};

/**
 * Get block scanner URL using viem's getChainById - replaces manual chain mapping.
 */
const getBlockScanUrl = (chainId: number, txHash: string) => {
  const chain = getChainById(chainId);
  if (chain?.blockExplorers?.default?.url) {
    return `${chain.blockExplorers.default.url}/tx/${txHash}`;
  }
  // Fallback to etherscan if chain not found
  return `https://etherscan.io/tx/${txHash}`;
};

/**
 * Get network name using viem's getChainById - replaces manual network mapping.
 */
const getNetworkName = (chainId: number) => {
  const chain = getChainById(chainId);
  return chain?.name || "Unknown";
};

export default function ExecutionTransactions({
  proposalId,
  tenant,
}: ExecutionTransactionsProps) {
  // Using react-query instead of useEffect for data fetching
  const {
    data: transactions = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["execution-transactions", proposalId, tenant],
    queryFn: async () => {
      const response = await fetch(
        `/api/common/execution-transactions?proposalId=${proposalId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      return data.transactions || [];
    },
    enabled: !!proposalId && !!tenant,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (loading) {
    return (
      <div
        className="mb-1 border rounded-lg p-4"
        style={{ borderColor: "#E0E0E0" }}
      >
        <div className="text-sm" style={{ color: "#4F4F4F" }}>
          Loading transactions...
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return (
      <div
        className="mb-1 border rounded-lg p-4"
        style={{ borderColor: "#E0E0E0" }}
      >
        <div className="text-sm" style={{ color: "#4F4F4F" }}>
          Error: {errorMessage}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return null; // Don't show anything if no transactions
  }

  return (
    <div
      className="mb-1 border rounded-lg p-4"
      style={{ borderColor: "#E0E0E0" }}
    >
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wider">
            <th className="pb-2" style={{ color: "#4F4F4F" }}>
              Resulting transaction
            </th>
            <th className="pb-2" style={{ color: "#4F4F4F" }}>
              Network
            </th>
            <th className="pb-2" style={{ color: "#4F4F4F" }}>
              Executed by
            </th>
            <th className="pb-2" style={{ color: "#4F4F4F" }}>
              On
            </th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: "#4F4F4F" }}>
          {transactions.map((transaction: ExecutionTransaction) => (
            <tr key={transaction.id} className="text-sm">
              <td className="py-2 pr-4">
                <div className="flex items-center gap-1">
                  <span className="font-mono" style={{ color: "#4F4F4F" }}>
                    {formatTransactionHash(transaction.transaction_hash)}
                  </span>
                  <a
                    href={getBlockScanUrl(
                      transaction.chain_id,
                      transaction.transaction_hash
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#4F4F4F" }}
                  >
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </a>
                </div>
              </td>
              <td className="py-2 pr-4" style={{ color: "#4F4F4F" }}>
                {getNetworkName(transaction.chain_id)}
              </td>
              <td className="py-2 pr-4" style={{ color: "#4F4F4F" }}>
                {formatAddress(transaction.executed_by)}
              </td>
              <td className="py-2" style={{ color: "#4F4F4F" }}>
                {formatDate(transaction.executed_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
