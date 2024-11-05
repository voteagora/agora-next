"use client";

import { Delegate, DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Contract } from "ethers";
import Tenant from "@/lib/tenant/tenant";
import { useSmartAccount } from "@/hooks/useSmartAccount";

interface Props {
  delegate: DelegateChunk;
  delegator: Delegate;
  onChange: (status: "error" | "loading" | undefined) => void;
  onSuccess: (txn: string) => void;
}

export const SCWDelegateButton = ({
  delegate,
  delegator,
  onChange,
  onSuccess,
}: Props) => {
  const { contracts } = Tenant.current();

  // TODO: Check this in the parnet component
  const hasSCWAddress = Boolean(delegator.statement?.scw_address);
  const { data: client } = useSmartAccount();

  const contract = new Contract(contracts.token.address, contracts.token.abi);
  const data = contract.interface.encodeFunctionData("delegate", [
    delegate.address as any,
  ]) as `0x${string}`;

  if (client === undefined) {
    return "Loading client...";
  }

  return (
    <ShadcnButton
      onClick={() => {
        onChange("loading");
        client
          .sendUserOperation({
            account: client.account!,
            uo: {
              target: contracts.token.address as `0x${string}`,
              data: data,
            },
          })
          .then((tx) => {
            onSuccess(tx.hash);
            console.log(tx);
            onChange(undefined);
          })
          .catch(() => {
            onChange("error");
          });
      }}
    >
      Delegate
    </ShadcnButton>
  );
};
