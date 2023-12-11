import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect, useState } from "react";

export function AdvancedDelegateButton({
  delegate,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
}) {
  const openDialog = useOpenDialog();
  const [availableBalance, setAvailableBalance] = useState(null);
  const [isDelegatingToProxy, setIsDelegatingToProxy] = useState(null);
  const [delegatees, setDelegatees] = useState(null);

  useEffect(() => {
    fetchVotingPowerForSubdelegation().then((balance) => {
      setAvailableBalance(balance);
    });
    checkIfDelegatingToProxy().then((isDelegating) => {
      setIsDelegatingToProxy(isDelegating);
    });
    fetchCurrentDelegatees().then((delegatees) => {
      setDelegatees(delegatees);
    });
  }, [
    fetchVotingPowerForSubdelegation,
    checkIfDelegatingToProxy,
    fetchCurrentDelegatees,
  ]);

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        openDialog({
          type: "ADVANCED_DELEGATE",
          params: {
            target: delegate,
            availableBalance,
            isDelegatingToProxy,
            delegatees,
          },
        });
      }}
    >
      Delegate
    </Button>
  );
}
