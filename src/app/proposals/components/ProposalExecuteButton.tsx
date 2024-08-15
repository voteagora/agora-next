import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useContractRead, useContractWrite } from "wagmi";
import { encodeBytes32String } from "ethers";
import { Button } from "@/components/ui/button";

interface Props {
  proposal: Proposal;
}

export const ProposalExecuteButton = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();

  // TODO: Figure out how to get this to work
  // const { data, isFetched: isFetchedReady } = useContractRead({
  //   address: contracts.timelock!.address as `0x${string}`,
  //   abi: contracts.timelock!.abi,
  //   functionName: "isOperationReady",
  //   args: [proposal.id],
  // });

  const { write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "execute",
    args: [proposal.proposalData],
  });

  return <Button onClick={() => write?.()}>Execute</Button>;
};
