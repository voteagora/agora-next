import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import {
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { toUtf8Bytes } from "ethers";
import { Button } from "@/components/ui/button";
import { keccak256 } from "viem";

interface Props {
  proposal: Proposal;
}

export const ProposalQueueButton = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { targets, values, calldatas } = proposal.proposalData.options[0];

  const descriptionHash = keccak256(toUtf8Bytes(proposal.description!)); // Hash of the proposal description

  // const { data: proposalId, isFetched: isProposalIdFetched } = useContractRead({
  //   address: contracts.governor.address as `0x${string}`,
  //   abi: contracts.governor.abi,
  //   functionName: "hashProposal",
  //   args: [targets, values, calldatas, descriptionHash],
  // });

  const { data: isQeueueReady } = useContractRead({
    address: contracts.timelock!.address as `0x${string}`,
    abi: contracts.timelock!.abi,
    functionName: "isOperationReady",
    args: [keccak256(toUtf8Bytes(proposal.id))],
  });

  console.log(isQeueueReady);

  const { data, write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "queue",
    args: [targets, values, calldatas, descriptionHash],
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <Button
      loading={isLoading}
      disabled={Boolean(isQeueueReady === undefined || !isQeueueReady)}
      onClick={() => write?.()}
    >
      Queue
    </Button>
  );
};
