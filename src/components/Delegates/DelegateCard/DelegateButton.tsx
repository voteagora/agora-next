import { DSButton } from "@/components/design-system/Button";
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
    <DSButton
      variant="secondary"
      size="small"
      fullWidth={full}
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
    >
      Delegate
    </DSButton>
  );
}
