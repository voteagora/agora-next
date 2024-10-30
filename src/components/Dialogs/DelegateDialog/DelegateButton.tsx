import { Button as ShadcnButton } from "@/components/ui/button";
import Tenant from "@/lib/tenant/tenant";
import { Delegate, DelegateChunk } from "@/app/api/common/delegates/delegate";
import { WriteContractMutate } from "@wagmi/core/query";
import { Contract } from "ethers";

interface Props {
  delegate: DelegateChunk;
  delegator: Delegate;
  write: WriteContractMutate<any>;
}

export const DelegateButton = ({ delegate, delegator, write }: Props) => {
  const { contracts } = Tenant.current();

  const hasSCWAddress = Boolean(delegator.statement?.scw_address);

  const label = hasSCWAddress ? "Delegate SCW" : "Delegate EOA";

  return (
    <ShadcnButton
      onClick={() =>
        write({
          address: contracts.token.address as any,
          abi: contracts.token.abi,
          functionName: "delegate",
          args: [delegate.address as any],
        })
      }
    >
      {label}
    </ShadcnButton>
  );
};


const delegateWallet = () => {

  const { contracts } = Tenant.current();


  const tokenAbi =
    ["function castVote(uint256 proposalId,uint8 support) external returns (uint256)"];
  const proposalId =
    "103846607594260222319322602408177061482869129590998759087401482308348702652659";

  const contract = new Contract(contracts.token.address, contracts.token.abi);

  const data = contract.interface.encodeFunctionData("castVote", [proposalId, 1]);


  client.sendUserOperation({
    uo: {
      target: "0xb65C031Ac61128AE791D42Ae43780f012E2F7f89",
      data: data,
    },
  }).then((tx) => {
    console.log("Transaction sent", tx);
  });
};
}