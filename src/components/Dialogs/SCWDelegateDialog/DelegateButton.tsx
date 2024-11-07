"use client";

import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Contract } from "ethers";
import Tenant from "@/lib/tenant/tenant";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { useState } from "react";
import BlockScanUrls from "@/components/shared/BlockScanUrl";

interface Props {
  delegate: DelegateChunk;
  onSuccess: (txn: string) => void;
}

export const DelegateButton = ({ delegate, onSuccess }: Props) => {
  const [txn, setTxn] = useState<string | null>(null);

  const { contracts } = Tenant.current();
  const { data: client } = useSmartAccount();
  const { setRefetchDelegate } = useConnectButtonContext();

  const contract = new Contract(contracts.token.address, contracts.token.abi);
  const data = contract.interface.encodeFunctionData("delegate", [
    delegate.address as any,
  ]) as `0x${string}`;

  if (!client) {
    return null;
  }

  // TODO: Implement error state

  // TODO: Implement loading state

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
        console.log("Delegate button clicked");

        client
          .sendUserOperation({
            account: client.account!,
            uo: {
              target: contracts.token.address as `0x${string}`,
              data: data,
            },
          })
          .then((tx: any) => {
            onSuccess(tx.hash);
            setTxn(tx);
            // TODO: Andrei - this is an anti-pattern, we should use a reactQuery
            //  and invalidate the cache for the delegate
            setRefetchDelegate({ address: delegate.address });
          })
          .catch(() => {});
      }}
    >
      Delegate
    </ShadcnButton>
  );
};
