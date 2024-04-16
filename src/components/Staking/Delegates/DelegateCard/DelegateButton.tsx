import { Button } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "../DelegateCardList/DelegateCardList";
import {
  fetchDirectDelegatee,
  fetchBalanceForDirectDelegation,
} from "@/app/delegates/actions";

export function DelegateButton({
  full,
  delegate,
}: {
  full: boolean;
  delegate: DelegateChunk;
}) {
  const openDialog = useOpenDialog();

  return (
    <Button
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "DELEGATE",
          params: {
            delegate,
            fetchBalanceForDirectDelegation,
            fetchDirectDelegatee,
          },
        });
      }}
      className={full ? "w-full" : undefined}
    >
      Delegate
    </Button>
  );
}
