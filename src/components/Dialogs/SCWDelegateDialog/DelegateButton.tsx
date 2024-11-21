"use client";

import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Contract } from "ethers";
import Tenant from "@/lib/tenant/tenant";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { useState } from "react";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { useLyraDeriveAccount } from "@/hooks/useSmartAccountDerive";

interface Props {
  delegate: DelegateChunk;
  onSuccess: (txn: string) => void;
}

export const DelegateButton = ({ delegate, onSuccess }: Props) => {
  const [txn, setTxn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { contracts } = Tenant.current();

  const { setRefetchDelegate } = useConnectButtonContext();

  const contract = new Contract(contracts.token.address, contracts.token.abi);
  const data = contract.interface.encodeFunctionData("delegate", [
    delegate.address as any,
  ]) as `0x${string}`;

  const { data: lyraClient } = useLyraDeriveAccount();

  if (!lyraClient) {
    return null;
  }

  // TODO: Implement error state

  // TODO: Implement loading state

  if (error) {
    return (
      <div className="px-3 py-2 bg-red-300 border border-red-500 rounded-md text-sm text-red">
        There was an error with the delegation from your Smart Account. Please
        try again later.
      </div>
    );
  }

  if (txn) {
    // TODO: Improve the success state
    return (
      <div>
        Delegation completed!
        <BlockScanUrls hash1={data} />
      </div>
    );
  }

  return (
    <ShadcnButton
      onClick={() => {
        lyraClient
          .sendUserOperation({
            account: lyraClient.account!,
            uo: {
              target: contracts.token.address as `0x${string}`,
              data: data,
            },
          })
          .then((tx: any) => {
            onSuccess(tx.hash);
            setError(null);
            setTxn(tx);

            // TODO: Andrei - this is an anti-pattern, we should use a reactQuery
            //  and invalidate the cache for the delegate
            setRefetchDelegate({ address: delegate.address });
          })
          .catch((error) => {
            console.log(error);
            setError(error.message);
          });
      }}
    >
      Delegate
    </ShadcnButton>
  );
};
