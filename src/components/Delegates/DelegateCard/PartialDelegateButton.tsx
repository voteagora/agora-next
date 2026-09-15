import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { fetchCurrentDelegatees } from "@/app/delegates/actions";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  full: boolean;
  delegate: DelegateChunk;
  isConnectedAccountDelegate: boolean;
}

export const PartialDelegateButton = ({
  full,
  delegate,
  isConnectedAccountDelegate,
}: Props) => {
  const { ui } = Tenant.current();
  const copy = ui.copy;
  const openDialog = useOpenDialog();

  return (
    <UpdatedButton
      type={isConnectedAccountDelegate ? "primary" : "secondary"}
      onClick={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        openDialog({
          type: "PARTIAL_DELEGATE",
          params: {
            delegate,
            fetchCurrentDelegatees,
          },
        });
      }}
      className={full ? "w-full" : undefined}
    >
      {isConnectedAccountDelegate
        ? copy.delegates.delegation.undelegateAction
        : copy.delegates.delegation.action}
    </UpdatedButton>
  );
};
