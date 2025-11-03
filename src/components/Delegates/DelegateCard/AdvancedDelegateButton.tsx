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
            Delegating back to{" "}
            {isSelfDelegation
              ? "yourself"
              : "your direct or indirect delegator"}{" "}
            is not supported
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
      Delegate
    </Button>
  );
};
