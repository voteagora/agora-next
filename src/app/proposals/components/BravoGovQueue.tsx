import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  getGovernorByAddress,
  getDefaultGovernor,
} from "@/lib/tenant/governorUtils";

interface Props {
  proposal: Proposal;
}

export const BravoGovQueue = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const governorInstance = proposal.contract
    ? (getGovernorByAddress(proposal.contract, contracts) ??
      getDefaultGovernor(contracts))
    : getDefaultGovernor(contracts);

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
      toast.error(`Error queuing proposal ${error?.message}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  return (
    <>
      {!isFetched && (
        <Button
          loading={isLoading}
          onClick={() =>
            write({
              address: governorInstance.governor.address as `0x${string}`,
              abi: governorInstance.governor.abi,
              functionName: "queue",
              args: [proposal.id],
            })
          }
        >
          Queue
        </Button>
      )}
    </>
  );
};
