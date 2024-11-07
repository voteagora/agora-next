import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import {
  fetchDirectDelegatee,
  fetchBalanceForDirectDelegation,
} from "@/app/delegates/actions";

export function UndelegateButton({
  full,
  delegate,
}: {
  full: boolean;
  delegate: DelegateChunk;
}) {
  const openDialog = useOpenDialog();

  return (
    <UpdatedButton
      type="primary"
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "UNDELEGATE",
          params: {
            delegate,
            fetchBalanceForDirectDelegation,
            fetchDirectDelegatee,
          },
        });
      }}
      className={full ? "w-full" : undefined}
    >
      Undelegate
    </UpdatedButton>
  );
}
