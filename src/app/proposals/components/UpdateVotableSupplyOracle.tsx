"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import {
  VOTABLE_SUPPLY_QK,
  useGetVotableSupply,
} from "@/hooks/useGetVotableSupply";

import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { OldButton } from "@/components/Button";
import { IVotableSupplyOracleContract } from "@/lib/contracts/common/interfaces/IVotableSupplyOracleContract";
import { TenantContract } from "@/lib/tenant/tenantContract";

export const UpdateVotableSupplyOracle = ({
  votableSupplyOracle,
  tokenDecimal,
}: {
  votableSupplyOracle: TenantContract<IVotableSupplyOracleContract>;
  tokenDecimal: number;
}) => {
  const { address } = useAccount();
  const { data: presentVotableSupply } = useGetVotableSupply();
  const queryClient = useQueryClient();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { writeContractAsync, isPending } = useWriteContract();
  const chainId = votableSupplyOracle.chain.id;
  const oracleAddress = votableSupplyOracle.address as `0x${string}`;
  const abi = votableSupplyOracle.abi;

  const {
    data: votableSupplyOracleValue,
    refetch: refetchVotableSupplyOracle,
  } = useReadContract({
    address: oracleAddress,
    abi,
    functionName: "votableSupply",
    chainId,
  });

  const { data: ownerAddress } = useReadContract({
    address: oracleAddress,
    abi,
    functionName: "owner",
    chainId,
  });

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId,
  });

  // Format the votableSupplyOracle for display
  const formattedOracleSupply =
    votableSupplyOracleValue !== undefined && votableSupplyOracleValue !== null
      ? formatNumber(
          votableSupplyOracleValue.toString(),
          tokenDecimal,
          4,
          false,
          false
        )
      : "0";

  const formattedPresentVotableSupply =
    presentVotableSupply !== undefined && presentVotableSupply !== null
      ? formatNumber(
          presentVotableSupply.toString(),
          tokenDecimal,
          4,
          false,
          false
        )
      : "0";

  useEffect(() => {
    if (isTxConfirmed) {
      // Invalidate the votable supply query when transaction is confirmed
      queryClient.invalidateQueries({ queryKey: [VOTABLE_SUPPLY_QK] });
      refetchVotableSupplyOracle();
      setTxHash(undefined);
    }
  }, [isTxConfirmed, queryClient, refetchVotableSupplyOracle]);

  const handleUpdateSupply = async () => {
    try {
      const supplyInWei = BigInt(presentVotableSupply);

      const hash = await writeContractAsync({
        address: oracleAddress,
        abi,
        functionName: "_updateVotableSupply",
        args: [supplyInWei],
        chainId,
      });

      // Store the transaction hash to track confirmation
      setTxHash(hash);
    } catch (err) {
      console.error("Error updating votable supply:", err);
    }
  };

  if (!address || address !== ownerAddress) return null;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col space-y-1">
            <div>Current votable supply: {formattedPresentVotableSupply}</div>
            <div>Current value in oracle: {formattedOracleSupply}</div>
          </div>
          <OldButton
            onClick={handleUpdateSupply}
            disabled={isPending}
            className="ml-auto"
          >
            {isPending ? "Updating..." : "Update Votable Supply"}
          </OldButton>
        </div>
      </CardContent>
    </Card>
  );
};
