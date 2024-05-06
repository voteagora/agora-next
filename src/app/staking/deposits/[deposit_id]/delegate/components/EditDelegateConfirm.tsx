"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StakedDeposit } from "@/lib/types";
import { Button } from "@/components/ui/button";
import ENSName from "@/components/shared/ENSName";
import { EditDelegateButton } from "@/app/staking/deposits/[deposit_id]/delegate/components/EditDelegateButton";

interface EditDelegateConfirmProps {
  delegate: string;
  deposit: StakedDeposit;
}

export const EditDelegateConfirm = ({
  delegate,
  deposit,
}: EditDelegateConfirmProps) => {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      setTimeout(() => {
        router.replace("/staking");
      }, 3000);
    }
  }, [isConfirmed, router]);

  return (
    <div className="rounded-xl border border-slate-300 w-[354px] p-4 shadow-newDefault">
      <div className="border border-slate-300 rounded-lg p-4">
        <div className="text-center text-xs text-gray-600">
          Updating delegate of the existing stake
        </div>

        <div className="w-full text-center bg-white font-bold text-3xl text-black">
          <ENSName address={delegate} />
        </div>
      </div>
      <div className="text-sm py-4">
        Please verify your transaction details before confirming.
      </div>
      {isConfirmed ? (
        <Button className="w-full" disabled={true}>
          Syncing transaction...
        </Button>
      ) : (
        <EditDelegateButton
          delegate={delegate}
          deposit={deposit}
          onConfirmed={() => setIsConfirmed(true)}
        />
      )}
    </div>
  );
};
