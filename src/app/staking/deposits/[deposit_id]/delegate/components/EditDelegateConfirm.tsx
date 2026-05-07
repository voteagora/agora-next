"use client";

import React, { useEffect, useRef } from "react";
import { StakedDeposit } from "@/lib/types";
import ENSName from "@/components/shared/ENSName";
import { Button } from "@/components/ui/button";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import Tenant from "@/lib/tenant/tenant";
import {
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { RedirectAfterSuccess } from "@/app/staking/components/RedirectAfterSuccess";
import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  attachMiradorTransactionArtifacts,
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
  startFrontendMiradorFlowTrace,
} from "@/lib/mirador/frontendFlowTrace";

interface EditDelegateConfirmProps {
  delegate: string;
  deposit: StakedDeposit;
  refreshPath: (path: string) => void;
}

export const EditDelegateConfirm = ({
  delegate,
  deposit,
  refreshPath,
}: EditDelegateConfirmProps) => {
  const { contracts } = Tenant.current();
  const traceRef = useRef<FrontendMiradorTrace>(null);

  const { data: config } = useSimulateContract({
    query: { enabled: !!delegate },
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "alterDelegatee",
    args: [BigInt(deposit.id), delegate as `0x${string}`],
  });

  const { data, writeContract: write } = useWriteContract();
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: data,
  });
  const isTransactionConfirmed = Boolean(data && !isLoading);

  useEffect(() => {
    if (isSuccess && traceRef.current) {
      attachMiradorTransactionArtifacts(traceRef.current, {
        chainId: contracts.staker!.chain.id,
        inputData:
          config?.request &&
          "data" in config.request &&
          typeof config.request.data === "string"
            ? config.request.data
            : undefined,
        txHash: data,
        txDetails: "Alter delegate transaction",
      });
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_succeeded",
        eventName: "staking_submit_succeeded",
        details: {
          action: "alter_delegatee",
          depositId: deposit.id,
          delegate,
          transactionHash: data,
        },
      });
      traceRef.current = null;
      return;
    }

    if (isError && traceRef.current) {
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_failed",
        eventName: "staking_submit_failed",
        details: {
          action: "alter_delegatee",
          depositId: deposit.id,
          delegate,
        },
      });
      traceRef.current = null;
    }
  }, [
    config?.request,
    contracts.staker,
    data,
    delegate,
    deposit.id,
    isError,
    isSuccess,
  ]);

  useEffect(() => {
    return () => {
      if (!traceRef.current) {
        return;
      }

      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_unmounted",
        eventName: "staking_submit_unmounted",
        details: {
          action: "alter_delegatee",
          depositId: deposit.id,
          delegate,
        },
      });
      traceRef.current = null;
    };
  }, [delegate, deposit.id]);

  const handleUpdateDelegate = () => {
    if (!config?.request) {
      return;
    }

    if (traceRef.current) {
      void closeFrontendMiradorFlowTrace(traceRef.current, {
        reason: "staking_submit_restarted",
        eventName: "staking_submit_restarted",
        details: {
          action: "alter_delegatee",
          depositId: deposit.id,
          delegate,
        },
      });
    }

    const trace = startFrontendMiradorFlowTrace({
      name: "StakingAction",
      flow: MIRADOR_FLOW.staking,
      step: "alter_delegatee_submit",
      context: {
        walletAddress: deposit.depositor,
        chainId: contracts.staker!.chain.id,
      },
      tags: ["staking", "frontend"],
      attributes: {
        action: "alter_delegatee",
        depositId: deposit.id,
        delegate,
      },
      startEventName: "staking_submit_started",
      startEventDetails: {
        action: "alter_delegatee",
        depositId: deposit.id,
        delegate,
      },
    });
    traceRef.current = trace;
    attachMiradorTransactionArtifacts(trace, {
      chainId: contracts.staker!.chain.id,
      inputData:
        "data" in config.request && typeof config.request.data === "string"
          ? config.request.data
          : undefined,
    });

    try {
      write(config.request);
    } catch (error) {
      void closeFrontendMiradorFlowTrace(trace, {
        reason: "staking_submit_failed",
        eventName: "staking_submit_failed",
        details: {
          action: "alter_delegatee",
          depositId: deposit.id,
          delegate,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      if (traceRef.current === trace) {
        traceRef.current = null;
      }
    }
  };

  return (
    <div className="rounded-xl border border-line bg-wash w-[354px] p-4 shadow-newDefault">
      <div className="border border-line bg-neutral rounded-lg p-4">
        <div className="text-center text-xs text-secondary">
          Updating delegate of the existing stake
        </div>

        <div className="w-full text-center bg-neutral font-bold text-3xl text-primary">
          <ENSName address={delegate} />
        </div>
      </div>
      {isTransactionConfirmed ? (
        <div className="mt-4">
          <RedirectAfterSuccess
            message={"Delegate updated successfully!"}
            linkTitle={"Return to staking page"}
            linkURI={`/staking/${deposit.depositor}`}
            refreshPath={refreshPath}
          />
        </div>
      ) : (
        <>
          <div className="text-sm py-4 text-primary">
            Please verify your transaction details before confirming.
          </div>

          <Button
            className="w-full"
            disabled={(!!delegate && isLoading) || !Boolean(config?.request)}
            onClick={handleUpdateDelegate}
          >
            {isLoading ? "Updating..." : `Update Delegate`}
          </Button>
        </>
      )}
      {data && <BlockScanUrls hash1={data} />}
    </div>
  );
};
