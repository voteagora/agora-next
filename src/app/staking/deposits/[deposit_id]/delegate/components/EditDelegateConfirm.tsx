"use client";

import React from "react";
import { StakedDeposit } from "@/lib/types";
import ENSName from "@/components/shared/ENSName";
import { Button } from "@/components/ui/button";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import Tenant from "@/lib/tenant/tenant";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { RedirectAfterSuccess } from "@/app/staking/components/RedirectAfterSuccess";

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

  const { config } = usePrepareContractWrite({
    enabled: !!delegate,
    address: contracts.staker!.address as `0x${string}`,
    abi: contracts.staker!.abi,
    chainId: contracts.staker!.chain.id,
    functionName: "alterDelegatee",
    args: [BigInt(deposit.id), delegate as `0x${string}`],
  });

  const { data, write, status } = useContractWrite(config);
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  const isTransactionConfirmed = Boolean(data?.hash && !isLoading);

  return (
    <div className="rounded-xl border border-slate-300 w-[354px] p-4 shadow-newDefault">
      <div className="border border-slate-300 rounded-lg p-4">
        <div className="text-center text-xs text-gray-600">
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
          <div className="text-sm py-4">
            Please verify your transaction details before confirming.
          </div>

          <Button
            className="w-full"
            disabled={!!delegate && isLoading}
            onClick={() => {
              write?.();
            }}
          >
            {isLoading ? "Updating..." : `Update Delegate`}
          </Button>
        </>
      )}
      {data?.hash && <BlockScanUrls hash1={data?.hash} />}
    </div>
  );
};
