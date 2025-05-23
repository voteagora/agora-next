import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { fetchDirectDelegatee } from "@/app/delegates/actions";

export function DelegateButton({
  full,
  delegate,
}: {
  full: boolean;
  delegate: DelegateChunk;
}) {
  const openDialog = useOpenDialog();

  return (
    <UpdatedButton
      type="secondary"
      onClick={(e: any) => {
        e.preventDefault();
        openDialog({
          type: "DELEGATE",
          params: {
            delegate,
            fetchDirectDelegatee,
          },
        });
      }}
      className={full ? "w-full" : undefined}
    >
      Delegate
    </UpdatedButton>
  );
}
