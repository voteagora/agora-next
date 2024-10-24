import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useGovernorAdmin } from "@/hooks/useGovernorAdmin";

interface Props {
  proposal: Proposal;
}

export const BravoGovCancel = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();

  const { data: adminAddress } = useGovernorAdmin({ enabled: true });
  const canCancel =
    adminAddress?.toString().toLowerCase() === address?.toLowerCase();

  const { data, writeContract: write } = useWriteContract();

  const { isLoading, isSuccess, isError, isFetched, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Cancelled. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      toast.error(`Error cancelling proposal ${error?.message}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  if (!canCancel) {
    return null;
  }

  return (
    <>
      {!isFetched && (
        <Button
          onClick={() =>
            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName: "cancel",
              args: [proposal.id],
            })
          }
          variant="outline"
          loading={isLoading}
        >
          Cancel
        </Button>
      )}
    </>
  );
};
