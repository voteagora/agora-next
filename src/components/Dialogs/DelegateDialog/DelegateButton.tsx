import { Button as ShadcnButton } from "@/components/ui/button";
import Tenant from "@/lib/tenant/tenant";
import { Delegate, DelegateChunk } from "@/app/api/common/delegates/delegate";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface Props {
  delegate: DelegateChunk;
  delegator: Delegate;
  onChange: (status: "error" | "success" | "loading" | undefined) => void;
}

export const DelegateButton = ({ delegate, delegator, onChange }: Props) => {
  const { contracts } = Tenant.current();

  const hasSCWAddress = Boolean(delegator.statement?.scw_address);

  const { data, writeContract, isError: isCancelled } = useWriteContract();
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({});

  console.log(isLoading, isSuccess, isError);
  console.log(isCancelled);

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

// const delegateWallet = () => {
//
//   const { contracts } = Tenant.current();
//
//
//   const tokenAbi =
//     ["function castVote(uint256 proposalId,uint8 support) external returns (uint256)"];
//   const proposalId =
//     "103846607594260222319322602408177061482869129590998759087401482308348702652659";
//
//   const contract = new Contract(contracts.token.address, contracts.token.abi);
//
//   const data = contract.interface.encodeFunctionData("castVote", [proposalId, 1]);
//
//
//   client.sendUserOperation({
//     uo: {
//       target: "0xb65C031Ac61128AE791D42Ae43780f012E2F7f89",
//       data: data,
//     },
//   }).then((tx) => {
//     console.log("Transaction sent", tx);
//   });
// };
// }
