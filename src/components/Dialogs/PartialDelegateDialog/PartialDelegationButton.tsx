import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
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

  const {
    data: simulateData,
    isError: isSimulateError,
    error,
  } = useSimulateContract({
    query: { enabled: !disabled },
    address: contracts.token.address as `0x${string}`,
    abi: contracts.token.abi,
    functionName: "delegate",
    args: [cleanDelegations],
  });

  const { data, writeContract: write } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: data });

  useEffect(() => {
    if (isSuccess && data) {
      setRefetchDelegate({ address: address as `0x${string}` });
      onSuccess(data);
    }
  }, [data, isSuccess]);

  if (isSimulateError) {
    return (
      <div>
        <Button
          className="w-full"
          onClick={() => {}}
          disabled={true}
          loading={false}
        >
          Error simulating transaction
        </Button>

        {error && <div className="text-xs text-red">{error.toString()}</div>}
      </div>
    );
  }

  return (
    <div>
      <Button
        className="w-full"
        onClick={() => write(simulateData!.request)}
        disabled={isLoading || disabled || !simulateData?.request}
        loading={isLoading}
      >
        Delegate Voting Power
      </Button>

      {data && <BlockScanUrls hash1={data} />}
    </div>
  );
};
