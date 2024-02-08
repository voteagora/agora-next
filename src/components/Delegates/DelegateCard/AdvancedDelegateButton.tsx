import { useAccount } from "wagmi";
import { Button } from "@/components/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import {
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
} from "@/app/delegates/actions";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";

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

  console.log("delegators", delegators);

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
        openDialog({
          type: "ADVANCED_DELEGATE",
          params: {
            target: delegate.address,
            fetchVotingPowerForSubdelegation,
            checkIfDelegatingToProxy,
            fetchCurrentDelegatees,
            getProxyAddress,
          },
        });
      }}
    >
      Delegate
    </Button>
  );
};
