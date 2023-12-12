import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect, useState } from "react";

export function DelegateButton({
  full,
  delegate,
  fetchBalanceForDirectDelegation,
}) {
  const openDialog = useOpenDialog();
  const [votingPower, setVotingPower] = useState(null);

  useEffect(() => {
    fetchBalanceForDirectDelegation().then((balance) => {
      setVotingPower(balance);
    });
  }, [fetchBalanceForDirectDelegation]);

  return (
    <>
      {votingPower && (
        <Button
          onClick={(e) => {
            e.preventDefault();
            openDialog({
              type: "DELEGATE",
              params: { target: delegate, votingPower: votingPower },
            });
          }}
          className={full ? "w-full" : undefined}
        >
          Delegate
        </Button>
      )}
    </>
  );
}
