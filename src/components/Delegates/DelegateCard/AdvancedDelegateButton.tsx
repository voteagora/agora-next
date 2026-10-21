import { useAccount } from "wagmi";
import { Button } from "@/components/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { fetchAllForAdvancedDelegation } from "@/app/delegates/actions";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import Tenant from "@/lib/tenant/tenant";

export function AdvancedDelegateButton({
  delegate,
  delegators,
}: {
  delegate: DelegateChunk;
  delegators: string[] | null;
}) {
  const { address } = useAccount();
  const isSelfDelegation =
    address?.toLowerCase() === delegate.address?.toLowerCase();
  const isDisabled =
    !!address &&
    !!(
      isSelfDelegation || delegators?.includes(delegate.address?.toLowerCase())
    );
  const copy = Tenant.current().ui.copy;
  const unsupportedTarget = isSelfDelegation
    ? copy.delegates.delegation.circularDelegationSelfTarget
    : copy.delegates.delegation.circularDelegationDelegatorTarget;

  return (
    <TooltipProvider>
      <Tooltip>
        {isDisabled ? (
          <TooltipTrigger>
            <DelegateButton delegate={delegate} isDisabled={isDisabled} />
          </TooltipTrigger>
        ) : (
          <DelegateButton delegate={delegate} isDisabled={isDisabled} />
        )}

        <TooltipContent>
          <p>
            {copy.delegates.delegation.circularDelegationUnsupported(
              unsupportedTarget
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const DelegateButton = ({
  delegate,
  isDisabled,
}: {
  delegate: DelegateChunk;
  isDisabled: boolean;
}) => {
  const openDialog = useOpenDialog();
  const copy = Tenant.current().ui.copy;

  return (
    <Button
      disabled={isDisabled}
      className={isDisabled ? "!cursor-not-allowed" : ""}
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        openDialog({
          type: "ADVANCED_DELEGATE",
          params: {
            target: delegate.address,
            fetchAllForAdvancedDelegation,
          },
        });
      }}
    >
      {copy.delegates.delegation.action}
    </Button>
  );
};
