import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import { Delegation } from "@/app/api/common/delegations/delegation";
import { useEffect } from "react";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { useConnectButtonContext } from "@/contexts/ConnectButtonContext";

interface Props {
  disabled: boolean;
  delegations: Delegation[];
  onSuccess: (hash: `0x${string}`) => void;
}

export const PartialDelegationButton = ({
  disabled,
  delegations,
  onSuccess,
}: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
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

  const { config } = usePrepareContractWrite({
    enabled: !disabled,
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    functionName: "delegate",
    args: [cleanDelegations],
  });

  const { data, write, status } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (isSuccess && data?.hash) {
      setRefetchDelegate({ address: address as `0x${string}` });
      onSuccess(data.hash);
    }
  }, [data, isSuccess]);

  return (
    <div>
      <Button
        className="w-full"
        onClick={write}
        disabled={isLoading || disabled}
        loading={isLoading}
      >
        Delegate Voting Power
      </Button>

      {data?.hash && <BlockScanUrls hash1={data?.hash} />}
    </div>
  );
};
