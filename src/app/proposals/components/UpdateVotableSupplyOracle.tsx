"use client";

import { useEffect, useRef, useState } from "react";
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
import { UpdatedButton } from "@/components/Button";
import { IVotableSupplyOracleContract } from "@/lib/contracts/common/interfaces/IVotableSupplyOracleContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";
import { encodeFunctionData } from "viem";

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
  const traceRef = useRef<FrontendMiradorTrace>(null);

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
      if (traceRef.current) {
        attachMiradorTransactionArtifacts(traceRef.current, {
          chainId,
          txHash,
          txDetails: "Update votable supply oracle transaction",
        });
        void closeFrontendMiradorFlowTrace(traceRef.current, {
          reason: "governance_admin_succeeded",
          eventName: "governance_admin_succeeded",
          details: {
            action: "update_votable_supply",
            transactionHash: txHash,
          },
        });
        traceRef.current = null;
      }
      // Invalidate the votable supply query when transaction is confirmed
      queryClient.invalidateQueries({ queryKey: [VOTABLE_SUPPLY_QK] });
      refetchVotableSupplyOracle();
      setTxHash(undefined);
    }
  }, [chainId, isTxConfirmed, queryClient, refetchVotableSupplyOracle, txHash]);

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "governance_admin_unmounted",
        eventName: "governance_admin_unmounted",
        details: {
          action: "update_votable_supply",
        },
      });
      traceRef.current = null;
    };
  }, []);

  const handleUpdateSupply = async () => {
    const supplyInWei = BigInt(presentVotableSupply);
    const inputData = encodeFunctionData({
      abi: abi as any,
      functionName: "_updateVotableSupply",
      args: [supplyInWei],
    });

    if (traceRef.current) {
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "governance_admin_restarted",
        eventName: "governance_admin_restarted",
        details: {
          action: "update_votable_supply",
        },
      });
    }

    const trace = startFrontendMiradorFlowTrace({
      name: "GovernanceAdmin",
      flow: MIRADOR_FLOW.governanceAdmin,
      step: "votable_supply_update_submit",
      context: {
        walletAddress: address,
        chainId,
      },
      tags: ["governance", "admin", "frontend"],
      attributes: {
        action: "update_votable_supply",
      },
      startEventName: "governance_admin_started",
      startEventDetails: {
        action: "update_votable_supply",
      },
    });
    attachMiradorTransactionArtifacts(trace, {
      chainId,
      inputData,
    });
    traceRef.current = trace;

    try {
      const hash = await writeContractAsync({
        address: oracleAddress,
        abi,
        functionName: "_updateVotableSupply",
        args: [supplyInWei],
        chainId,
      });

      // Store the transaction hash to track confirmation
      setTxHash(hash);
      attachMiradorTransactionArtifacts(trace, {
        chainId,
        inputData,
        txHash: hash,
        txDetails: "Update votable supply oracle transaction",
      });
    } catch (err) {
      console.error("Error updating votable supply:", err);
      void closeFrontendMiradorFlowTrace(trace, {
        reason: "governance_admin_failed",
        eventName: "governance_admin_failed",
        details: {
          action: "update_votable_supply",
          error: err instanceof Error ? err.message : String(err),
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }
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
