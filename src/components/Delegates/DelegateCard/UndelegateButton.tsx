import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import {
  fetchDirectDelegatee,
  fetchBalanceForDirectDelegation,
} from "@/app/delegates/actions";
import Tenant from "@/lib/tenant/tenant";

export function UndelegateButton({
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
      type={useNeutral ? "secondary" : "primary"}
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
