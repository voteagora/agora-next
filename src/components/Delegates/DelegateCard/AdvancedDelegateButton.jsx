import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect, useState } from "react";

export function AdvancedDelegateButton({
  delegate,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
}) {
  const openDialog = useOpenDialog();
  const [availableBalance, setAvailableBalance] = useState(null);
  const [isDelegatingToProxy, setIsDelegatingToProxy] = useState(null);
  const [delegatees, setDelegatees] = useState(null);
  const [proxyAddress, setProxyAddress] = useState(null);

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
    getProxyAddress().then((proxyAddress) => {
      setProxyAddress(proxyAddress);
    });
  }, [
    fetchVotingPowerForSubdelegation,
    checkIfDelegatingToProxy,
    fetchCurrentDelegatees,
    getProxyAddress,
  ]);

  return (
    <>
      {availableBalance !== null &&
        isDelegatingToProxy !== null &&
        delegatees !== null &&
        proxyAddress !== null && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              openDialog({
                type: "ADVANCED_DELEGATE",
                params: {
                  target: delegate,
                  availableBalance,
                  isDelegatingToProxy,
                  proxyAddress: proxyAddress,
                  delegatees,
                },
              });
            }}
          >
            Delegate
          </Button>
        )}
    </>
  );
}
