import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useContractRead, useContractWrite } from "wagmi";
import { encodeBytes32String } from "ethers";
import { Button } from "@/components/ui/button";

interface Props {
  proposal: Proposal;
}

export const ProposalQueueButton = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();

  const { write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "queue",
    args: [proposal.proposalData],
  });

  return <Button onClick={() => write?.()}>Queue</Button>;
};
