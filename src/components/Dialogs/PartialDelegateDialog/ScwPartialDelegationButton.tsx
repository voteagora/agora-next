import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import { Delegation } from "@/app/api/common/delegations/delegation";
import { useState } from "react";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";
import { useSmartAccountAddress } from "@/hooks/useSmartAccountAddress";
import { useLyraDeriveAccount } from "@/hooks/useSmartAccountDerive";

interface Props {
  disabled: boolean;
  delegations: Delegation[];
  onSuccess: (hash: `0x${string}`) => void;
}

export const ScwPartialDelegationButton = ({
  disabled,
  delegations,
  onSuccess,
}: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const { data: scwAddress } = useSmartAccountAddress({ owner: address });
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setRefetchDelegate } = useConnectButtonContext();

  // Prepare delegations for contract call
  // 1. Remove delegations without any allocation
  const filteredDelegations = [...delegations].filter(
    (delegation) => Number(delegation.percentage) > 0
  );

  // 2. Sort delegations by recipient address
  const sortedDelegations = filteredDelegations.sort((a, b) =>
    a.to.localeCompare(b.to)
  );

  // 3. Map delegations to contract struct
  const cleanDelegations = sortedDelegations.map((delegation) => [
    delegation.to,
    Math.round(Number(delegation.percentage) * 10000),
  ]);

  // 4. Encode delegations
  const data = contracts.token.contract.interface.encodeFunctionData(
    "delegate((address,uint96)[])",
    [cleanDelegations]
  ) as `0x${string}`;

  const { data: smartAccountClient } = useLyraDeriveAccount();

  if (!smartAccountClient) {
    return null;
  }

  return (
    <div>
      <Button
        className="w-full"
        onClick={() => {
          setIsLoading(true);

          smartAccountClient
            .sendUserOperation({
              account: smartAccountClient.account!,
              uo: {
                target: contracts.token.address as `0x${string}`,
                data: data,
              },
            })
            .then((txn: any) => {
              setTxHash(txn.hash);
              onSuccess(txn.hash);
              setError(null);
              setRefetchDelegate({ address: scwAddress as `0x${string}` });
            })
            .catch((error) => {
              setError(error.message);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }}
        disabled={disabled}
        loading={isLoading}
      >
        Delegate Voting Power
      </Button>
      {error && (
        <div className="mt-4 text-xs text-primary bg-negative/40 border border-negative/80 p-2 rounded-md break-words">
          {error}
        </div>
      )}
      {txHash && <BlockScanUrls hash1={txHash} />}
    </div>
  );
};
