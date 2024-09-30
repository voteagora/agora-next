import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  proposal: Proposal;
}

export const BravoGovQueue = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();

  const { data, write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "queue",
    args: [proposal.id],
  });

  const { isLoading, isSuccess, isFetched, isError, error } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Proposal Queued. It might take a minute to see the updated status.",
        { duration: 5000 }
      );
    }
    if (isError) {
      toast.error(`Error queuing proposal ${error?.message}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  return (
    <>
      {!isFetched && (
        <Button loading={isLoading} onClick={() => write?.()}>
          Queue
        </Button>
      )}
    </>
  );
};
