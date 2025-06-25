import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/Button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  proposal: Proposal;
}

export const OZGovQueue = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();

  const { data, writeContract: write } = useWriteContract();

  const { isLoading, isSuccess, isFetched, isError, error } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Queued. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error queuing proposal ${errorMessage}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  return (
    <>
      {!isFetched && (
        <Button
          primaryTextColor="black"
          size="large"
          fullWidth={false}
          loading={isLoading}
          onClick={() =>
            write({
              address: contracts.governor.address as `0x${string}`,
              abi: contracts.governor.abi,
              functionName: "queue",
              args: proposalToCallArgs(proposal),
            })
          }
        >
          Queue
        </Button>
      )}
    </>
  );
};
