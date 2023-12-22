import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import {
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
} from "@/app/delegates/actions";

export function AdvancedDelegateButton({
  delegate,
}: {
  delegate: DelegateChunk;
}) {
  const { address } = delegate;
  const openDialog = useOpenDialog();

  return (
    <>
      <Button
        onClick={(e: any) => {
          e.preventDefault();
          openDialog({
            type: "ADVANCED_DELEGATE",
            params: {
              target: address,
              fetchVotingPowerForSubdelegation: () =>
                fetchVotingPowerForSubdelegation(address),
              checkIfDelegatingToProxy: () => checkIfDelegatingToProxy(address),
              fetchCurrentDelegatees: () => fetchCurrentDelegatees(address),
              getProxyAddress: () => getProxyAddress(address),
            },
          });
        }}
      >
        Delegate
      </Button>
    </>
  );
}
