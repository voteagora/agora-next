import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  proposal: Proposal;
}

export const ProposalCancelButton = ({ proposal }: Props) => {
  const { contracts } = Tenant.current();
  const { address } = useAccount();

  // TODO: Implement admin
  // admin

  // TODO: Figure out how to get this to work
  const { data: adminAddress, isFetched: isAdminFetched } = useContractRead({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "admin",
  });

  const canCancel =
    isAdminFetched &&
    adminAddress?.toString().toLowerCase() === address?.toLowerCase();

  const { write } = useContractWrite({
    address: contracts.governor.address as `0x${string}`,
    abi: contracts.governor.abi,
    functionName: "cancel",
    args: [proposal.proposalData],
  });

  return (<div>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          {!canCancel ? (
            <TooltipTrigger>
              <Button disabled={true} variant="outline">
                Cancel
              </Button>
            </TooltipTrigger>
          ) : (
            <Button onClick={() => write?.()} variant="outline">
              Cancel
            </Button>
          )}

          <TooltipContent>
            <div className="flex flex-col gap-1 p-2">
              <div>Only the admin wallet can cancel proposals:</div>
              <div className="font-semibold">{adminAddress}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
