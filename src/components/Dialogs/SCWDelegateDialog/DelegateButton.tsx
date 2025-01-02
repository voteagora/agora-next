"use client";

import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Button as ShadcnButton } from "@/components/ui/button";
import Tenant from "@/lib/tenant/tenant";
import { useState } from "react";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { useLyraDeriveAccount } from "@/hooks/useSmartAccountDerive";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";

interface Props {
  delegate: DelegateChunk;
  onSuccess: (txn: string) => void;
}

export const DelegateButton = ({ delegate, onSuccess }: Props) => {
  const [txn, setTxn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { contracts } = Tenant.current();

  const { setRefetchDelegate } = useConnectButtonContext();

  const data = contracts.token.contract.interface.encodeFunctionData(
    "delegate",
    [delegate.address as any]
  ) as `0x${string}`;

  const { data: smartAccountClient } = useLyraDeriveAccount();

  if (!smartAccountClient) {
    return null;
  }

  // TODO: Implement error state

  // TODO: Implement loading state

  if (error) {
    return (
      <div className="px-3 py-2 bg-red-300 border border-red-500 rounded-md text-sm">
        There was an error with the delegation from your Smart Account. Please
        try again later.
      </div>
    );
  }

  if (txn && !error) {
    return (
      <div className="px-3 py-2 bg-green-200 border border-green-300 rounded-md text-sm">
        <div className="font-semibold">Delegation completed!</div>
        <BlockScanUrls hash1={data} />
      </div>
    );
  }

  return (
    <ShadcnButton
      className="bg-brandPrimary text-primary hover:bg-brandPrimary/90"
      onClick={() => {
        smartAccountClient
          .sendUserOperation({
            account: smartAccountClient.account!,
            uo: {
              target: contracts.token.address as `0x${string}`,
              data: data,
            },
          })
          .then((txn: any) => {
            onSuccess(txn.hash);
            setError(null);
            setTxn(txn);

            // TODO: Andrei - this is an anti-pattern, we should use a reactQuery
            //  and invalidate the cache for the delegate
            setRefetchDelegate({ address: delegate.address });
          })
          .catch((error) => {
            setError(error.message);
          });
      }}
    >
      Delegate
    </ShadcnButton>
  );
};
