import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { fetchDirectDelegatee } from "@/app/delegates/actions";
import Tenant from "@/lib/tenant/tenant";

export function DelegateButton({
  full,
  delegate,
}: {
  full: boolean;
  delegate: DelegateChunk;
}) {
  const openDialog = useOpenDialog();
  const { ui } = Tenant.current();
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  return (
    <UpdatedButton
      type={useNeutral ? "primary" : "secondary"}
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
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
