import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useEffect, useState } from "react";
import { fetchBalanceForDirectDelegation } from "@/app/delegates/actions";

export function DelegateButton({
  full,
  delegateAddress,
}: {
  full: boolean;
  delegateAddress: string;
}) {
  const openDialog = useOpenDialog();
  const [votingPower, setVotingPower] = useState<string | null>(null);

  useEffect(() => {
    fetchBalanceForDirectDelegation(delegateAddress).then((balance) => {
      setVotingPower(balance.toString());
    });
  }, [delegateAddress]);

  return (
    <>
      {votingPower && (
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            openDialog({
              type: "DELEGATE",
              params: { target: delegateAddress, votingPower: votingPower },
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
