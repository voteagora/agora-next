import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useGovernorAdmin } from "@/hooks/useGovernorAdmin";
import { GOVERNOR_TYPE } from "@/lib/constants";

const ensureHex = (value: string | string[]): string | string[] => {
  console.log("value", value);
  if (Array.isArray(value)) {
    return value.map((v) => ensureHex(v)) as string[];
  }
  if (value.startsWith("0x")) {
    return value;
  }
  return `0x${value}`;
};

interface Props {
  proposal: Proposal;
}

export const AgoraGovCancel = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const { data: adminAddress } = useGovernorAdmin({ enabled: true });
  const canCancel =
    adminAddress?.toString().toLowerCase() === address?.toLowerCase();

  const { writeContract: write, data } = useWriteContract();
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
      const errorMessage =
        "shortMessage" in error ? error.shortMessage : error.message;

      toast.error(`Error cancelling proposal ${errorMessage}`, {
        duration: 5000,
      });
    }
  }, [isSuccess, isError, error]);

  if (!canCancel) {
    return null;
  }

  return (
    <>
      {!isFetched && !cancelled && (
        <Button
          className="bg-neutral hover:bg-neutral border-line"
          onClick={async () => {
            try {
              setCancelling(true);
              if (contracts.governorType === GOVERNOR_TYPE.AGORA_20) {
                const transaction =
                  await contracts.governor.provider.getTransaction(
                    proposal.createdTransactionHash as `0x${string}`
                  );
                const simulatedResponse = await fetch("/api/simulate", {
                  method: "POST",
                  body: JSON.stringify({
                    networkId: 480,
                    target: contracts.governor.address as `0x${string}`,
                    from: address as `0x${string}`,
                    calldata: transaction?.data,
                  }),
                });
                const simulatedResponseJson = await simulatedResponse.json();
                const inputs =
                  simulatedResponseJson?.response?.transaction?.transaction_info?.call_trace?.calls?.[0]?.calls?.[0]?.calls?.[3]?.decoded_input?.map(
                    (input: any, i: number) => {
                      if (i !== 1) {
                        if (Array.isArray(input.value)) {
                          return input.value.map(ensureHex);
                        }
                        return ensureHex(input.value);
                      }
                      return input.value;
                    }
                  );
                write({
                  address: contracts.governor.address as `0x${string}`,
                  abi: contracts.governor.abi,
                  functionName: "cancel",
                  args: inputs,
                });
                toast.success(
                  "Proposal Cancelled. It might take a minute to see the updated status.",
                  {
                    duration: 5000,
                  }
                );
                setCancelling(false);
                setCancelled(true);
              } else {
                write({
                  address: contracts.governor.address as `0x${string}`,
                  abi: contracts.governor.abi,
                  functionName: "cancel",
                  args: proposalToCallArgs(proposal),
                });
                toast.success(
                  "Proposal Cancelled. It might take a minute to see the updated status.",
                  {
                    duration: 5000,
                  }
                );
                setCancelling(false);
                setCancelled(true);
              }
            } catch (error) {
              toast.error("Error cancelling proposal", {
                duration: 5000,
              });
              console.error(error);
            } finally {
              setCancelling(false);
            }
          }}
          variant="outline"
          loading={cancelling}
        >
          Cancel
        </Button>
      )}
    </>
  );
};
