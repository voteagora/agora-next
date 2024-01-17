import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import { useAccount } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Delegation } from "@/app/api/delegations/delegation";

type Props = {
  delegate: DelegateChunk;
  fetchVotingPowerForSubdelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  checkIfDelegatingToProxy: (addressOrENSName: string) => Promise<boolean>;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<any>;
  getProxyAddress: (addressOrENSName: string) => Promise<string>;
};

export function AdvancedDelegateButton({
  delegate,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
  delegators,
}: Props & {
  delegators: Delegation[] | null;
}) {
  const { address } = useAccount();

  const isSelfDelegation =
    address?.toLowerCase() === delegate.address?.toLowerCase();

  const isDisabled =
    !!address &&
    !!(
      isSelfDelegation ||
      delegators
        ?.map((delegator) => delegator.from.toLowerCase())
        .includes(delegate.address?.toLowerCase())
    );

  return (
    <TooltipProvider>
      <Tooltip>
        {isDisabled ? (
          <TooltipTrigger>
            <DelegateButton
              delegate={delegate}
              fetchVotingPowerForSubdelegation={
                fetchVotingPowerForSubdelegation
              }
              checkIfDelegatingToProxy={checkIfDelegatingToProxy}
              fetchCurrentDelegatees={fetchCurrentDelegatees}
              getProxyAddress={getProxyAddress}
              isDisabled={isDisabled}
            />
          </TooltipTrigger>
        ) : (
          <DelegateButton
            delegate={delegate}
            fetchVotingPowerForSubdelegation={fetchVotingPowerForSubdelegation}
            checkIfDelegatingToProxy={checkIfDelegatingToProxy}
            fetchCurrentDelegatees={fetchCurrentDelegatees}
            getProxyAddress={getProxyAddress}
            isDisabled={isDisabled}
          />
        )}

        <TooltipContent>
          <p>
            Delegating back to{" "}
            {isSelfDelegation ? "yourself" : "your delegator"} is not supported
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const DelegateButton = ({
  delegate,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
  isDisabled,
}: Props & {
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
