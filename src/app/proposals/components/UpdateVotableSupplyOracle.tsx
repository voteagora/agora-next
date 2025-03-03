"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import Tenant from "@/lib/tenant/tenant";
import {
  VOTABLE_SUPPLY_QK,
  useGetVotableSupply,
} from "@/hooks/useGetVotableSupply";

import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { UpdatedButton } from "@/components/Button";

export const UpdateVotableSupplyOracle = () => {
  const { address } = useAccount();
  const { data: presentVotableSupply } = useGetVotableSupply();
  const queryClient = useQueryClient();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  const { contracts } = Tenant.current();

  const { writeContractAsync, isPending } = useWriteContract();

  const { data: votableSupplyOracle, refetch: refetchVotableSupplyOracle } =
    useReadContract({
      address: contracts.votableSupplyOracle?.address as `0x${string}`,
      abi: contracts.votableSupplyOracle?.abi,
      functionName: "votableSupply",
    });

  const { data: ownerAddress } = useReadContract({
    address: contracts.votableSupplyOracle?.address as `0x${string}`,
    abi: contracts.votableSupplyOracle?.abi,
    functionName: "owner",
  });

  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Format the votableSupplyOracle for display
  const formattedOracleSupply =
    votableSupplyOracle !== undefined && votableSupplyOracle !== null
      ? formatNumber(votableSupplyOracle.toString(), 18, 4, false, false)
      : "0";

  const formattedPresentVotableSupply =
    presentVotableSupply !== undefined && presentVotableSupply !== null
      ? formatNumber(presentVotableSupply.toString(), 18, 4, false, false)
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
        address: contracts.votableSupplyOracle!.address as `0x${string}`,
        abi: contracts.votableSupplyOracle!.abi,
        functionName: "_updateVotableSupply",
        args: [supplyInWei],
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
          <UpdatedButton
            onClick={handleUpdateSupply}
            disabled={isPending}
            className="ml-auto"
          >
            {isPending ? "Updating..." : "Update Votable Supply"}
          </UpdatedButton>
        </div>
      </CardContent>
    </Card>
  );
};
