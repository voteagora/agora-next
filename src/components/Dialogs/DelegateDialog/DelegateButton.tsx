import { Button as ShadcnButton } from "@/components/ui/button";
import Tenant from "@/lib/tenant/tenant";
import { Delegate, DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface Props {
  delegate: DelegateChunk;
  delegator: Delegate;
  onChange: (status: "error" | "success" | "loading" | undefined) => void;
}
// NOT USED IN PRODUCTION TENANT
export const DelegateButton = ({ delegate, delegator, onChange }: Props) => {
  const { contracts } = Tenant.current();

  const { data, writeContract } = useWriteContract();

  return (
    <ShadcnButton
      onClick={() => {
        onChange("loading");

        writeContract({
          address: contracts.token.address as any,
          abi: contracts.token.abi,
          functionName: "delegate",
          args: [delegate.address as any],
        });
      }}
    >
      Delegate
    </ShadcnButton>
  );
};
