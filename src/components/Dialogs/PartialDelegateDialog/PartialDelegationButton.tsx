import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { UpdatedButton } from "@/components/Button";
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
        <UpdatedButton
          fullWidth
          onClick={() => {}}
          disabled={true}
          loading={false}
        >
          Error simulating transaction
        </UpdatedButton>

        <div className="mt-4 text-xs text-primary bg-negative/40 border border-negative/80 p-2 rounded-md break-words">
          {error.toString()}
        </div>
      </div>
    );
  }

  return (
    <div>
      <UpdatedButton
        primaryTextColor="black"
        fullWidth
        onClick={() => write(simulateData!.request)}
        disabled={isLoading || disabled || !simulateData?.request}
        loading={isLoading}
      >
        Delegate Voting Power
      </UpdatedButton>

      {data && <BlockScanUrls hash1={data} />}
    </div>
  );
};
